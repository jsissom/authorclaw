/**
 * AuthorClaw Telegram Bridge
 * Secure Telegram bot integration — acts as a command center
 * Users give orders via Telegram, AuthorClaw executes in the VM
 */

interface TelegramConfig {
  allowedUsers: string[];
  pairingEnabled: boolean;
}

/** Handler for direct commands that interact with gateway services */
interface CommandHandlers {
  createGoal: (title: string, description: string) => Promise<{ id: string; steps: number }>;
  startAndRunGoal: (goalId: string) => Promise<{ completed: string; response: string; wordCount: number; nextStep?: string } | { error: string }>;
  autoRunGoal: (goalId: string, statusCallback: (msg: string) => Promise<void>) => Promise<void>;
  listGoals: () => Array<{ id: string; title: string; status: string; progress: string }>;
  saveToFile: (filename: string, content: string) => Promise<void>;
  handleMessage: (content: string, channel: string, respond: (text: string) => void) => Promise<void>;
  research: (query: string) => Promise<{ results: string; error?: string }>;
  listFiles: (subdir?: string) => Promise<string[]>;
  readFile: (filename: string) => Promise<{ content: string; error?: string }>;
}

export class TelegramBridge {
  private token: string;
  private config: TelegramConfig;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private messageHandler?: (content: string, channel: string, respond: (text: string) => void) => Promise<void>;
  private commandHandlers?: CommandHandlers;
  private lastUpdateId = 0;
  public pauseRequested = false;
  private knownChatIds: Set<number> = new Set(); // Track chat IDs for broadcasting

  constructor(token: string, config: Partial<TelegramConfig>) {
    this.token = token;
    this.config = {
      allowedUsers: config.allowedUsers || [],
      pairingEnabled: config.pairingEnabled ?? true,
    };
  }

  onMessage(handler: (content: string, channel: string, respond: (text: string) => void) => Promise<void>) {
    this.messageHandler = handler;
  }

  /** Set command handlers for direct gateway interaction */
  setCommandHandlers(handlers: CommandHandlers) {
    this.commandHandlers = handlers;
  }

  async connect(): Promise<void> {
    // Verify bot token
    const response = await fetch(`https://api.telegram.org/bot${this.token}/getMe`);
    if (!response.ok) {
      throw new Error('Invalid Telegram bot token');
    }

    // Start polling
    this.pollingInterval = setInterval(() => this.poll(), 2000);
  }

  private async poll(): Promise<void> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`
      );
      const data = await response.json() as any;

      for (const update of data.result || []) {
        this.lastUpdateId = update.update_id;
        const message = update.message;
        if (!message?.text) continue;

        const userId = String(message.from.id);
        const chatId = message.chat.id;
        const userName = message.from.first_name || 'there';

        // Check if user is allowed
        if (this.config.allowedUsers.length > 0 && !this.config.allowedUsers.includes(userId)) {
          await this.sendMessage(chatId,
            '🔒 Not authorized. Ask the owner to add your ID (' + userId + ') in the dashboard.');
          continue;
        }

        // Track chat ID for broadcasting (only for allowed users)
        this.knownChatIds.add(chatId);

        // Route to appropriate handler
        await this.handleInput(chatId, message.text, userName);
      }
    } catch (error) {
      console.error('Telegram poll error:', error);
    }
  }

  private async handleInput(chatId: number, text: string, userName: string): Promise<void> {

    // ── /start and /help ──
    if (text.startsWith('/start') || text.startsWith('/help')) {
      await this.sendMessage(chatId,
        `✍️ Hey ${userName}! I'm AuthorClaw.\n\n` +
        `Tell me what to do and I'll figure out the steps.\n\n` +
        `*Commands:*\n` +
        `/goal [task] — Tell me what to do (I'll plan the steps)\n` +
        `/write [idea] — Plan & write a book (autonomous)\n` +
        `/goals — See all goals\n` +
        `/status — Quick status check\n` +
        `/research [topic] — Research from whitelisted sites\n` +
        `/files [folder] — List project files\n` +
        `/read [filename] — Read a file snippet\n` +
        `/stop — Pause active goal\n\n` +
        `Or just chat with me.`);
      return;
    }

    // ── /write — Create a writing goal and AUTO-RUN all steps ──
    if (text.startsWith('/write')) {
      const idea = text.replace(/^\/write\s*/, '').trim();
      if (!idea) {
        await this.sendMessage(chatId, `What's the idea? Try:\n/write cyberpunk heist thriller about rogue AI`);
        return;
      }

      if (this.commandHandlers) {
        await this.sendMessage(chatId, `📝 On it. Planning "${idea}"...\nI'll figure out the steps and run them automatically.`);
        try {
          const goal = await this.commandHandlers.createGoal(idea, `Write a book: ${idea}`);
          await this.sendMessage(chatId, `✅ Planned ${goal.steps} steps. Running autonomously...`);

          // Auto-run ALL steps
          await this.commandHandlers.autoRunGoal(goal.id, async (msg) => {
            await this.sendMessage(chatId, msg);
          });
        } catch (e) {
          await this.sendMessage(chatId, `❌ Error: ${String(e)}`);
        }
      }
      return;
    }

    // ── /goal — Create ANY goal and AUTO-RUN all steps ──
    if (text.startsWith('/goal')) {
      const description = text.replace(/^\/goal\s*/, '').trim();
      if (!description) {
        await this.sendMessage(chatId,
          `📋 Tell me what to do:\n` +
          `/goal write a full tech-thriller from start to finish\n` +
          `/goal research medieval weapons for my fantasy novel\n` +
          `/goal revise chapters 1-3 for pacing\n` +
          `/goal create marketing materials for my book`);
        return;
      }

      if (this.commandHandlers) {
        try {
          await this.sendMessage(chatId, `🧠 Planning "${description}"...`);
          const goal = await this.commandHandlers.createGoal(description, description);
          await this.sendMessage(chatId,
            `✅ Planned ${goal.steps} steps. Running autonomously...`);

          // Auto-run ALL steps
          await this.commandHandlers.autoRunGoal(goal.id, async (msg) => {
            await this.sendMessage(chatId, msg);
          });
        } catch (e) {
          await this.sendMessage(chatId, `❌ ${String(e)}`);
        }
      }
      return;
    }

    // ── /goals — List active goals ──
    if (text.startsWith('/goals')) {
      if (this.commandHandlers) {
        const goals = this.commandHandlers.listGoals();
        if (goals.length === 0) {
          await this.sendMessage(chatId, `No goals yet. Create one with /goal or /write`);
        } else {
          const list = goals.map(g =>
            `${g.status === 'completed' ? '✅' : g.status === 'active' ? '🔄' : g.status === 'failed' ? '❌' : '⏸'} ${g.title} (${g.progress})`
          ).join('\n');
          await this.sendMessage(chatId, `📋 *Goals:*\n${list}`);
        }
      }
      return;
    }

    // ── /status — Quick status ──
    if (text.startsWith('/status')) {
      if (this.commandHandlers) {
        const goals = this.commandHandlers.listGoals();
        const active = goals.filter(g => g.status === 'active');
        const completed = goals.filter(g => g.status === 'completed');
        let summary = '';

        if (active.length > 0) {
          summary += `🔄 ${active.length} goal(s) running:\n` + active.map(g => `• ${g.title} (${g.progress})`).join('\n');
        }
        if (completed.length > 0) {
          summary += `${summary ? '\n' : ''}✅ ${completed.length} goal(s) done`;
        }
        if (!summary) summary = 'Nothing running. Use /goal to start something.';
        await this.sendMessage(chatId, summary + `\n\n📊 Dashboard: http://localhost:3847`);
      } else {
        await this.sendMessage(chatId, `📊 Dashboard: http://localhost:3847`);
      }
      return;
    }

    // ── /research — Fetch from whitelisted domains ──
    if (text.startsWith('/research')) {
      const query = text.replace(/^\/research\s*/, '').trim();
      if (!query) {
        await this.sendMessage(chatId, `What should I research?\n/research medieval sword types\n/research self-publishing trends 2026`);
        return;
      }
      if (this.commandHandlers) {
        await this.sendMessage(chatId, `🔍 Researching "${query}"...`);
        try {
          const result = await this.commandHandlers.research(query);
          if (result.error) {
            await this.sendMessage(chatId, `⚠️ ${result.error}`);
          } else {
            await this.sendMessage(chatId, result.results);
          }
        } catch (e) {
          await this.sendMessage(chatId, `❌ Research failed: ${String(e)}`);
        }
      }
      return;
    }

    // ── /files — List project files ──
    if (text.startsWith('/files')) {
      const subdir = text.replace(/^\/files\s*/, '').trim() || '';
      if (this.commandHandlers) {
        try {
          const files = await this.commandHandlers.listFiles(subdir);
          if (files.length === 0) {
            await this.sendMessage(chatId, `📁 No files found${subdir ? ` in ${subdir}` : ''}. Create a goal to generate content.`);
          } else {
            await this.sendMessage(chatId, `📁 *Files${subdir ? ` in ${subdir}` : ''}:*\n${files.map(f => `• ${f}`).join('\n')}`);
          }
        } catch (e) {
          await this.sendMessage(chatId, `❌ ${String(e)}`);
        }
      }
      return;
    }

    // ── /read — Read a file snippet ──
    if (text.startsWith('/read')) {
      const filename = text.replace(/^\/read\s*/, '').trim();
      if (!filename) {
        await this.sendMessage(chatId, `Which file? Use /files to list them first.\n/read projects/my-book/premise.md`);
        return;
      }
      if (this.commandHandlers) {
        try {
          const result = await this.commandHandlers.readFile(filename);
          if (result.error) {
            await this.sendMessage(chatId, `⚠️ ${result.error}`);
          } else {
            const preview = result.content.length > 3000
              ? result.content.substring(0, 3000) + `\n\n... (${result.content.length} chars total — view full file in dashboard)`
              : result.content;
            await this.sendMessage(chatId, `📄 *${filename}:*\n\n${preview}`);
          }
        } catch (e) {
          await this.sendMessage(chatId, `❌ ${String(e)}`);
        }
      }
      return;
    }

    // ── /stop — Pause active goal ──
    if (text.startsWith('/stop') || text.startsWith('/pause')) {
      if (this.commandHandlers) {
        const goals = this.commandHandlers.listGoals();
        const active = goals.find(g => g.status === 'active');
        if (!active) {
          await this.sendMessage(chatId, `Nothing running right now.`);
        } else {
          await this.sendMessage(chatId, `⏸ Pausing "${active.title}"... (Goal will finish current step then stop)`);
          this.pauseRequested = true;
        }
      }
      return;
    }

    // ── "continue" / "next" — Resume or run next step of a paused goal ──
    const lower = text.toLowerCase().trim();
    if (lower === 'continue' || lower === 'next' || lower === 'go' || lower === 'resume') {
      if (this.commandHandlers) {
        const goals = this.commandHandlers.listGoals();
        const active = goals.find(g => g.status === 'active' || g.status === 'paused');
        if (!active) {
          await this.sendMessage(chatId, `No goals to continue. Create one with /goal or /write`);
          return;
        }
        this.pauseRequested = false;
        await this.sendMessage(chatId, `▶️ Resuming "${active.title}"...`);
        try {
          await this.commandHandlers.autoRunGoal(active.id, async (msg) => {
            await this.sendMessage(chatId, msg);
          });
        } catch (e) {
          await this.sendMessage(chatId, `❌ ${String(e)}`);
        }
      }
      return;
    }

    // ── Regular message — send to AI with "be brief" instructions ──
    if (this.messageHandler) {
      await this.messageHandler(
        text,
        `telegram:${chatId}`,
        async (response) => { await this.sendMessage(chatId, response); }
      );
    }
  }

  private async sendMessage(chatId: number, text: string): Promise<void> {
    // Split long messages (Telegram limit: 4096 chars)
    const chunks = this.splitMessage(text, 4096);
    for (const chunk of chunks) {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
        }),
      });
      if (!response.ok) {
        // Retry without parse_mode in case Markdown formatting caused the error
        const retry = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: chunk,
          }),
        });
        if (!retry.ok) {
          console.error('Telegram sendMessage failed:', await retry.text());
        }
      }
    }
  }

  private splitMessage(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }
      let splitAt = remaining.lastIndexOf('\n', maxLength);
      if (splitAt < maxLength / 2) splitAt = maxLength;
      chunks.push(remaining.substring(0, splitAt));
      remaining = remaining.substring(splitAt);
    }
    return chunks;
  }

  /** Update allowed users on a live bridge (called when dashboard saves users) */
  updateAllowedUsers(users: string[]): void {
    this.config.allowedUsers = users;
  }

  /**
   * Broadcast a message to all known allowed users.
   * Used by autonomous heartbeat to send status updates.
   */
  async broadcastToAllowed(message: string): Promise<void> {
    for (const chatId of this.knownChatIds) {
      try {
        await this.sendMessage(chatId, message);
      } catch (e) {
        console.error(`Telegram broadcast to ${chatId} failed:`, e);
      }
    }
  }

  disconnect(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
