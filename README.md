# Vexa

Vexa is a local, open-source AI app builder powered by the BMAD (Business Model Analysis & Design) protocol. It's fast, private, and fully under your control — like Lovable, v0, or Bolt, but running right on your machine with enterprise-grade development workflows.

[![Image](https://github.com/user-attachments/assets/f6c83dfc-6ffd-4d32-93dd-4b9c46d17790)](http://vexa.dev/)

More info coming soon at: http://vexa.dev/

## 🚀 Features

- ⚡️ **Local & Private**: Fast, secure and no lock-in
- 🛠 **Bring your own keys**: Use your own AI API keys — no vendor lock-in
- 🖥️ **Cross-platform**: Easy to run on Mac or Windows
- 🎯 **BMAD Protocol**: Structured development pipeline with validation gates
- 🔒 **Enterprise Ready**: Built-in sanitization, LGPD compliance, and security features
- 🧩 **Gateway LLM**: Unified interface supporting multiple AI providers via OpenRouter
- 📊 **Observability**: Built-in OpenTelemetry integration for monitoring and debugging
- 🔍 **Smart Context**: Automatic code understanding and context management

## 📋 Architecture Overview

Vexa integrates:
- **Fork customizado do Dyad**: Enhanced AI app builder with BMAD protocol
- **Gateway LLM**: Proxy layer with GLM-4.5 via OpenRouter integration
- **Sanitization System**: LGPD compliance and proprietary information protection
- **Claude Code Integration**: Hooks and configurations for AI-assisted development

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Git
- API key for OpenRouter or other AI providers

### Installation

```bash
# Clone the repository
git clone https://github.com/Robertohsantos/vexa-dyad.git
cd vexa-dyad

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the application
npm start
```

## 📁 Project Structure

```
vexa-dyad/
├── .claude/              # Claude Code configurations and hooks
├── docs/                 # Documentation
│   ├── api/             # API specifications
│   ├── guides/          # User guides
│   ├── policies/        # Security and usage policies
│   └── protocols/       # BMAD protocol documentation
├── src/                  # Source code
│   ├── gateway/         # LLM gateway implementation
│   └── ...              # Dyad application code
├── package.json
└── README.md
```

## 📦 Download

No sign-up required. Just download and go.

### 👉 Download coming soon

## 🤝 Community

Join our growing community of AI app builders!

## 🛠️ Contributing

**Vexa** is open-source (Apache 2.0 licensed), based on the original [Dyad](https://github.com/dyad-sh/dyad) project.

If you're interested in contributing to Vexa, please read our [contributing](./CONTRIBUTING.md) doc.

## 📖 Documentation

- [Implementation Plan](./IMPLEMENTATION.md) - Detailed project roadmap
- [BMAD Protocol](./docs/protocols/bmad.md) - Business Model Analysis & Design protocol
- [Security](./docs/SECURITY.md) - Security guidelines and practices
- [API Documentation](./docs/api/) - Gateway and API specifications

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
