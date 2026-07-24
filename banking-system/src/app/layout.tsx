export const dynamic = 'force-dynamic'
import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banking System",
  description: "A simple banking system built with Next.js, TypeScript, and Tailwind CSS.",
  icons: {
    icon: '/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, ibmPlexSerif.variable, "font-sans", geist.variable)}
    >
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
