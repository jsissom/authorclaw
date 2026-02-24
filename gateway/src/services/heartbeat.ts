/**
 * AuthorClaw Heartbeat Service
 * Writing session tracker, goal monitor, deadline alerts, milestone celebrations
 */

import { MemoryService } from './memory.js';

interface WritingSession {
  startTime: Date;
  lastActivity: Date;
  wordCountStart: number;
  wordCountCurrent: number;
  channel: string;
}

interface HeartbeatConfig {
  intervalMinutes: number;
  dailyWordGoal: number;
  enableReminders: boolean;
  quietHoursStart: number; // 24h format
  quietHoursEnd: number;
}

export class HeartbeatService {
  private config: HeartbeatConfig;
  private memory: MemoryService;
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentSession: WritingSession | null = null;
  private todayWords = 0;
  private streak = 0;
  private lastWritingDate: string | null = null;

  constructor(config: Partial<HeartbeatConfig>, memory: MemoryService) {
    this.config = {
      intervalMinutes: config.intervalMinutes ?? 15,
      dailyWordGoal: config.dailyWordGoal ?? 1000,
      enableReminders: config.enableReminders ?? true,
      quietHoursStart: config.quietHoursStart ?? 22,
      quietHoursEnd: config.quietHoursEnd ?? 7,
    };
    this.memory = memory;
  }

  start(): void {
    this.timer = setInterval(
      () => this.tick(),
      this.config.intervalMinutes * 60 * 1000
    );
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();

    // Respect quiet hours
    if (hour >= this.config.quietHoursStart || hour < this.config.quietHoursEnd) {
      return;
    }

    // Check for day rollover
    const today = now.toISOString().split('T')[0];
    if (this.lastWritingDate && this.lastWritingDate !== today) {
      // Check if yesterday had words (streak tracking)
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (this.lastWritingDate === yesterdayStr && this.todayWords > 0) {
        this.streak++;
      } else if (this.lastWritingDate !== yesterdayStr) {
        this.streak = 0;
      }

      this.todayWords = 0;
    }
  }

  recordActivity(type: string, data: Record<string, any>): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    this.lastWritingDate = today;

    if (type === 'word_count_update') {
      this.todayWords = data.todayTotal || this.todayWords;
    }
  }

  startSession(channel: string, startingWordCount: number): void {
    this.currentSession = {
      startTime: new Date(),
      lastActivity: new Date(),
      wordCountStart: startingWordCount,
      wordCountCurrent: startingWordCount,
      channel,
    };
  }

  updateSession(wordCount: number): void {
    if (this.currentSession) {
      this.currentSession.wordCountCurrent = wordCount;
      this.currentSession.lastActivity = new Date();
    }
  }

  endSession(): { duration: number; wordsWritten: number } | null {
    if (!this.currentSession) return null;

    const duration = Date.now() - this.currentSession.startTime.getTime();
    const wordsWritten = this.currentSession.wordCountCurrent - this.currentSession.wordCountStart;
    this.currentSession = null;

    return { duration, wordsWritten };
  }

  getContext(): string {
    const parts: string[] = [];

    // Daily goal progress
    const goalPercent = Math.min(100, Math.round((this.todayWords / this.config.dailyWordGoal) * 100));
    parts.push(`Daily word goal: ${this.todayWords}/${this.config.dailyWordGoal} (${goalPercent}%)`);

    // Streak
    if (this.streak > 0) {
      parts.push(`Writing streak: ${this.streak} days 🔥`);
    }

    // Active session
    if (this.currentSession) {
      const minutes = Math.round((Date.now() - this.currentSession.startTime.getTime()) / 60000);
      const sessionWords = this.currentSession.wordCountCurrent - this.currentSession.wordCountStart;
      parts.push(`Active session: ${minutes}min, ${sessionWords} words this session`);
    }

    return parts.join('\n');
  }
}
