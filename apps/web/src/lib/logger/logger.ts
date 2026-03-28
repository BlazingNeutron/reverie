const baseUrl = process.env.SITE_URL || "";

class Logger {
  trace(...args: any[]) {
    this.#log("trace", args);
    console.trace(args);
  }

  debug(...args: any[]) {
    this.#log("debug", args);
    console.debug(args);
  }

  log(...args: any[]) {
    this.#log("log", args);
    console.log(args);
  }

  warn(...args: any[]) {
    this.#log("warn", args);
    console.warn(args);
  }

  error(...args: any[]) {
    this.#log("error", args);
    console.error(args);
  }

  #log(level: string, args: any[]) {
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

    this.#send(entry);
  }

  async #send(entry: {}) {
    try {
      await fetch(baseUrl + "/api/v1/logger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  }
}

export default new Logger();

export type { Logger };
