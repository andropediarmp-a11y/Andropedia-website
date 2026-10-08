"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type ToastTone = "info" | "success" | "error";
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const DURATION_MS = 4500;

/** `initial` messages are shown on first render (used to announce a restored draft). */
export function useToasts(initial: string[] = []) {
  const nextId = useRef(initial.length + 1);
  const [toasts, setToasts] = useState<ToastItem[]>(() =>
    initial.map((message, i) => ({ id: i + 1, message, tone: "info" as const }))
  );

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = toasts.map((t) => window.setTimeout(() => dismiss(t.id), DURATION_MS));
    return () => timers.forEach(window.clearTimeout);
    // Only the toasts present on first render need a timer here; later ones are timed in push().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { toasts, push, dismiss };
}

const TONE: Record<ToastTone, string> = {
  info: "border-sky-400/40 bg-sky-950/90 text-sky-100",
  success: "border-emerald-400/40 bg-emerald-950/90 text-emerald-100",
  error: "border-rose-400/40 bg-rose-950/90 text-rose-100",
};

/** Always rendered so screen readers announce new toasts (polite live region). */
export function ToastRegion({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:items-end">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${TONE[t.tone]}`}>
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
