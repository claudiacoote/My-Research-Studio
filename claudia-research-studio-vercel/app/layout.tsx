import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claudia's research studio",
  description: "Turn real academic research into credible, traceable content opportunities.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
