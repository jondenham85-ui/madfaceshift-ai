"use client";
import { useState, useCallback } from "react";
interface SwapResult { id:string; fileName:string; status:"pending"|"processing"|"done"|"error"; outputUrl?:string; }
interface Props { userId:string; sourceImageUrl:string; isPro:boolean; className?:string; }
export default function BatchUpload({ userId, sourceImageUrl, isPro, className="" }: Props) {
  const [files,setFiles]=useState<File[]>([]); const [results,setResults]=useState<SwapResult[]>([]); const [processing,setProcessing]=useState(false);
  const maxFiles=isPro?20:0;
  const handleFiles=useCallback((e:React.ChangeEvent<HTMLInputElement>)=>{
    const sel=Array.from(e.target.files||[]).slice(0,maxFiles); setFiles(sel);
    setResults(sel.map((f,i)=>({id:`b-${i}`,fileName:f.name,status:"pending"})));
  },[maxFiles]);
  async function processBatch() {
    if(!isPro)return; setProcessing(true);
    for(let i=0;i<files.length;i++) {
      setResults(p=>p.map((r,j)=>j===i?{...r,status:"processing"}:r));
      try { const fd=new FormData(); fd.append("userId",userId); fd.append("sourceImageUrl",sourceImageUrl); fd.append("targetImage",files[i]);
        const res=await fetch("/api/faceswap",{method:"POST",body:fd}); const data=await res.json();
        setResults(p=>p.map((r,j)=>j===i?{...r,status:res.ok?"done":"error",outputUrl:data.outputUrl}:r));
      } catch { setResults(p=>p.map((r,j)=>j===i?{...r,status:"error"}:r)); }
    } setProcessing(false);
  }
  if(!isPro) return (<div className={`bg-gray-900 rounded-2xl p-6 text-center ${className}`}><span className="text-4xl mb-3 block">📦</span><h3 className="text-white font-bold text-lg mb-2">Batch Processing</h3><p className="text-gray-400 text-sm mb-4">Upload up to 20 images and swap faces in all at once.</p><a href="/pricing" className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-6 py-2 rounded-xl text-sm">Upgrade to Pro</a></div>);
  return (<div className={`bg-gray-900 rounded-2xl p-6 ${className}`}><h3 className="text-white font-bold text-lg mb-3">📦 Batch Face Swap</h3><input type="file" multiple accept="image/*" onChange={handleFiles} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white mb-4" />{files.length>0&&<><div className="space-y-2 mb-4 max-h-60 overflow-y-auto">{results.map(r=>(<div key={r.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2"><span className="text-white text-sm truncate flex-1">{r.fileName}</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status==="done"?"bg-green-900 text-green-300":r.status==="processing"?"bg-yellow-900 text-yellow-300":"bg-gray-700 text-gray-400"}`}>{r.status}</span></div>))}</div><button onClick={processBatch} disabled={processing} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-xl disabled:opacity-50">{processing?"Processing...":`Swap All ${files.length} Images`}</button></>}</div>);
}
