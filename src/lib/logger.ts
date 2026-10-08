// Small structured logger: one JSON line per event in production, readable text in development.
// Never pass emails, names or answers in `ctx`; log reference ids instead.
type Level = "info" | "warn" | "error";
type Ctx = Record<string, unknown>;

function errorInfo(err: unknown): Ctx | undefined {
  if (err === undefined) return undefined;
  if (err instanceof Error) {
    const withStatus = err as Error & { status?: number; code?: string | number };
    return { name: err.name, message: err.message, status: withStatus.status, code: withStatus.code };
  }
  return { message: String(err) };
}

function emit(level: Level, msg: string, ctx: Ctx = {}, err?: unknown) {
  const entry = { level, time: new Date().toISOString(), msg, ...ctx, ...(err !== undefined ? { error: errorInfo(err) } : {}) };
  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify(entry)
      : `[${level}] ${msg}${Object.keys(entry).length > 3 ? " " + JSON.stringify({ ...ctx, error: errorInfo(err) }) : ""}`;
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
}

export const log = {
  info: (msg: string, ctx?: Ctx) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Ctx, err?: unknown) => emit("warn", msg, ctx, err),
  error: (msg: string, err?: unknown, ctx?: Ctx) => emit("error", msg, ctx, err),
};
