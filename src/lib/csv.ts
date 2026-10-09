/** One quoted CSV cell. Cells starting with a formula character are prefixed so spreadsheets treat them as text. */
export function csvCell(value: string | null | undefined): string {
  const text = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export const csvRow = (cells: Array<string | null | undefined>) => cells.map(csvCell).join(",");
