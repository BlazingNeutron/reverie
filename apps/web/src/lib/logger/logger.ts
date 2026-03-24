class Logger {
  endpoint: string;

  constructor(endpoint = "/api/v1/logger") {
    this.endpoint = endpoint;
  }

  trace(...args: any[]) {
    this._log("trace", args);
    console.trace(args);
  }

  log(...args: any[]) {
    this._log("log", args);
    console.log(args);
  }

  debug(...args: any[]) {
    this._log("debug", args);
    console.debug(args);
  }

  warn(...args: any[]) {
    this._log("warn", args);
    console.warn(args);
  }

  error(...args: any[]) {
    this._log("error", args);
    console.error(args);
  }

  _log(level: string, args: any[]) {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg),
      )
      .join(" ");

    const entry = {
      level,
      message,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    this.send(entry);
  }

  async send(entry: {}) {
    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        keepalive: true,
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  }
}

export default new Logger();
