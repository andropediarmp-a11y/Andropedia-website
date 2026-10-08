import { readEnv } from "../env";
import { log } from "../logger";

export type CycleState = "open" | "upcoming" | "closed";

export interface CycleStatus {
  state: CycleState;
  opensAt: string | null;
  closesAt: string | null;
  /** Plain-language reason, safe to show to applicants. */
  message: string;
}

/**
 * Whether applications are being accepted right now. Controlled by environment variables so the
 * club can open, close or schedule a cycle without a code change:
 *   RECRUITMENT_OPEN=false          manual kill switch
 *   RECRUITMENT_OPENS_AT=...        ISO date with timezone
 *   RECRUITMENT_CLOSES_AT=...       ISO date with timezone (the deadline)
 * If the variables are invalid we keep accepting applications and log loudly; /api/health
 * reports the problem. (Silently closing the site over a typo would cost more than it saves.)
 */
export function getCycleStatus(now: Date = new Date(), source: Record<string, string | undefined> = process.env): CycleStatus {
  let env;
  try {
    env = readEnv(source);
  } catch (err) {
    log.error("Invalid recruitment cycle configuration; treating applications as open", err);
    return { state: "open", opensAt: null, closesAt: null, message: "Applications are open." };
  }

  const opensAt = env.RECRUITMENT_OPENS_AT ?? null;
  const closesAt = env.RECRUITMENT_CLOSES_AT ?? null;
  const t = now.getTime();

  if (env.RECRUITMENT_OPEN === "false") {
    return { state: "closed", opensAt, closesAt, message: "Applications are currently closed." };
  }
  if (opensAt && t < Date.parse(opensAt)) {
    return { state: "upcoming", opensAt, closesAt, message: "Applications have not opened yet." };
  }
  if (closesAt && t >= Date.parse(closesAt)) {
    return { state: "closed", opensAt, closesAt, message: "The application deadline has passed." };
  }
  return { state: "open", opensAt, closesAt, message: "Applications are open." };
}
