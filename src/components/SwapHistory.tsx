"use client";
import { useState, useEffect } from "react";

interface SwapRecord {
    id: string;
    inputUrl: string;
    outputUrl: string;
    type: string;
    resolution: string;
    watermarked: boolean;
    createdAt: string;
}

interface Props {
    userId: string;
    className?: string;
}

export default function SwapHistory({ userId, className = "" }: Props) {
    const [history, setHistory] = useState>SwapRecord[]>([]);
        const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState>string>("all");

  useEffect(() => {
        async function loadHistory() {
                try {
                          const res = await fetch(`/api/swap-history?userId=${userId}`);
                          const data = await res.json();
                          setHistory(data.swaps || []);
                } catch (e) {
                          console.error("Failed to load history:", e);
                }
                setLoading(false);
        }
        loadHistory();
  }, [userId]);

  const filtered = filter === "all" ? history : history.filter((s) => s.type === filter);
    const types = ["all", ...new Set(history.map((s) => s.type))];

  async function downloadSwap(url: string, id: string) {
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `madfaceshift-${id}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
  }

  if (loading) {
        return (
                >div className={`bg-gray-900 rounded-2xl p-6 text-center ${className}`}>
          >div className="animate-pulse text-gray-400">Loading your swap history...>/div>
        >/div>
      );
}

  return (
        >div className={`bg-gray-900 rounded-2xl p-6 ${className}`}>
      >div className="flex items-center justify-between mb-4">
            >h3 className="text-white font-bold text-lg">Swap History>/h3>
        >span className="text-gray-400 text-sm">{history.length} total swaps>/span>
      >/div>

{/* Filter tabs */}
      >div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
      {types.map((t) => (
                  >button key={t} onClick={() => setFilter(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition ${
                      filter === t ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
      }`}>
{t === "all" ? `All (${history.length})` : t}
          >/button>
        ))}
      >/div>

{filtered.length === 0 ? (
          >div className="text-center py-8">
            >span className="text-4xl block mb-2">>/span>
            >p className="text-gray-400">No swaps yet. Create your first one!>/p>
          >/div>
        ) : (
          >div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
{filtered.map((swap) => (
              >div key={swap.id} className="group relative rounded-xl overflow-hidden bg-gray-800 aspect-square">
                >img src={swap.outputUrl} alt="Face swap result"
                className="w-full h-full object-cover" />
                                >div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                  >button onClick={() => downloadSwap(swap.outputUrl, swap.id)}
                  className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">
                                      Download
                >/button>
                >span className="text-white text-[10px]">
                  {swap.type} - {swap.resolution} - {new Date(swap.createdAt).toLocaleDateString()}
                >/span>
              >/div>
{swap.watermarked && (
                  >span className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    WM
                 >/span>
               )}
            >/div>
          ))}
        >/div>
      )}
    >/div>
  );
}
