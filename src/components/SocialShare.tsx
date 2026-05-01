"use client";
import { useState } from "react";

interface Props { imageUrl: string; title?: string; className?: string; }

export default function SocialShare({ imageUrl, title = "Check out my AI face swap!", className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const appUrl = "https://alluring-magic-production.up.railway.app";
  const shareText = `${title} Made with MADFaceShift AI - try it free!`;
  const enc = encodeURIComponent;
  const platforms = [
    { name: "TikTok", icon: "\ud83c\udfb5", action: () => window.open("https://www.tiktok.com/upload", "_blank") },
    { name: "Twitter/X", icon: "\ud83d\udc26", action: () => window.open(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(appUrl)}`, "_blank") },
    { name: "WhatsApp", icon: "\ud83d\udcac", action: () => window.open(`https://wa.me/?text=${enc(shareText)}%20${enc(appUrl)}`, "_blank") },
    { name: "Reddit", icon: "\ud83e\udd16", action: () => window.open(`https://reddit.com/submit?url=${enc(appUrl)}&title=${enc(shareText)}`, "_blank") },
  ];
  async function download() {
    const res = await fetch(imageUrl); const blob = await res.blob();
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `madfaceshift-${Date.now()}.png`; a.click(); URL.revokeObjectURL(a.href);
  }
  return (
    <div className={`bg-gray-900 rounded-2xl p-4 ${className}`}>
      <p className="text-white font-bold text-sm mb-3">Share your creation</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {platforms.map((p) => (
          <button key={p.name} onClick={p.action} className="flex items-center gap-2 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition">
            <span className="text-xl">{p.icon}</span><span className="text-white text-xs">{p.name}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={download} className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl text-sm">Download</button>
        <button onClick={() => { navigator.clipboard.writeText(`${shareText} ${appUrl}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-xl text-sm">{copied ? "Copied!" : "Copy Link"}</button>
      </div>
    </div>
  );
}
