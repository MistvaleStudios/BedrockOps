# BedrockOps 🚀

A fast, modern CLI wrapper for Minecraft Bedrock Dedicated Server (BDS) built with TypeScript and Bun. BedrockOps intercepts standard I/O to deliver clean, colorized terminal output, operational management commands, and server lifecycle automation.

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/badge/Discord-Mistvale%20Studios-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.gg/mistvale)

---

## ✨ Features

* 🎨 **Formatted Logging:** Strips clutter and injects structured, colorized output with explicit log levels (`INFO`, `WARN`, `ERROR`).
* ⚡ **Custom Commands:** Adds management controls (`restart`, `update`, `status`) directly to the console without modifying server binaries.
* 🛡️ **Process Watchdog:** Automatically monitors server health and handles graceful reboots on crash or freeze.
* 🏎️ **Powered by Bun:** Near-instant execution, native TypeScript support, and low memory overhead.

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
  "serverPath": "./bedrock-server",
  "executable": "bedrock_server.exe",
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
| `ops restart` | Sends player warnings, shuts down BDS, and restarts the process |
| `ops update` | Checks for and downloads the newest BDS release from Mojang |
| `ops status` | Displays process uptime, RAM usage, and active player counts |

*All standard vanilla commands (e.g., `say`, `kick`, `stop`) pass through cleanly to the BDS process.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  Maintained by <a href="https://github.com/MistvaleStudios">Mistvale Studios</a>
</div>
