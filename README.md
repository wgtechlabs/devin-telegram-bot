# Devin AI — Telegram Bot

![GitHub Repo Banner](https://ghrb.waren.build/banner?header=Devin+AI+%E2%80%94+Telegram+Bot+%21%5Btelegram%5D&subheader=Bring+your+AI+software+engineer+to+your+Telegram&bg=013B84-016EEA&color=FFFFFF&headerfont=Inter&subheaderfont=Kinewave&watermarkpos=bottom-right)
<!-- Created with GitHub Repo Banner by Waren Gonzaga: https://ghrb.waren.build -->

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-v4-2AABEE.svg)](https://telegraf.js.org/)
[![Node.js](https://img.shields.io/badge/NodeJS-Runtime-green.svg)](https://nodejs.org/)

Devin AI — Telegram Bot is a self-hosted TypeScript integration that brings Devin AI into Telegram. Start a session from chat commands, continue the conversation in the same chat, and keep active session state persisted in PostgreSQL for restart recovery.

## Features

- **Telegram Commands** — `/devin`, `/reply`, `/stop`, `/sessions`, `/template`
- **In-Chat Continuation** — Non-command text in a chat with an active session is forwarded to Devin
- **Adaptive Polling** — Fast updates during early activity, then slower polling
- **Template Prompts** — Built-in templates for common tasks
- **PR Notifications** — Shares pull request URLs from Devin sessions
- **Restart Recovery** — Active session state survives restarts via PostgreSQL
- **Customizable Bot Name** — Set `BOT_NAME` to customize user-facing bot text
- **Self-Hosted** — Full control of runtime and deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.8+ |
| Runtime | Node.js 22+ |
| Framework | Telegraf v4 |
| Toolchain | Bun |
| Linter | Biome |
| Testing | Bun Test |
| Storage | PostgreSQL (`pg`) |

## Prerequisites

- **Node.js** 22+
- **Bun** 1.0+
- A **Telegram bot token** from [@BotFather](https://t.me/BotFather)
- A **Devin API key** (starts with `apk_` or `cog_`)
- **PostgreSQL** 14+ (for session persistence and restart recovery)

## Quick Start

### 1. Install dependencies

```bash
git clone https://github.com/wgtechlabs/devin-telegram-bot.git
cd devin-telegram-bot
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DATABASE_URL=postgres://postgres:postgres@localhost:5432/devin_telegram_bot

DEVIN_API_KEY=apk_your_devin_api_key_here
# Required when DEVIN_API_KEY starts with cog_
# DEVIN_ORG_ID=org_your_org_id_here

# Optional
# BOT_NAME=Devin
LOG_LEVEL=info
```

### 3. Run the bot

```bash
# Development (watch mode)
bun run dev

# Production
bun run build
bun run start
```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `/devin <task>` | Start a new Devin session |
| `/reply <message>` | Send a follow-up message to the active session |
| `/stop` | Terminate the active session in the chat |
| `/sessions` | List all active tracked sessions |
| `/template <id> <details>` | Start a session from a pre-built template |

### Templates

| Template ID | Description |
|-------------|-------------|
| `open-pr` | Write code and open a pull request |
| `code-review` | Review an existing pull request |
| `write-tests` | Add test coverage |
| `fix-bug` | Investigate and fix a bug |

## Architecture

```text
src/
├── index.ts
├── config.ts
├── commands/
│   ├── index.ts
│   ├── devin.ts
│   ├── devin-reply.ts
│   ├── devin-stop.ts
│   ├── devin-sessions.ts
│   └── devin-template.ts
├── handlers/
│   └── message.ts
├── services/
│   ├── devin-api.ts
│   ├── logger.ts
│   ├── session-manager.ts
│   └── state-store.ts
├── templates/
│   └── index.ts
└── types/
    └── index.ts
```

## Development

```bash
bun run lint
bun run typecheck
bun test
bun run build
```

## Workflow

This project follows [Clean Flow](https://github.com/wgtechlabs/clean-flow), [Clean Commit](https://github.com/wgtechlabs/clean-commit), and [Clean Labels](https://github.com/wgtechlabs/clean-labels) conventions.

- **Branches**: `main` (stable) + `dev` (integration) + feature branches
- **Branch Naming**: Use `feature/*`, `fix/*`, `docs/*`, `chore/*`, `test/*`, `refactor/*`
- **Merge Strategy**: `feature/*`, `fix/*`, `docs/*`, `chore/*`, `test/*`, `refactor/*` squash-merge into `dev`, `dev` merges into `main`
- **Commit Format**: `<emoji> <type>: <description>` (see Clean Commit)
- **Labels**: 21 standardized labels across 5 categories (see Clean Labels)

## 🐛 Issues

Please report issues by [creating a new issue](https://github.com/wgtechlabs/devin-telegram-bot/issues/new/choose).

## 🙏 Sponsor

Like this project? Leave a star! ⭐⭐⭐⭐⭐

Want to support my work and get some perks? [Become a sponsor](https://github.com/sponsors/warengonzaga)! 💖

Or, you just love what I do? [Buy me a coffee](https://buymeacoffee.com/warengonzaga)! ☕

Recognized my open-source contributions? [Nominate me](https://stars.github.com/nominate) as GitHub Star! 💫

## 📋 Code of Conduct

This project follows [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines).

## 📃 License

This project is licensed under [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

## 📝 Author

This project is created by [Waren Gonzaga](https://github.com/warengonzaga), with the help of awesome [contributors](https://github.com/wgtechlabs/devin-telegram-bot/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/devin-telegram-bot)](https://github.com/wgtechlabs/devin-telegram-bot/graphs/contributors)

---

💻💖☕ by [Waren Gonzaga](https://warengonzaga.com) | [YHWH](https://www.youtube.com/watch?v=VOZbswniA-g) 🙏 - Without _Him_, none of this exists, _even me_.
