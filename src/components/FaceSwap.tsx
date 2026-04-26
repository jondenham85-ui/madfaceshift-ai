"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function FaceSwap() {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState("");
  const [targetData, setTargetData] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const sourceRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File, type: "source" | "target") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === "source") { setSourcePreview(dataUrl); setSourceData(dataUrl); }
      else { setTargetPreview(dataUrl); setTargetData(dataUrl); }
    };
    reader.readAsDataURL(file);
  };

  const handleSwap = async () => {
    if (!sourceData || !targetData) { toast.error("Upload both photos first"); return; }
    setLoading(true); setResultUrl("");
    try {
      const res = await fetch("/api/faceswap", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: sourceData, targetUrl: targetData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultUrl(data.resultUrl);
      toast.success(`Swap complete! (${data.swapsUsed}/${data.swapsLimit} used)`);
    } catch (err: any) { toast.error(err.message || "Swap failed"); }
    finally { setLoading(false); }
  };

  const UploadBox = ({ label, preview, inputRef, type }: any) => (
    <div
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 transition-all min-h-[200px] flex flex-col items-center justify-center"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0], type); }} />
      {preview ? (
        <img src={preview} alt={label} className="max-h-48 rounded-lg object-cover" />
      ) : (
        <>
          <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 font-medium">{label}</p>
          <p className="text-gray-500 text-sm mt-1">Tap to upload photo</p>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadBox label="Your Face" preview={sourcePreview} inputRef={sourceRef} type="source" />
        <UploadBox label="Target Photo" preview={targetPreview} inputRef={targetRef} type="target" />
      </div>
      <button onClick={handleSwap} disabled={loading || !sourceData || !targetData}
        className="glow-button w-full py-3 rounded-lg text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Swapping..." : "Swap Faces"}
      </button>
      {resultUrl && (
        <div className="mt-6 p-4 bg-brand-dark-card border border-brand-dark-border rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Result:</p>
          <img src={resultUrl} alt="Face swap result" className="rounded-lg max-w-full" />
          <a href={resultUrl} download className="inline-block mt-3 text-brand-orange hover:text-brand-orange-light transition text-sm">
            Download Result
          </a>
        </div>
      )}
    </div>
  );
}
