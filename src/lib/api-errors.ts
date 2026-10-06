import { ConflictError, ForbiddenError, NotFoundError } from "./data-store";
import { jsonError } from "./http";
import { log } from "./logger";

/** Maps the data layer's typed errors to HTTP responses; anything else is a logged 500. */
export function handleDataError(err: unknown, what: string) {
  if (err instanceof NotFoundError) return jsonError(err.message, 404);
  if (err instanceof ForbiddenError) return jsonError(err.message, 403);
  if (err instanceof ConflictError) return jsonError(err.message, 409);
  log.error(`${what} failed`, err);
  return jsonError("Internal server error", 500);
}
