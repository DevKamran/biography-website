import type { Metadata } from "next";
import "./globals.css";

const title = "Kamran Ali | Full Stack Developer & UI/UX Engineer";
const description =
  "Kamran Ali is a Full Stack Developer frontend focused with 7+ years building enterprise SaaS and AI-powered products, hand-coding pixel-perfect React.js interfaces from Figma.";

export const metadata: Metadata = {
  metadataBase: new URL("https://imkamranaly.vercel.app/"),
  title,
  description,
  icons: {
    icon: "/img/logo.png",
    shortcut: "/img/logo.png",
    apple: "/img/logo.png",
  },
  openGraph: {
    title,
    description,
    url: "/",
    images: [
      {
        url: "/img/social_share.jpeg",
        width: 1670,
        height: 726,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/img/social_share.jpeg"],
  },
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
