# AuthorClaw Premium Skills Bundle

This directory is where purchased premium skills are installed.

## Get the Premium Bundle

The **AuthorClaw Premium Skills Bundle** includes all premium skills in one package:

- **Ghostwriter Pro** — Scene generation, pacing analysis, tension mapping, deep write mode
- **Series Architect** — Multi-book series planning, continuity engine, thread tracker
- **Book Launch Machine** — 60-day book launch automation, ad copy factory, email sequences
- **Writing Secrets Integration** — Bridges for Book Bible Engine, Workflow Engine, and StyleClone Pro

**Purchase:** [Ko-Fi Store](https://ko-fi.com/writingsecrets) *(link coming soon)*

## Installation

1. Purchase the Premium Skills Bundle from Ko-Fi
2. Download and extract the zip file
3. Copy the skill folders into this directory:
   ```
   skills/premium/ghostwriter-pro/SKILL.md
   skills/premium/series-architect/SKILL.md
   skills/premium/book-launch-machine/SKILL.md
   skills/premium/deep-voice-analysis/SKILL.md
   skills/premium/ws-book-bible-bridge/SKILL.md
   skills/premium/ws-workflow-engine-bridge/SKILL.md
   ```
4. Restart AuthorClaw
5. Skills auto-load and appear with a star in the console log

## Verification

After restart, check the dashboard or call:
```
GET http://localhost:3847/api/status
```
Premium skills appear under `skills.premium` in the response.
