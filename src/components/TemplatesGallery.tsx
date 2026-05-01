"use client";
import { useState } from "react";
const CATS = ["All","Celebrities","Movies","Historical","Memes","Anime","Sports"];
const TEMPLATES = [
  {id:"t1",name:"Iron Man Suit Up",category:"Movies",imageUrl:"/templates/ironman.jpg",trending:true},
  {id:"t2",name:"Mona Lisa",category:"Historical",imageUrl:"/templates/monalisa.jpg",trending:true},
  {id:"t3",name:"Astronaut on Moon",category:"Historical",imageUrl:"/templates/astronaut.jpg",trending:false},
  {id:"t4",name:"Anime Hero",category:"Anime",imageUrl:"/templates/anime-hero.jpg",trending:true},
  {id:"t5",name:"Magazine Cover",category:"Celebrities",imageUrl:"/templates/magazine.jpg",trending:false},
  {id:"t6",name:"Surprised Pikachu",category:"Memes",imageUrl:"/templates/pikachu.jpg",trending:true},
  {id:"t7",name:"Basketball Dunk",category:"Sports",imageUrl:"/templates/dunk.jpg",trending:false},
  {id:"t8",name:"Greek God Statue",category:"Historical",imageUrl:"/templates/greek.jpg",trending:true},
];
interface Template { id:string; name:string; category:string; imageUrl:string; trending:boolean; }
export default function TemplatesGallery({ onSelect, className="" }:{ onSelect:(t:Template)=>void; className?:string }) {
  const [cat,setCat]=useState("All"); const [search,setSearch]=useState("");
  const filtered=TEMPLATES.filter(t=>(cat==="All"||t.category===cat)&&(!search||t.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Viral Templates</h2>
        <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-xl border border-gray-700 w-48" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">{CATS.map(c=>(<button key={c} onClick={()=>setCat(c)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${cat===c?"bg-purple-600 text-white":"bg-gray-800 text-gray-400"}`}>{c}</button>))}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{filtered.map(t=>(<button key={t.id} onClick={()=>onSelect(t)} className="group relative rounded-xl overflow-hidden bg-gray-800 hover:ring-2 hover:ring-purple-500 aspect-[3/4]"><img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80"><p className="text-white text-xs font-bold truncate">{t.name}</p></div>{t.trending&&<span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HOT</span>}</button>))}</div>
    </div>
  );
}
