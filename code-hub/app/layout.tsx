import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/provider/ConvexClientProvider";
import "./globals.css";
import Footer from "@/components/provider/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeHub",
    template: "%s | CodeHub",
  },
  description: "CodeHub is a modern AI-powered SaaS code editor and collaborative coding platform for developers to build, run, and deploy projects faster.",
  keywords: [
    "CodeHub",
    "AI Code Editor",
    "Online IDE",
    "SaaS",
    "Collaborative Coding",
    "Developer Platform",
    "Code Editor",
    "Next.js",
    "Convex",
    "Clerk",
    "Programming",
  ],
  authors: [{ name: "Suraj Kumar Gupta" }],
  creator: "Suraj Gupta",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      >
        <body
          suppressHydrationWarning
          className="flex flex-col min-h-screen antialiased text-gray-100 bg-linear-to-b from-gray-900 to-gray-950"
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}