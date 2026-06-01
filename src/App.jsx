import { useState, useRef, useEffect } from "react";
import "./App.css";

const COMMANDS_HELP = {
  "/start": "Перезапустить бота и очистить историю",
  "/help": "Показать список команд",
  "/clear": "Очистить историю диалога",
  "/ask": "Задать вопрос AI: /ask Что такое RAG?",
  "/summarize": "Суммаризировать текст: /summarize [текст]",
  "/translate": "Перевести на русский: /translate [текст]",
  "/imagine": "Описать изображение/промпт: /imagine [описание]",
  "/tools": "Показать доступные инструменты",
  "/private": "Информация о приватных моделях Ollama",
  "/calendar": "Показать ближайшие события (демо)",
};

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 · 70B" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 · 8B Fast" },
  { id: "mixtral-8x7b-32768", label: "Mixtral · 8x7B" },
  { id: "gemma2-9b-it", label: "Gemma 2 · 9B" },
];

function TypingDots() {
  return (
    <div className="typing-dots">
      <span /><span /><span />
    </div>
  );
}

function Message({ msg }) {
  return (
    <div className={`msg-row ${msg.role}`}>
      {msg.role === "bot" && (
        <div className="avatar bot-avatar">⚡</div>
      )}
      <div className={`bubble ${msg.role}`}>
        {msg.typing ? <TypingDots /> : (
          <span dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
        )}
        {msg.ts && <div className="ts">{msg.ts}</div>}
      </div>
      {msg.role === "user" && (
        <div className="avatar user-avatar">Я</div>
      )}
    </div>
  );
}

function formatText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

function now() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("groq_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Привет! Я **Satpayev AI Bot** ⚡\n\nЧтобы начать, введи Groq API ключ слева.\nПолучи бесплатно на [console.groq.com](https://console.groq.com)\n\nИли напиши `/help` для списка команд.",
      ts: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const history = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMsg(role, content, typing = false) {
    const msg = { role, content, ts: now(), typing };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  function updateLastBot(content) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy.findLastIndex((m) => m.role === "bot");
      if (last !== -1) copy[last] = { ...copy[last], content, typing: false, ts: now() };
      return copy;
    });
  }

  async function callGroq(userPrompt, systemPrompt = null) {
    if (!apiKey) return "⚠️ Нет API ключа. Введи его в панели слева.";
    const sys = systemPrompt || "Ты полезный AI ассистент Satpayev Bot. Отвечай на языке пользователя. Будь краток и точен.";
    const msgs = [
      { role: "system", content: sys },
      ...history.current.slice(-16),
      { role: "user", content: userPrompt },
    ];
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: msgs, max_tokens: 1024, temperature: 0.7 }),
      });
      const data = await res.json();
      if (data.error) return `❌ Ошибка Groq: ${data.error.message}`;
      return data.choices?.[0]?.message?.content || "❌ Пустой ответ";
    } catch (e) {
      return `❌ Ошибка сети: ${e.message}`;
    }
  }

  async function handleCommand(cmd) {
    const parts = cmd.trim().split(" ");
    const c = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    if (c === "/start") {
      history.current = [];
      setMessages([{ role: "bot", content: "🔄 Бот перезапущен!\n\nЯ **Satpayev AI Bot** — AI ассистент на базе Groq.\n\nВозможности:\n- Ответы на вопросы\n- Суммаризация текстов\n- Перевод\n- Генерация промптов\n- Помощь студентам\n\nНапиши что-нибудь!", ts: now() }]);
      return null;
    }
    if (c === "/clear") {
      history.current = [];
      setMessages([{ role: "bot", content: "🗑️ История очищена. Начинаем заново!", ts: now() }]);
      return null;
    }
    if (c === "/help") {
      const lines = Object.entries(COMMANDS_HELP).map(([k, v]) => `**${k}** — ${v}`).join("\n");
      return `📋 **Доступные команды:**\n\n${lines}`;
    }
    if (c === "/tools") {
      return "🛠️ **Доступные инструменты:**\n\n**Groq API** — быстрый LLM inference\n**RAG + pgvector** — поиск по документам\n**MCP Tools** — внешние инструменты\n**Ollama** — приватные локальные модели\n**Voice** — голосовые запросы\n**Vision** — анализ изображений";
    }
    if (c === "/private") {
      return "🔒 **Приватные модели Ollama:**\n\nOllama позволяет запускать модели локально без передачи данных в интернет.\n\nПоддерживаемые модели:\n- `llama3.2` — быстрый и точный\n- `mistral` — отличный для кода\n- `phi3` — лёгкий и быстрый\n- `deepseek-r1` — логика и рассуждения\n\nНастройка: укажи `OLLAMA_URL` в конфиге бота.";
    }
    if (c === "/calendar") {
      return "📅 **Ближайшие события (демо):**\n\n• 3 июня — Экзамен по AI\n• 5 июня — Сдача курсовой\n• 10 июня — Хакатон Satpayev\n• 15 июня — Летняя сессия\n\n_Подключи Google Calendar для реальных событий._";
    }
    if (c === "/summarize") {
      if (!args) return "ℹ️ Использование: `/summarize [текст для суммаризации]`";
      return await callGroq(args, "Сделай краткое резюме следующего текста на русском языке (2-3 предложения). Выдели только самое важное.");
    }
    if (c === "/translate") {
      if (!args) return "ℹ️ Использование: `/translate [текст на любом языке]`";
      return await callGroq(args, "Переведи на русский язык. Отвечай только переводом, без пояснений.");
    }
    if (c === "/imagine") {
      if (!args) return "ℹ️ Использование: `/imagine [описание сцены]`";
      return await callGroq(args, "Создай детальный профессиональный промпт для генерации изображения по описанию пользователя. Промпт должен быть на английском, включать стиль, освещение, детали.");
    }
    if (c === "/ask") {
      if (!args) return "ℹ️ Использование: `/ask [вопрос]`";
      return await callGroq(args);
    }
    return null;
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    addMsg("user", text);

    // typing indicator
    setMessages((prev) => [...prev, { role: "bot", content: "", typing: true, ts: "" }]);

    let response;
    if (text.startsWith("/")) {
      response = await handleCommand(text);
      if (response === null) { setLoading(false); return; }
    } else {
      history.current.push({ role: "user", content: text });
      response = await callGroq(text);
      if (!response.startsWith("❌") && !response.startsWith("⚠️")) {
        history.current.push({ role: "assistant", content: response });
        if (history.current.length > 20) history.current = history.current.slice(-20);
      }
    }

    updateLastBot(response);
    setLoading(false);
    inputRef.current?.focus();
  }

  function saveKey() {
    const k = keyInput.trim();
    if (!k) return;
    setApiKey(k);
    localStorage.setItem("groq_key", k);
    setKeyInput("");
    setShowKeyPanel(false);
    addMsg("bot", `✅ API ключ сохранён!\nМодель: **${MODELS.find(m => m.id === model)?.label}**\n\nМожешь писать сообщения!`);
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">⚡ Satpayev AI</div>
          <button className="icon-btn" onClick={() => setSidebarOpen(false)} title="Закрыть">✕</button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">API Ключ Groq</div>
          {apiKey ? (
            <div className="key-status">
              <span className="dot green" /> Ключ активен
              <button className="link-btn" onClick={() => { setShowKeyPanel(true); }}>Изменить</button>
            </div>
          ) : (
            <div className="key-status warn">
              <span className="dot red" /> Не задан
            </div>
          )}
          {(!apiKey || showKeyPanel) && (
            <div className="key-panel">
              <input
                type="password"
                placeholder="gsk-..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveKey()}
                className="key-input"
              />
              <button className="save-btn" onClick={saveKey}>Сохранить</button>
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="get-key-link">
                Получить ключ →
              </a>
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Модель</div>
          <select value={model} onChange={e => setModel(e.target.value)} className="model-select">
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Команды</div>
          <div className="cmd-list">
            {Object.keys(COMMANDS_HELP).map(cmd => (
              <button key={cmd} className="cmd-item" onClick={() => { setInput(cmd + " "); inputRef.current?.focus(); }}>
                {cmd}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <a href="https://github.com/ElooKK/Bishsumbot" target="_blank" rel="noreferrer">GitHub</a>
          <span>·</span>
          <span>Groq + React</span>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="chat-main">
        <div className="chat-topbar">
          {!sidebarOpen && (
            <button className="icon-btn" onClick={() => setSidebarOpen(true)} title="Открыть меню">☰</button>
          )}
          <div className="chat-title">
            <div className="bot-pill">
              <span className="dot green" />
              Satpayev AI Bot
            </div>
            <span className="model-badge">{MODELS.find(m => m.id === model)?.label}</span>
          </div>
          <button className="icon-btn" onClick={() => { history.current = []; setMessages([{ role: "bot", content: "🗑️ История очищена!", ts: now() }]); }} title="Очистить">🗑️</button>
        </div>

        <div className="messages">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        <div className="input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Напиши сообщение или /команду..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            disabled={loading}
          />
          <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </main>
    </div>
  );
}
