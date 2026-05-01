import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,0,0.15),transparent_50%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="gradient-text">AI Face Swap</span>
            <br />
            <span className="text-white">In Seconds</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Professional-quality face swapping powered by cutting-edge AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="glow-button px-8 py-4 rounded-xl text-white font-bold text-lg">Start Swapping Free</Link>
            <Link href="/pricing" className="px-8 py-4 rounded-xl border border-brand-dark-border text-gray-300 hover:border-brand-orange hover:text-white transition font-semibold text-lg">View Pricing</Link>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{title:"Lightning Fast",desc:"Results in under 30 seconds."},{title:"Studio Quality",desc:"Photorealistic and natural."},{title:"Secure & Private",desc:"Images processed and deleted."}].map((f,i)=>(
            <div key={i} className="p-6 rounded-2xl bg-brand-dark-card border border-brand-dark-border">
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <WaitlistForm />
    </div>
  );
}
