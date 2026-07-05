import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M&M AI Sourcing Assistant",
  description: "Demo-only AI sourcing assistant prototype for laptop procurement.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
