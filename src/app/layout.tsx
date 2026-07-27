import type { Metadata } from "next";
import { Syne, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import { SiteShell } from "@/components/layout/SiteShell";
import { getSearchIndex } from "@/lib/tools/registry";
import { createPageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/urls";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  ...createPageMetadata({
    title: SITE_NAME,
    description: `${SITE_TAGLINE}. Everything runs securely inside your browser — formatters, PDF, images, calculators, and converters. No account required.`,
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchItems = getSearchIndex();

  return (
    <html
      lang="en"
      className={`${syne.variable} ${sourceSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteShell searchItems={searchItems}>{children}</SiteShell>
      </body>
    </html>
  );
}
