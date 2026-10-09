const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/**
 * Canonical form of an email for duplicate detection. Gmail ignores dots and "+tag" in the
 * local part, so `P.riya+club@gmail.com` and `priya@gmail.com` are the same inbox.
 * Other providers are only lower-cased (stripping "+tag" is not safe everywhere).
 */
export function emailKey(email: string): string {
  const [localRaw, domainRaw] = email.trim().toLowerCase().split("@");
  if (!domainRaw) return email.trim().toLowerCase();
  if (GMAIL_DOMAINS.has(domainRaw)) {
    return `${localRaw.split("+")[0].replace(/\./g, "")}@gmail.com`;
  }
  return `${localRaw}@${domainRaw}`;
}
