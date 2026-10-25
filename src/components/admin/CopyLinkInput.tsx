"use client";

import { useState } from "react";

export function CopyLinkInput({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 300 }}>
      <input
        type="text"
        readOnly
        value={value}
        className="input"
        style={{ padding: "4px 8px", fontSize: 12, height: "auto", background: "#f3f1ec", flex: 1 }}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <button
        onClick={handleCopy}
        type="button"
        className="btn btn-sm btn-primary"
        style={{ height: "auto", padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap" }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}