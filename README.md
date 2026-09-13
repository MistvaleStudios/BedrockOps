# BedrockOps 🚀

A fast, modern CLI wrapper for Minecraft Bedrock Dedicated Server (BDS) built with TypeScript and Bun. BedrockOps intercepts standard I/O to deliver clean, colorized terminal output, operational management commands, and server lifecycle automation.

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/badge/Discord-Mistvale%20Studios-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.gg/mistvale)

---

## ✨ Features

* 🎨 **Truecolor Terminal UI:** Fully parses Bedrock's extended `§` formatting codes (including material colors like Quartz and Netherite) into ANSI RGB, while stripping clutter and fixing vanilla color-bleed artifacts.
* ⚡ **Interactive CLI:** Intercepts typed console inputs for real-time formatting (`CMD | Console`) and seamlessly passes standard commands (e.g., `say`, `stop`) directly to the BDS process.
* 🛡️ **Process Watchdog:** Automatically monitors server health, clears the console on reboots, and handles graceful restarts on crash (Code 5) or freeze.
* 🔄 **Safe Auto-Updater:** Queries Mojang's backend API for the latest BDS releases. Automatically backs up configurations and resource packs, utilizes a lock-safe rollback system to prevent Windows `EPERM` corruption, and cleanly deploys updates.
* 🏎️ **Powered by Bun:** Near-instant execution, modular native TypeScript architecture, and low memory overhead.

---

## 📋 Prerequisites

* [Bun](https://bun.sh/) (v1.0.0 or higher)
* Minecraft Bedrock Dedicated Server executable (`bedrock_server` or `bedrock_server.exe`)

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MistvaleStudios/BedrockOps.git
cd BedrockOps
bun install
```

### 2. Configuration

Copy the example configuration file:

```bash
cp config.example.json config.json
```

Update `config.json` with your server executable settings:

```json
{
  "serverPath": "./bedrock_server",
  "executable": "./bedrock_server.exe",
  "autoRestartOnCrash": true,
  "logTimestamps": true
}
```

### 3. Running BedrockOps

Start in development mode:

```bash
bun run dev
```

Compile a standalone binary:

```bash
bun build --compile --minify --sourcemap ./src/index.ts --outfile bedrockops
```

---

## 🕹️ Built-in Commands

BedrockOps introduces custom commands directly alongside standard BDS console inputs:

| Command | Description |
| :--- | :--- |
| `ops help` | Displays all BedrockOps custom commands |
| `ops restart` | Sends player warnings, gracefully shuts down BDS, clears the terminal, and restarts the process |
| `ops update` | Safeguards configurations, fetches the newest BDS release from Mojang's API, and automatically applies the update |
| `ops status` | Displays process uptime, wrapper RAM usage, and system health |

*All standard vanilla commands (e.g., `say`, `kick`, `stop`) pass through cleanly to the BDS process.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  Maintained by <a href="https://github.com/MistvaleStudios">Mistvale Studios</a>
</div>
