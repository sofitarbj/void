<div align="center">

  <img src="./brand/codeenfull.png" alt="Codeen IDE" width="480" />

  <p><strong>Beyond Code Completion</strong></p>
  <p><em>An Agentic AI IDE designed for autonomous software engineering, systemic multi-file reasoning, and zero-latency technical workflows.</em></p>

  <p>
    <a href="https://github.com/sofitarbj/void/releases"><img src="https://img.shields.io/github/v/release/sofitarbj/void?color=00dc82&label=Release&logo=github&style=flat-square" alt="GitHub Release"></a>
    <a href="https://github.com/sofitarbj/void/blob/main/LICENSE.txt"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"></a>
    <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-black?style=flat-square" alt="Platform">
    <img src="https://img.shields.io/badge/Privacy-Zero--Telemetry-00dc82?style=flat-square" alt="Zero-Telemetry">
  </p>

  <p>
    <a href="#key-features">Key Features</a> •
    <a href="#download--installation">Download</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#building-from-source">Building from Source</a> •
    <a href="#architecture">Architecture</a>
  </p>

</div>

---

## 🌟 Overview

**Codeen IDE** is a modern, sovereign, privacy-first AI IDE engineered from the core for autonomous software engineering. Built as a high-performance fork of VS Code with deep AI integration, Codeen connects directly from your machine to any model provider — cloud or local — with **strictly zero telemetry retention**.

Unlike traditional autocomplete plugins or cloud-locked editors, Codeen orchestrates entire engineering loops: planning multi-file changes, executing terminal tools, verifying tests, inspecting git diffs, and applying code modifications directly into active Monaco editor buffers with zero friction.

---

## 🚀 Key Features

### 1. 🛡️ Sovereign & Zero-Telemetry Architecture
- **Direct Client-to-Provider Communication**: API requests go directly from your local environment to your LLM provider. No intermediary relay servers.
- **BYOK (Bring Your Own Key)**: Native support for Anthropic Claude 3.7, OpenAI, Google Gemini 2.0, DeepSeek, OpenRouter, and more.
- **Offline & Local Freedom**: 100% air-gapped local execution via Ollama, LM Studio, vLLM, and Apple MLX Metal.
- **Encrypted Local Keychain**: Credentials and tokens are securely encrypted in your operating system's native keychain.

### 2. ⚡ Native Zero-Friction Diff (Fast Apply)
- Streams edits straight into active Monaco editor buffers.
- Review, accept, or reject changes hunk-by-hunk via intuitive keyboard shortcuts.
- Eliminates manual copy-pasting of AI-generated snippets.

### 3. 🧠 Persistent Memory & Knowledge Items (KI)
- Cross-session memory system preserving technical decisions, architecture patterns, and repository rules.
- Automatic learning and adaptation to team conventions and project constraints.

### 4. 🛠️ Autonomous Agent & Tool Runtime
- Autonomous planning loops orchestrating terminal commands, multi-file inspection, test suites, and git operations.
- Full compatibility with the Model Context Protocol (MCP) and custom agent skills.

### 5. 🎙️ Zero-Cloud Voice Dictation
- Offline, zero-latency code dictation powered by a local WASM Whisper engine.
- Speak naturally to write code, comments, and prompts without sending audio data to external servers.

### 6. 🔄 Seamless One-Click IDE Migration
- Instantly import your extensions, keybindings, settings, and snippets from **VS Code**, **Cursor**, and **Windsurf**.

---

## 📥 Download & Installation

Pre-built binaries are automatically compiled and published via GitHub Actions.

| Platform | Format | Status |
| :--- | :--- | :--- |
| **Windows (x64)** | `.exe` (User Installer) | [Download Latest Release](https://github.com/sofitarbj/void/releases/latest) |
| **Linux (x64)** | `.deb` / `.tar.gz` | Planned |
| **macOS (Apple Silicon & Intel)** | `.dmg` | Planned |

### In-App Auto-Updates
Codeen IDE automatically checks for updates in the background. When a new release is available on GitHub, an update indicator appears in the status bar, allowing you to update and restart in one click.

---

## ⚡ Quick Start

1. **Launch Codeen IDE**: On first launch, the streamlined onboarding assistant guides you through:
   - Selecting your visual theme (including *Obsidian Precision*, *Midnight Eclipse*, *Vesper Monochrome*, or *Codeen Pure Light*).
   - Choosing your AI engine (free community tiers, cloud API keys, or local Ollama).
   - Optional migration from your previous IDE.
2. **Open the Agent Sidebar**: Press `Ctrl+L` (or `Cmd+L`) to chat with the Codeen Agent.
3. **Trigger Quick Edit**: Press `Ctrl+K` (or `Cmd+K`) anywhere in the editor to make inline modifications.

---

## 🔨 Building from Source

### Prerequisites
- **Node.js**: v20.x (`LTS`)
- **Python**: 3.10+ (for native compilation)
- **C/C++ Build Tools**: Visual Studio Build Tools (Windows) / Xcode CLI Tools (macOS) / `build-essential` (Linux)
- **Git**

### Step-by-Step Build

```bash
# 1. Clone the repository
git clone https://github.com/sofitarbj/void.git codeen-ide
cd codeen-ide

# 2. Install root dependencies
npm install

# 3. Build React UI components
cd src/vs/workbench/contrib/void/browser/react
npm install
npm run buildreact
cd ../../../../../..

# 4. Compile TypeScript
npm run compile

# 5. Launch Codeen in development mode
./scripts/code.bat        # Windows
./scripts/code.sh         # Linux / macOS
```

### Packaging Windows Installer

```bash
npx gulp vscode-win32-x64
npx gulp vscode-win32-x64-user-setup
```
The compiled installer will be available under `.build/win32-x64/user-setup/`.

---

## 🏛️ Architecture & Customization

Codeen extends the VS Code platform with specialized services:

- `IVoidSettingsService`: Sovereign configuration & BYOK keychain management.
- `IVoidMemoryService`: Cross-session memory and Knowledge Item indexing.
- `IVoidBudgetService`: Sub-token context pruning & cost optimization.
- `ITokenUsageService`: Real-time session token consumption and budget tracking.
- `IVoidUpdateService`: In-app GitHub release update orchestration.
- `IToolsService` & `MCP`: Autonomous tool discovery, sandboxed execution, and terminal management.

---

## 📄 License

Codeen IDE is open source and licensed under the [MIT License](LICENSE.txt).

---

<div align="center">
  <p>Crafted for engineers who value sovereignty, precision, and speed.</p>
</div>
