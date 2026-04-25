"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FaceSwap() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!sourceUrl || !targetUrl) { toast.error("Please provide both image URLs"); return; }
    setLoading(true);
    setResultUrl("");
    try {
      const res = await fetch("/api/faceswap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl, targetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultUrl(data.resultUrl);
      toast.success(`Swap complete! (${data.swapsUsed}/${data.swapsLimit} used)`);
    } catch (err: any) {
      toast.error(err.message || "Swap failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Source Face URL</label>
          <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/face.jpg" className="w-full px-4 py-3 bg-brand-dark-card border border-brand-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target Image URL</label>
          <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://example.com/target.jpg" className="w-full px-4 py-3 bg-brand-dark-card border border-brand-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
        </div>
      </div>
      <button onClick={handleSwap} disabled={loading} className="glow-button w-full py-3 rounded-lg text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Swapping..." : "Swap Faces"}
      </button>
      {resultUrl && (
        <div className="mt-6 p-4 bg-brand-dark-card border border-brand-dark-border rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Result:</p>
          <img src={resultUrl} alt="Face swap result" className="rounded-lg max-w-full" />
          <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-brand-orange hover:text-brand-orange-light transition text-sm">Download Full Size</a>
        </div>
      )}
    </div>
  );
}
