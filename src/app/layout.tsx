import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pinball Brackets",
  description: "Think you know who will win the IFPA State Championship this year? Prove it by making free March Madness-style brackets!",
  metadataBase: new URL("https://www.pinballbrackets.com"),
  openGraph: {
    title: "Pinball Brackets",
    description: "Think you know who will win the IFPA State Championship this year? Prove it by making free March Madness-style brackets!",
    url: "https://www.pinballbrackets.com",
    siteName: "Pinball Brackets",
    images: [
      {
        url: "/logo.png",
        alt: "Pinball Brackets",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinball Brackets",
    description: "Think you know who will win the IFPA State Championship this year? Prove it by making free March Madness-style brackets!",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Always apply dark mode - light mode code kept for potential future use */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]">
        <ThemeProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
