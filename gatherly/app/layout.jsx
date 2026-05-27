import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from '@clerk/ui/themes'

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Gatherly - Delightful Events Start Here",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`bg-gradient-to-br from-gray-950 via-zinc-900 to-stone-950 text-white font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header */}
          <ClerkProvider appearance={{
            theme: shadcn,
          }}>
            <ConvexClientProvider>
              <Header />
              <main className="container relative min-h-screen pt-40 mx-auto md:pt-32">
                {/* Glow Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                  <div className="absolute top-0 rounded-full left-1/4 h-96 bg-pink-600/20 blur-3xl w-96" />
                  <div className="absolute bottom-0 rounded-full right-1/4 h-96 bg-orange-600/20 blur-3xl w-96" />
                </div>
                <div className="relative z-10 min-h-[70vh]">{children}</div>
                {/* Footer */}
                <footer className="px-6 py-8 mx-auto border-t border-gray-800/50 max-w-7xl">
                  <div className="text-sm text-gray-400">Welcome to Gatherly!</div>
                </footer>
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
