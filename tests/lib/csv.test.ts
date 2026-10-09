import { describe, expect, it } from "vitest";
import { csvCell, csvRow } from "@/lib/csv";

describe("csvCell", () => {
  it("quotes and escapes embedded quotes", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
  });
  it("defuses spreadsheet formulas", () => {
    for (const evil of ["=1+1", "+cmd", "-2", "@SUM(A1)"]) expect(csvCell(evil)).toBe(`"'${evil}"`);
  });
  it("treats missing values as empty", () => {
    expect(csvRow([undefined, null, "a"])).toBe('"","","a"');
  });
});
