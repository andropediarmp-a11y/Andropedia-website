import type { ClubPosition } from "@/lib/types";

// The member Google Form has no "position" column, so who holds which post is listed here.
// Key = the member's email exactly as in the form (lower case). Anyone not listed is a regular member.
// Used only when members come straight from the sheet; once the database is connected,
// positions set there (user:set-role / admin panel) take over.
//
//   president / vice_president / chief  -> shown on the home page and at the top of /team
//   lead / co_lead                      -> shown first inside their domain on /team
export const LEADERSHIP: Record<string, ClubPosition> = {
  // "president@example.com": "president",
  // "vp@example.com": "vice_president",
  // "web.chief@example.com": "chief",
};
