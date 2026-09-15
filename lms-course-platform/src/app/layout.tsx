import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "LMS — Learning Management System",
    template: "%s | LMS",
  },
  description: "Learn, practice, and grow with structured online courses.",
  openGraph: {
    type: "website",
    title: "LMS — Learning Management System",
    description: "Learn, practice, and grow with structured online courses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LMS — Learning Management System",
    description: "Learn, practice, and grow with structured online courses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-full font-sans font-medium">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster closeButton position='bottom-right' />
        </ThemeProvider>
      </body>
    </html>
  );
}