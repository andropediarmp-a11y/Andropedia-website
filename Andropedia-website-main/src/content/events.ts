import type { PublicEvent } from "@/lib/public-content";

// Publish only confirmed events. Empty data intentionally produces an honest
// announcement state when the Events redesign is implemented in Phase 8.
export const publicEvents: readonly PublicEvent[] = [];
