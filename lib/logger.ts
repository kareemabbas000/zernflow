type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogContext {
  workspace_id?: string;
  user_id?: string;
  request_id?: string;
  channel_id?: string;
  event_id?: string;
  [key: string]: any;
}

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error | unknown) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      ...(error instanceof Error
        ? {
            error: {
              message: error.message,
              name: error.name,
              stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
          }
        : error
        ? { error }
        : {}),
    };

    const logString = JSON.stringify(logEntry);

    // In development, pretty print if desired, but for Vercel JSON is best
    switch (level) {
      case "debug":
        console.debug(logString);
        break;
      case "info":
        console.info(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "error":
      case "fatal":
        console.error(logString);
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.formatLog("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.formatLog("info", message, context);
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    this.formatLog("warn", message, context, error);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.formatLog("error", message, context, error);
  }

  fatal(message: string, error?: unknown, context?: LogContext) {
    this.formatLog("fatal", message, context, error);
  }
}

export const logger = new StructuredLogger();
