class Logger {
  trace(...args: any[]) {
    console.trace(args);
  }

  debug(...args: any[]) {
    console.debug(args);
  }

  log(...args: any[]) {
    console.log(args);
  }

  warn(...args: any[]) {
    console.warn(args);
  }

  error(...args: any[]) {
    console.error(args);
  }
}

export default new Logger();
