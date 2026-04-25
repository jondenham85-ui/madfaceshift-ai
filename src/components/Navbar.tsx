"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-brand-dark-border bg-brand-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold gradient-text">MADFaceShift AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
              <button onClick={() => signOut()} className="text-gray-400 hover:text-white transition text-sm">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="glow-button px-4 py-2 rounded-lg text-white font-semibold text-sm">Get Started</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
