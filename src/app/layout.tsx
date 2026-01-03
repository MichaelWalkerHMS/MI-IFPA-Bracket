import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IFPA Bracket Predictor",
  description: "Predict the outcomes of IFPA Pinball State Championships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
