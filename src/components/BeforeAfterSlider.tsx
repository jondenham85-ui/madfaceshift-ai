"use client";
import { useState, useRef, useCallback } from "react";

interface Props { beforeUrl: string; afterUrl: string; beforeLabel?: string; afterLabel?: string; className?: string; }

export default function BeforeAfterSlider({ beforeUrl, afterUrl, beforeLabel = "Before", afterLabel = "After", className = "" }: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);
  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-2xl cursor-col-resize select-none ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); updatePosition(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) updatePosition(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}>
      <img src={afterUrl} alt={afterLabel} className="w-full h-full object-cover block" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={beforeUrl} alt={beforeLabel} className="w-full h-full object-cover block" draggable={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
      </div>
      <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">{beforeLabel}</span>
      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">{afterLabel}</span>
    </div>
  );
}
