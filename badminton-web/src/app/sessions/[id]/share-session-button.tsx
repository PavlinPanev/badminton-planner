"use client";

import { useState } from "react";

export function ShareSessionButton({ sessionId }: { sessionId: number }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/sessions/${sessionId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="rounded-full border border-white/70 bg-white/95 px-4 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-lime-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      {copied ? "Link copied" : "Share session link"}
    </button>
  );
}
