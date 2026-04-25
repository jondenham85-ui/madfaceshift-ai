"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FaceSwap from "@/components/FaceSwap";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;
  if (!session) return null;

  const plan = (session.user as any)?.plan || "free";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {session.user?.name || session.user?.email}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-dark-card border border-brand-dark-border text-brand-orange">{plan} plan</span>
      </div>
      <div className="p-6 bg-brand-dark-card border border-brand-dark-border rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-4">Face Swap</h2>
        <FaceSwap />
      </div>
    </div>
  );
}
