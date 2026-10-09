import { afterEach, describe, expect, it, vi } from "vitest";
import { isMailConfigured, sendMail } from "@/lib/mailer";

const message = { to: "priya@example.com", subject: "Hello", text: "Hi", html: "<p>Hi</p>" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const useWebApp = () => {
  process.env.RECRUITMENT_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/TEST/exec";
  process.env.RECRUITMENT_SHEET_WEBHOOK_SECRET = "s3cret";
};

afterEach(() => {
  for (const k of ["RECRUITMENT_SHEET_WEBHOOK_URL", "RECRUITMENT_SHEET_WEBHOOK_SECRET", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_REPLY_TO"]) delete process.env[k];
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("sendMail through the Apps Script web app", () => {
  it("is considered configured when only the web app is set", () => {
    expect(isMailConfigured()).toBe(false);
    useWebApp();
    expect(isMailConfigured()).toBe(true);
  });

  it("posts a mail action with the secret", async () => {
    useWebApp();
    const fetchMock = vi.fn().mockResolvedValue(reply({ ok: true, quotaLeft: 90 }));
    vi.stubGlobal("fetch", fetchMock);
    await sendMail(message);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent).toMatchObject({ secret: "s3cret", action: "mail", to: "priya@example.com", subject: "Hello", html: "<p>Hi</p>" });
  });

  it("throws when the script refuses (quota, bad secret) without retrying", async () => {
    useWebApp();
    const fetchMock = vi.fn().mockResolvedValue(reply({ ok: false, error: "daily email quota used up" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendMail(message)).rejects.toThrow(/quota/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once after a server error", async () => {
    useWebApp();
    const fetchMock = vi.fn().mockResolvedValueOnce(reply({}, 503)).mockResolvedValueOnce(reply({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    await sendMail(message);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails clearly when nothing is configured", async () => {
    await expect(sendMail(message)).rejects.toThrow(/not configured/i);
  });
});
