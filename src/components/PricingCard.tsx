"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PricingCardProps {
  name: string;
  price: string;
  swaps: string;
  features: string[];
  planKey: string;
  popular?: boolean;
}

export default function PricingCard({ name, price, swaps, features, planKey, popular }: PricingCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.approveUrl) window.location.href = data.approveUrl;
      else throw new Error("Failed to create subscription");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative p-6 rounded-2xl border ${popular ? "border-brand-orange bg-brand-dark-card shadow-lg shadow-brand-orange/10" : "border-brand-dark-border bg-brand-dark-card"}`}>
      {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>}
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-3xl font-extrabold gradient-text mb-1">{price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
      <p className="text-gray-400 text-sm mb-4">{swaps} swaps/month</p>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="text-gray-300 text-sm flex items-center gap-2"><span className="text-brand-orange">&#10003;</span>{f}</li>
        ))}
      </ul>
      <button onClick={handleSubscribe} disabled={loading} className={`w-full py-3 rounded-lg font-semibold transition ${popular ? "glow-button text-white" : "bg-brand-dark border border-brand-dark-border text-gray-300 hover:border-brand-orange hover:text-white"}`}>
        {loading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  );
}
