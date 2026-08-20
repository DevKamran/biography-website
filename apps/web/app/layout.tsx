import type { Metadata } from "next";
import "./globals.css";

// TODO: replace with your name / title
export const metadata: Metadata = {
  title: "Your Name — Portfolio",
  description: "Portfolio site with an interactive AI chat, powered by LiveKit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
