import PricingCard from "@/components/PricingCard";

const plans = [
  { name: "Basic", price: "$9", swaps: "50", planKey: "basic", features: ["50 face swaps/month", "Standard quality", "Email support"] },
  { name: "Pro", price: "$29", swaps: "200", planKey: "pro", popular: true, features: ["200 face swaps/month", "HD quality output", "Priority support", "Batch processing"] },
  { name: "Unlimited", price: "$79", swaps: "Unlimited", planKey: "unlimited", features: ["Unlimited face swaps", "Ultra HD quality", "24/7 priority support", "API access", "Batch processing"] },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold gradient-text mb-4">Simple Pricing</h1>
        <p className="text-gray-400 text-lg">Start free with 3 swaps. Upgrade anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => <PricingCard key={p.planKey} {...p} />)}
      </div>
    </div>
  );
}
