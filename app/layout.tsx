import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { Providers } from "@/components/providers";
import { site } from "@/lib/site";
import "./globals.css";

const ar = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-ar", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display", display: "swap" });

const siteUrl = process.env.URL || "https://tu1b-live.netlify.app";
const description = `${site.name} (${site.nameAr} · ${site.realName.ar}) — ${site.intro.ar}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} | ${site.nameAr} — ستريمر كيك`, template: `%s | ${site.name}` },
  description,
  keywords: [site.name, site.nameAr, site.realName.ar, "Kick", "كيك", "ستريمر", "streamer", "Saudi"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.nameAr}`,
    description: site.intro.ar,
  },
  twitter: { card: "summary_large_image", title: `${site.name} — ${site.nameAr}`, description: site.intro.ar },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#07060b", colorScheme: "dark", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: [site.nameAr, site.realName.ar, site.realName.en],
  description: site.intro.en,
  url: siteUrl,
  image: siteUrl + site.profileImage,
  sameAs: [...site.socials, ...site.moreLinks].filter((l) => l.id !== "tip" && l.id !== "shop").map((l) => l.url),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const vars = {
    "--primary": site.colors.primary,
    "--secondary": site.colors.secondary,
    "--neon": site.colors.neon,
    "--accent": site.colors.accent,
  } as CSSProperties;
  return (
    <html lang="ar" dir="rtl" className={`${ar.variable} ${display.variable}`} style={vars} suppressHydrationWarning>
      <body className="bg-ink font-sans text-zinc-100 antialiased">
        <a href="#main" className="skip-link">تخطَّ إلى المحتوى</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
