import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { CURRENT_SEASON } from "@/lib/season";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://artbasel.space');
const shareImage = new URL(`/miami-art-week-${CURRENT_SEASON.year}-share-hero.png`, siteUrl).href;
const shareTitle = `Your Guide to Miami Art Week ${CURRENT_SEASON.year}`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `Miami Art Week ${CURRENT_SEASON.year} | Basel.ai Events Guide`,
  description: `An independent guide to Miami Art Week ${CURRENT_SEASON.year}. Find art fairs, exhibitions, parties, and events with source links and checked dates.`,
  keywords: `Art Basel, Miami, ${CURRENT_SEASON.year}, art shows, parties, events, Wynwood, Miami Beach, Design District`,
  manifest: "/manifest.json",
  openGraph: {
    type: 'website',
    siteName: 'Basel.ai',
    title: shareTitle,
    description: 'Discover art shows, parties, and wellness events during Miami Art Week.',
    images: [{ url: shareImage, width: 1200, height: 630, type: 'image/png', alt: shareTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    images: [{ url: shareImage, alt: shareTitle }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Basel.ai",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
