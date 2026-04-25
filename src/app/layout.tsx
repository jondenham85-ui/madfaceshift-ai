import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MADFaceShift AI - AI Face Swap",
  description: "Professional AI-powered face swapping in seconds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster position="bottom-right" toastOptions={{ style: { background: "#141414", color: "#fff", border: "1px solid #2A2A2A" } }} />
        </SessionWrapper>
      </body>
    </html>
  );
}
