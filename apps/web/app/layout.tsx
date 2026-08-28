import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kamran Ali | Senior UI/UX Engineer",
  description:
    "Kamran Ali is a Senior UI/UX Engineer with 7+ years building enterprise SaaS and AI-powered products, hand-coding pixel-perfect React.js interfaces from Figma.",
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
