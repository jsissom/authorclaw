/**
 * AuthorClaw Configuration Service
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export class ConfigService {
  private configDir: string;
  private config: Record<string, any> = {};

  constructor(configDir: string) {
    this.configDir = configDir;
  }

  async load(): Promise<void> {
    const defaultPath = join(this.configDir, 'default.json');
    if (existsSync(defaultPath)) {
      const raw = await readFile(defaultPath, 'utf-8');
      this.config = JSON.parse(raw);
    }

    // Merge user overrides
    const userPath = join(this.configDir, 'user.json');
    if (existsSync(userPath)) {
      const raw = await readFile(userPath, 'utf-8');
      const userConfig = JSON.parse(raw);
      this.config = this.deepMerge(this.config, userConfig);
    }

    // Environment variable overrides
    if (process.env.AUTHORCLAW_PORT) this.set('server.port', parseInt(process.env.AUTHORCLAW_PORT));
    if (process.env.AUTHORCLAW_PRESET) this.set('security.permissionPreset', process.env.AUTHORCLAW_PRESET);
  }

  get(path: string, defaultValue?: any): any {
    const parts = path.split('.');
    let current = this.config;
    for (const part of parts) {
      if (current?.[part] === undefined) return defaultValue;
      current = current[part];
    }
    return current ?? defaultValue;
  }

  set(path: string, value: any): void {
    const parts = path.split('.');
    let current = this.config;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }
}
