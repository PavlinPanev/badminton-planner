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
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
    >
      {copied ? "Link copied" : "Share session link"}
    </button>
  );
}
