# AuthorClaw

**The Autonomous AI Writing Agent — An OpenClaw Fork Built for Authors**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org)
[![Security](https://img.shields.io/badge/security-hardened-green.svg)](#security)

AuthorClaw is a security-hardened AI agent purpose-built for fiction and nonfiction authors. Yes, it can write entire books — but that's just the beginning.

**AuthorClaw automates the boring stuff so you can focus on the creative stuff.** It handles book research, marketing competition analysis, file management, beta reading, copy editing, revision assistance, book bible building, story consistency checking, query letter drafting, literary agent research, ad copy generation, email list strategy, and more — all autonomously.

Tell it what you want. It figures out the steps, picks the right skills and tools, and executes.

> **"It's not just a writing tool. It's a writing partner, research assistant, editor, and marketing team rolled into one."**

---

## What Can It Do?

- **Write** — Draft scenes, chapters, and full manuscripts in your voice
- **Research** — Deep dives into genres, markets, historical periods, craft techniques
- **Revise** — Structural editing, pacing analysis, style consistency checks
- **Plan** — Outlines, beat sheets, series bibles, character arcs, world-building
- **Beta Read** — First-reader feedback with specific, actionable notes
- **Market** — Blurbs, ad copy, email sequences, social media content
- **Analyze** — Voice profiling (47 markers), pacing heatmaps, tension mapping
- **Format** — Export manuscripts to agent-ready DOCX, KDP PDF, EPUB, Markdown
- **Manage** — Track projects, word counts, deadlines
- **Listen** — Neural TTS voice engine with 8 author-optimized presets — hear your writing read aloud
- **Ingest Tools** — Read source code of any tool and create a new skill from it

---

## How It Works

1. **You say what you want** — via Telegram, dashboard, or API
2. **AuthorClaw plans the steps** — AI dynamically decomposes your task into executable steps
3. **Skills are auto-selected** — 39 writing skills get injected into each step's context
4. **Work happens autonomously** — each step runs through the AI, output saved to files
5. **Everything is logged** — universal activity feed tracks all agent actions in real-time

```
User: "/project write a full tech-thriller about rogue AI in aviation"

AuthorClaw: "Planning... 12 steps identified"
  Step 1: Develop premise and logline        ✅ (~800 words)
  Step 2: Create character profiles          ✅ (~2,400 words)
  Step 3: Build world and settings           ✅ (~1,800 words)
  Step 4: Create timeline                    ✅ (~1,200 words)
  Step 5: Outline all chapters               ✅ (~3,500 words)
  Step 6: Write Chapter 1                    ✅ (~3,200 words)
  ...
  Step 12: Final assembly + DOCX export      ✅

  "All 12 steps complete! Files saved to workspace/projects/"
```

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Ckokoski/authorclaw.git
cd authorclaw
npm install

# 2. Start AuthorClaw (auto-generates vault key on first run)
npx tsx gateway/src/index.ts

# 3. Open dashboard: http://localhost:3847
#    Home tab → follow the welcome banner
#    Settings tab → paste your Gemini API key → Save
#    (Free tier — the whole book costs $0)

# 4. Home tab chat → "Write me a thriller about rogue AI" → Send
#    OR send /project to your Telegram bot
```

> **First run?** AuthorClaw auto-generates a vault encryption key and saves it to `.env`.
> Your API keys will persist across restarts. For a guided setup, run `bash scripts/setup-wizard.sh`.

See [QUICKSTART.md](QUICKSTART.md) for the full setup guide.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHORCLAW v3 ARCHITECTURE                │
│                                                             │
│  ┌───────────┐   ┌─────────────────┐   ┌────────────────┐  │
│  │ Channels  │   │    Gateway       │   │  AI Router     │  │
│  │           │   │                  │   │                │  │
│  │ Telegram  │──▶│ Auth + Sandbox   │──▶│ Ollama (free)  │  │
│  │ Dashboard │   │ Rate Limiting    │   │ Gemini (free)  │  │
│  │ API       │   │ Injection Detect │   │ DeepSeek ($)   │  │
│  │ WebSocket │   │ Audit Logging    │   │ Claude ($$)    │  │
│  └───────────┘   └─────────────────┘   │ OpenAI ($$)    │  │
│                                         └────────────────┘  │
│  ┌───────────┐   ┌─────────────────┐   ┌────────────────┐  │
│  │ Soul      │   │ Project Engine  │   │ Skills (39)    │  │
│  │           │   │                  │   │                │  │
│  │ SOUL.md   │   │ Dynamic AI Plan │   │ Core (7)       │  │
│  │ STYLE.md  │   │ Novel Pipeline  │   │ Author (17)    │  │
│  │ VOICE.md  │   │ Auto-Execute    │   │ Marketing (4)  │  │
│  │           │   │ DOCX Assembly   │   │ Premium (11)   │  │
│  └───────────┘   └─────────────────┘   └────────────────┘  │
│                                                             │
│  ┌───────────┐   ┌─────────────────┐   ┌────────────────┐  │
│  │ Security  │   │ Smart Agent     │   │ Research Gate  │  │
│  │           │   │                  │   │                │  │
│  │ Vault     │   │ Priority Scoring│   │ Web Search     │  │
│  │ Sandbox   │   │ Self-Improve    │   │ HTML Extraction│  │
│  │ Audit     │   │ Agent Journal   │   │ Domain Allowlist│  │
│  │ Injection │   │ Sub-Projects    │   │ Rate Limiting  │  │
│  └───────────┘   └─────────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Providers

AuthorClaw supports 5 AI providers with tiered routing:

| Provider | Tier | Cost | Best For | Setup |
|----------|------|------|----------|-------|
| Ollama | FREE | $0 | Local, private | Install Ollama, runs at localhost:11434 |
| Google Gemini | FREE | $0 | General writing, planning | Dashboard → Settings → paste Gemini key |
| DeepSeek | CHEAP | ~$0.14/M tokens | Creative writing | Dashboard → Settings → paste DeepSeek key |
| Anthropic Claude | PAID | ~$3/M tokens | Complex reasoning, editing | Dashboard → Settings → paste Anthropic key |
| OpenAI GPT-4o | PAID | ~$2.5/M tokens | Alternative premium | Dashboard → Settings → paste OpenAI key |

Task routing is automatic — planning and research use free models, creative writing uses mid-tier, final editing uses premium (when available).

---

## Telegram Command Center

Connect a Telegram bot to control AuthorClaw from your phone:

| Command | What It Does |
|---------|-------------|
| `/novel [idea]` | Create a full novel pipeline (premise → characters → world → outline → chapters → revision → assembly) |
| `/project [task]` | Plan & auto-execute any task — AuthorClaw figures out the steps |
| `/write [idea]` | Quick writing task (short-form content, scenes, intros) |
| `/projects` | List all projects with status and progress |
| `/status` | Quick status check on what's running |
| `/stop` | Pause the active project immediately |
| `continue` | Resume a paused project |
| `/research [topic]` | Research a topic using Wikipedia + Google Books (allowlisted domains) |
| `/files [folder]` | List output files (numbered for easy `/read` and `/export`) |
| `/read [# or name]` | Preview a file's contents |
| `/export [# or name] [format]` | Export to Word (.docx), HTML, or TXT |
| `/speak [text or #]` | Generate a voice message — text or read a file aloud |
| `/voice [on/off/preset]` | Toggle voice chat responses (all replies become voice + text) |
| `/clean` | View workspace disk usage and clean up old files |

### Example Session

```
You:        /write a short snarky YouTube intro for my channel
AuthorClaw: 📝 On it. Planning "a short snarky YouTube intro"...
AuthorClaw: ✅ Planned 2 steps. Running autonomously...
AuthorClaw: ✅ 1/2: Draft the intro (~400 words)
AuthorClaw: 🎉 All 2 steps complete!

You:        /novel a sci-fi thriller about rogue AI in aviation
AuthorClaw: 📖 Novel pipeline created: 32 steps
            (premise → bible → outline → chapters → revision → assembly)
AuthorClaw: ✅ 1/32: Develop premise (~800 words)
            ⏭ Next: Refine premise...
You:        /stop
AuthorClaw: ⏸ Paused at step 4/32. Say "continue" to resume.

You:        /clean
AuthorClaw: 📊 Workspace Usage: 2.1 MB (67 files)
            📁 projects: 43 files (1.8 MB)
            📁 exports: 2 files (21 KB)
            🧹 /clean projects — delete all project files
```

---

## Dashboard

Open `http://localhost:3847` to access the web dashboard:

- **Home** — Morning briefing, chat with AuthorClaw, quick research, agent report, recent activity feed
- **Projects** — Create, track, and auto-execute writing projects (including full novel pipelines with 30+ steps)
- **Settings** — API keys, AI providers, Ollama, budgets, Telegram, heartbeat, research domains

---

## Voice & Text-to-Speech

AuthorClaw includes a built-in neural voice engine powered by Microsoft Edge TTS — no API keys, no binary installation, no cost.

**8 author-optimized voice presets:**

| Preset | Best For |
|--------|----------|
| `narrator_female` | Most genres — clear, expressive (default) |
| `narrator_male` | Literary fiction, thrillers |
| `narrator_deep` | Epic fantasy, sci-fi, nonfiction |
| `narrator_warm` | Romance, memoir |
| `british_male` | Period pieces, cozy mysteries |
| `british_female` | Elegant literary fiction |
| `storyteller` | Adventure, YA |
| `dramatic` | Action, thriller, horror |

**Telegram voice features:**
- `/speak Hello world` — Generate and send a voice message
- `/speak narrator_deep In a world...` — Use a specific voice
- `/speak 3` — Read file #3 from your last `/files` listing aloud
- `/voice on` — Toggle voice mode (all chat replies become voice + text)
- `/voice narrator_deep` — Set voice mode with a specific preset
- "Read that back" — Re-read the last response as voice

**API:** `POST /api/audio/generate` with `{ text, voice, rate, pitch, volume }`

Audio files are auto-cleaned after 24 hours. Use `/clean audio` to clear them manually.

---

## Dynamic Task Planning

When you give AuthorClaw a task, it doesn't use hardcoded templates. Instead:

1. The AI receives a catalog of all available skills (with descriptions and triggers)
2. The AI receives the list of Author OS tools
3. The AI dynamically plans the right number of steps, picks the right skills (39 and counting) for each
4. Each step is executed with that skill's full content injected into the AI's context
5. Results from earlier steps are chained into later steps for continuity

If AI planning fails, the system falls back to template-based planning (8 project types with pre-built step sequences). For novel pipelines, a specialized template generates 30+ steps covering premise, book bible, outline, chapter writing (with word count targets), revision, and final DOCX assembly.

---

## Skills

Skills are markdown files that teach the AI how to handle specific writing tasks:

**Core Skills (7):** full-pipeline, preference-learner, prompt-optimizer, self-improve, skill-acquisition, error-recovery, after-action-review

**Author Skills (17):** premise, outline, write, revise, book-bible, series-bible, dialogue, style-clone, research, nonfiction-research, format, beta-reader, query-letter, manuscript-hub, market-research, promote, ingest-tool

**Marketing Skills (4):** blurb-writer, ad-copy, social-media, email-list

**Tool Ingestion:** AuthorClaw can read source code of any tool and generate a new skill from it. Just say "create a skill from this code" or use `POST /api/tools/ingest`.

Skills are automatically matched by keyword triggers and injected into the AI's context. A full reference with descriptions and example trigger keywords is available in `workspace/SKILLS.txt`.

### Premium Skills Bundle

The **AuthorClaw Premium Skills Bundle** adds 11 advanced capabilities — available on our [Ko-Fi store](https://ko-fi.com/s/4e24f1dfa5):

- **Ghostwriter Pro** — A full-stack AI writing partner. Scene generation with deep write mode and multi-pass revision. Pacing analysis, tension mapping, dialogue polish, and style consistency checks.
- **Series Architect** — Multi-book series planning and continuity engine. Story thread tracker, timeline management, character arc plotting across books.
- **Book Launch Machine** — Complete 60-day book launch automation. Ad copy factory (Amazon, Facebook, BookBub), email marketing sequences, social media content calendar.
- **First Chapter Hook** — Analyze and rewrite first chapters for maximum reader retention using genre-specific hook patterns.
- **Comp Title Finder** — Find and analyze comparable titles for query letters, marketing, and positioning strategy.
- **Dictation Cleanup** — Speech-to-text cleanup that preserves your voice. Cleans up dictation artifacts, fixes punctuation, polishes prose.
- **Sensitivity Reader** — AI-assisted sensitivity review for representation, cultural accuracy, and potential reader concerns.
- **Read Aloud** — Text-to-speech for manuscripts using the built-in Edge TTS neural voice engine.
- **Narrative Voice Coach** — Deep coaching for developing a distinctive, consistent narrative voice.
- **Deep Voice Analysis** — Advanced 47-marker voice analysis engine for building comprehensive Voice Profiles.
- **Writing Secrets Bridges** — Import Book Bible Engine data and Author Workflow Engine sequences into AuthorClaw.

Install: copy the skill folders to `skills/premium/` and restart. See `skills/premium/README.md` for details.

---

## Project Structure

```
authorclaw/
├── gateway/src/          # Core application
│   ├── index.ts          # Main entry point (gateway, handlers, bridges)
│   ├── ai/router.ts      # Multi-provider AI routing
│   ├── api/routes.ts     # REST API endpoints
│   ├── bridges/          # Telegram, Discord bridges
│   ├── security/         # Vault, audit, sandbox, injection detection
│   ├── services/         # Memory, soul, projects, research, activity log, heartbeat
│   └── skills/loader.ts  # Skill loading and matching
├── skills/               # Skill definitions (SKILL.md files)
│   ├── core/             # System skills (full-pipeline, etc.)
│   ├── author/           # Writing skills (17)
│   ├── marketing/        # Marketing skills (4)
│   └── premium/          # Premium skill packs (11)
├── dashboard/dist/       # Web dashboard (single HTML file)
├── workspace/            # Working directory
│   ├── soul/             # SOUL.md, STYLE-GUIDE.md, VOICE-PROFILE.md
│   ├── memory/           # Conversations, book bible, summaries
│   ├── projects/         # Project output files organized by project
│   ├── research/         # Research output files
│   ├── .agent/           # Agent journal, self-improve logs
│   ├── audio/            # Generated TTS voice files (auto-cleaned after 24hr)
│   ├── SKILLS.txt        # Full skill reference with trigger keywords
│   ├── .activity/        # Universal activity log (JSONL)
│   └── .audit/           # Security audit log (JSONL)
├── config/               # Configuration files
│   ├── default.json      # Main config
│   ├── .vault/           # Encrypted API key storage
│   └── research-allowlist.json  # Approved research domains
└── scripts/              # Utility scripts
```

---

## Security

AuthorClaw security features:

- **Vault**: AES-256-GCM encrypted credential storage (scrypt KDF)
- **Sandbox**: Workspace-only file access enforcement
- **Audit**: Daily JSONL logs with categories (message, security, error, connection)
- **Injection Detection**: Pattern matching for prompt injection attempts
- **Rate Limiting**: Per-channel rate limits
- **Research Gate**: Real web search + HTML extraction, 50+ allowlisted domains, 60 req/hr rate limit
- **Localhost Only**: Server binds to 127.0.0.1 (no external access)

---

## Deployment — Defense in Depth

> **We strongly recommend running AuthorClaw inside a VM or VPS with Docker.** Your API keys, manuscripts, and creative work deserve real protection. Defense in depth means multiple security layers — not just application-level security.

### Recommended: VPS + Docker + VPN (Best Security)

This is the gold standard for always-on, secure operation:

1. **Rent a VPS** ($5-6/month) — Hetzner, DigitalOcean, or Linode
2. **Install Docker** — containerizes AuthorClaw with strict resource limits
3. **Install Tailscale** — free mesh VPN, no public ports exposed
4. **Deploy AuthorClaw** — `docker compose up -d`

```bash
# On your VPS:
curl -fsSL https://get.docker.com | sh
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# Clone and deploy:
git clone https://github.com/Ckokoski/authorclaw.git
cd authorclaw/docker
docker compose up -d
```

**Why this matters:**
- VPS isolates AuthorClaw from your personal machine
- Docker containers limit file access and resource usage
- Tailscale VPN means zero public ports — only your devices can connect
- Telegram works 24/7 even when your computer is off
- Your manuscripts and API keys never leave the VPS

### Alternative: Local VM (Good Security)

If you prefer running locally:

1. **VirtualBox/UTM** — free VM software
2. **Ubuntu 24.04** — lightweight Linux inside the VM
3. **Run AuthorClaw natively** or with Docker inside the VM

```bash
# In your VM:
bash /media/sf_authorclaw-transfer/run.sh
```

**Why a VM helps:**
- Isolates AuthorClaw from your host OS
- If something goes wrong, the VM is disposable
- Shared folders let you copy files in/out safely
- Snapshots let you roll back to a known-good state

### Minimum: Local Development (Acceptable)

Running directly on your machine works fine for development and testing:

```bash
git clone https://github.com/Ckokoski/authorclaw.git
cd authorclaw && npm install
npx tsx gateway/src/index.ts
```

AuthorClaw binds to `localhost:3847` only — not exposed to the internet. But your API keys and manuscripts live on your main OS with no isolation layer.

### Security Layers Summary

| Layer | Local | VM | VPS + Docker + VPN |
|-------|-------|-----|-------------------|
| App-level vault (AES-256) | ✅ | ✅ | ✅ |
| Sandbox file access | ✅ | ✅ | ✅ |
| Audit logging | ✅ | ✅ | ✅ |
| OS isolation | ❌ | ✅ | ✅ |
| Container isolation | ❌ | Optional | ✅ |
| Network isolation (VPN) | ❌ | ❌ | ✅ |
| Always-on (Telegram 24/7) | ❌ | ❌ | ✅ |
| Disposable environment | ❌ | ✅ | ✅ |

---

## Setup Wizard

For a guided setup experience, run the interactive wizard:

```bash
bash scripts/setup-wizard.sh
```

It walks you through everything: OS detection, Node.js installation, Ollama setup, API key configuration, vault passphrase creation, and personalization (genre, word goals). It even generates a troubleshooting prompt you can paste into any AI chatbot if you get stuck.

---

## Contributing

AuthorClaw is open source and contributions are welcome! Whether you're an author with ideas for new skills, a developer who wants to improve the codebase, or a tinkerer who built a cool integration — we'd love your help.

### Ways to Contribute

- **New Skills** — Create SKILL.md files for writing tasks we haven't covered yet
- **Bug Fixes** — Find and fix issues in the gateway, dashboard, or bridges
- **New AI Providers** — Add support for additional AI services
- **New Bridges** — Build integrations for Slack, WhatsApp, Matrix, etc.
- **Dashboard Improvements** — The dashboard is a single HTML file — lots of room to grow
- **Documentation** — Better guides, tutorials, and examples

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-new-skill`)
3. Make your changes
4. Test locally (`npx tsx gateway/src/index.ts`)
5. Submit a Pull Request with a clear description

For new skills, just create a folder in `skills/author/` (or `skills/marketing/`, `skills/core/`) with a `SKILL.md` file following the existing format (YAML frontmatter + markdown body).

---

## Disclaimer

This software is provided "as is" without warranty of any kind. **Use at your own risk.** AuthorClaw is an experimental AI writing tool — some configuration and code tinkering may be required to get the agent working exactly the way you want it. AI outputs should always be reviewed by a human before publishing. The authors are not responsible for any content generated by the AI or any consequences of using this software.

AuthorClaw relies on third-party AI providers (Gemini, Claude, OpenAI, DeepSeek, Ollama). Usage of those services is subject to their respective terms and pricing. API costs are your responsibility.

## License

MIT License. See [LICENSE](LICENSE) for details.

Built with love for writers by an author who believes AI should amplify creativity, not replace it.
