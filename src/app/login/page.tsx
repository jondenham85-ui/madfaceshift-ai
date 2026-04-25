"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("Account created! Signing in...");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid credentials");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-brand-dark-card border border-brand-dark-border rounded-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 gradient-text">{isRegister ? "Create Account" : "Welcome Back"}</h1>
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full py-3 rounded-lg border border-brand-dark-border text-gray-300 hover:border-brand-orange transition mb-4 font-semibold">Continue with Google</button>
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-brand-dark-border" /><span className="text-gray-500 text-sm">or</span><div className="flex-1 h-px bg-brand-dark-border" /></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-brand-dark border border-brand-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-brand-dark border border-brand-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-brand-dark border border-brand-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
          <button type="submit" disabled={loading} className="glow-button w-full py-3 rounded-lg text-white font-bold disabled:opacity-50">{loading ? "Loading..." : isRegister ? "Create Account" : "Sign In"}</button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-brand-orange hover:underline">{isRegister ? "Sign In" : "Create Account"}</button>
        </p>
      </div>
    </div>
  );
}
