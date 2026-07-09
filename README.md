# Devin AI — Telegram Bot

![GitHub Repo Banner](https://ghrb.waren.build/banner?header=Devin+AI+%E2%80%94+Telegram+Bot+%21%5Btelegram%5D&subheader=Bring+your+AI+software+engineer+to+your+Telegram&bg=013B84-016EEA&color=FFFFFF&headerfont=Inter&subheaderfont=Kinewave&watermarkpos=bottom-right)
<!-- Created with GitHub Repo Banner by Waren Gonzaga: https://ghrb.waren.build -->

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-v4-2AABEE.svg)](https://telegraf.js.org/)
[![Node.js](https://img.shields.io/badge/NodeJS-Runtime-green.svg)](https://nodejs.org/)
[![BunJS](https://img.shields.io/badge/BunJS-Toolchain-F9F1E1.svg)](https://bun.sh/)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/wgtechlabs/devin-telegram-bot)
[![GitHub Packages](https://img.shields.io/badge/GitHub%20Packages-181717?logo=github&logoColor=white)](https://github.com/wgtechlabs/devin-telegram-bot/pkgs/container/devin-telegram-bot)

Devin AI — Telegram Bot is a self-hosted TypeScript integration that brings Devin AI into Telegram. Start a session from chat commands, continue the conversation in the same chat, and keep active session state persisted in PostgreSQL for restart recovery.

## Deploy Your Own

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/devin-ai-telegram-bot?referralCode=dTwT-i&utm_medium=integration&utm_source=template&utm_campaign=generic)

Deploy your own copy and support the project. 💖

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

## 💬 Community Discussions

Join our community discussions to get help, share ideas, and connect with other users:

- 📣 **[Announcements](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/announcements)**: Official updates from the maintainer
- 📸 **[Showcase](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/showcase)**: Show and tell your implementation
- 💖 **[Wall of Love](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/wall-of-love)**: Share your experience with the bot
- 🛟 **[Help & Support](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/help-support)**: Get assistance from the community
- 🧠 **[Ideas](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/ideas)**: Suggest new features and improvements

## 🛟 Help & Support

Need help? Check our [Help & Support](https://github.com/wgtechlabs/devin-discord-bot/discussions/categories/help-support) discussions or [create a new issue](https://github.com/wgtechlabs/devin-discord-bot/issues/new/choose).

## 🎯 Contributing

**Important**: All pull requests must be submitted to the `dev` branch. PRs to `main` will be automatically rejected.

Contributions are welcome! Your code must pass `bun run typecheck` before merging.

## 💖 Sponsors

Like this project? **Leave a star**! ⭐⭐⭐⭐⭐

There are several ways you can support this project:

- [Become a sponsor](https://github.com/sponsors/wgtechlabs) and get some perks! 💖
- [Buy me a coffee](https://buymeacoffee.com/wgtechlabs) if you just love what we do! ☕

## ⭐ GitHub Star Nomination

Found this project helpful? Consider nominating me **(@warengonzaga)** for the [GitHub Star program](https://stars.github.com/nominate/)! This recognition supports ongoing development of this project and [my other open-source projects](https://github.com/warengonzaga?tab=repositories). GitHub Stars are recognized for their significant contributions to the developer community — your nomination makes a difference and encourages continued innovation!

## 📃 License

This project is licensed under the [GNU General Public License v3.0](https://opensource.org/licenses/GPL-3.0).

## 📝 Author

This project is created by **[Waren Gonzaga](https://github.com/warengonzaga)** under [WG Technology Labs](https://github.com/wgtechlabs), with the help of awesome [contributors](https://github.com/wgtechlabs/devin-discord-bot/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/devin-discord-bot)](https://github.com/wgtechlabs/devin-discord-bot/graphs/contributors)

---

💻💖☕ by [Waren Gonzaga](https://warengonzaga.com) | [YHWH](https://www.youtube.com/watch?v=VOZbswniA-g) 🙏 - Without _Him_, none of this exists, _even me_.
