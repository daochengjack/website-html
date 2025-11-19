export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export class Logger {
  private prefix: string;

  constructor(name: string) {
    this.prefix = `[${name}]`;
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.log('error', `${message}: ${error.message}`);
      if (error.stack) console.error(error.stack);
    } else {
      this.log('error', message, error);
    }
  }

  success(message: string, data?: unknown): void {
    this.log('success', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `${timestamp} ${this.prefix}`;

    const levelEmoji: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    };

    const emoji = levelEmoji[level];

    if (data) {
      console.log(`${prefix} ${emoji} ${message}`, data);
    } else {
      console.log(`${prefix} ${emoji} ${message}`);
    }
  }

  group(title: string): void {
    console.group(`${this.prefix} ${title}`);
  }

  groupEnd(): void {
    console.groupEnd();
  }

  table(data: unknown[]): void {
    console.table(data);
  }

  time(label: string): void {
    console.time(`${this.prefix} ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`${this.prefix} ${label}`);
  }
}

export function createLogger(name: string): Logger {
  return new Logger(name);
}
