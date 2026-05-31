import "./App.css";

const features = [
  "Groq Ultra Fast AI",
  "Private Ollama Models",
  "RAG + pgvector",
  "MCP Tools",
  "Voice & Vision",
  "Docker Ready",
];

const commands = [
  "/start",
  "/ask",
  "/private",
  "/tools",
  "/imagine",
  "/calendar",
];

export default function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">⚡ Satpayev AI Bot</div>

        <nav>
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#stack">Stack</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <button
          className="nav-btn"
          onClick={() =>
            window.open("https://github.com/ElooKK/Bishsumbot")
          }
        >
          GitHub
        </button>
      </header>

      <section className="hero">
        <div className="hero-left">
          <div className="badge">AI • Telegram • RAG • Ollama</div>

          <h1>
            Умный Telegram бот
            <span> для студентов</span>
          </h1>

          <p>
            Telegram AI Assistant с Groq, Ollama, RAG, MCP Tools,
            документами, голосом и генерацией изображений.
          </p>

          <div className="hero-buttons">
            <button
              className="primary"
              onClick={() =>
                window.open("https://github.com/ElooKK/Bishsumbot")
              }
            >
              🚀 Open Project
            </button>

            <button
              className="secondary"
              onClick={() =>
                document
                  .getElementById("features")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="chat-window">
            <div className="chat-header">
              Telegram AI Session
            </div>

            <div className="user-msg">
              Объясни документ по AI
            </div>

            <div className="bot-msg">
              Я проанализировал PDF и подготовил
              краткое объяснение ключевых идей.
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <h2>Возможности</h2>

        <div className="grid">
          {features.map((item) => (
            <div key={item} className="card">
              <h3>{item}</h3>
              <p>
                Современная интеграция для AI
                автоматизации и продуктивности.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="section">
        <h2>Команды бота</h2>

        <div className="commands">
          {commands.map((cmd) => (
            <div className="command" key={cmd}>
              {cmd}
            </div>
          ))}
        </div>
      </section>

      <section id="stack" className="section">
        <h2>Tech Stack</h2>

        <div className="stack">
          <div>React</div>
          <div>Groq</div>
          <div>Ollama</div>
          <div>Docker</div>
          <div>PostgreSQL</div>
          <div>Telegram</div>
        </div>
      </section>

      <section id="pricing" className="section">
        <h2>Pricing</h2>

        <div className="pricing">
          <div className="price-card">
            <h3>Free</h3>
            <p>Для тестирования</p>
            <span>$0</span>
          </div>

          <div className="price-card featured">
            <h3>Pro</h3>
            <p>Полный функционал</p>
            <span>$19</span>
          </div>

          <div className="price-card">
            <h3>Enterprise</h3>
            <p>Для университетов</p>
            <span>Custom</span>
          </div>
        </div>
      </section>

      <footer>
        <h3>Satpayev AI Bot</h3>
        <p>Built with React + Vercel + Groq</p>
      </footer>
    </div>
  );
}