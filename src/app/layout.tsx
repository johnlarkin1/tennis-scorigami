import { Providers } from "@/providers";
import "@/styles";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { getPlatformSpecificImage, isIMessageUserAgent } from "./metadata";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const image = getPlatformSpecificImage(userAgent, "hero");
  const isIMessage = isIMessageUserAgent(userAgent);

  return {
    metadataBase: new URL("https://www.tennis-scorigami.com"),
    title: "Tennis Scorigami",
    description:
      "Have we converged on all possible tennis scores? Explore never-played tennis scores and unique match progressions.",
    generator: "Next.js",
    keywords: [
      "tennis",
      "scorigami",
      "scores",
      "data visualization",
      "sports analytics",
      "tennis matches",
      "graph visualization",
    ],
    authors: [
      { name: "John Larkin", url: "https://johnlarkin1.github.io/" },
      { name: "Henry Head" },
      { name: "Sebastian Hoar" },
    ],
    icons: {
      icon: "/favicon/favicon.svg",
      apple: "/favicon/apple-touch-icon.png",
      shortcut: "/favicon/favicon.ico",
    },
    openGraph: {
      title: "Tennis Scorigami",
      description:
        "Explore never-played tennis scores and unique match progressions",
      url: "https://www.tennis-scorigami.com",
      siteName: "Tennis Scorigami",
      images: [
        {
          url: image.url,
          width: 1200,
          height: 630,
          alt: "Tennis Scorigami - Explore never-played tennis scores",
          type: image.type,
        },
      ],
      locale: "en_US",
      type: isIMessage ? "video.other" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Tennis Scorigami",
      description:
        "Explore never-played tennis scores and unique match progressions",
      images: [
        "https://www.tennis-scorigami.com/unfurls/hero-section-static.png",
      ],
      creator: "@tennisscorigami",
      site: "@tennisscorigami",
    },
    other: {
      // iMessage specific - use MP4 for autoplay
      ...(isIMessage
        ? {
            "og:video": "https://tennis-scorigami.com/unfurls/hero-section.mp4",
            "og:video:secure_url":
              "https://tennis-scorigami.com/unfurls/hero-section.mp4",
            "og:video:type": "video/mp4",
            "og:video:width": "1200",
            "og:video:height": "630",
          }
        : {}),
      // Discord specific - always use GIF for Discord
      ...(userAgent.includes("discord") || userAgent.includes("Discord")
        ? {
            "og:video": "https://tennis-scorigami.com/unfurls/hero-section.gif",
            "og:video:type": "image/gif",
            "og:video:width": "1200",
            "og:video:height": "630",
            "og:video:secure_url":
              "https://tennis-scorigami.com/unfurls/hero-section.gif",
          }
        : {}),
      // LinkedIn specific - always use GIF for LinkedIn
      "linkedin:image": "https://tennis-scorigami.com/unfurls/hero-section.gif",
      "linkedin:image:type": "image/gif",
      "linkedin:image:width": "1200",
      "linkedin:image:height": "630",
      // Additional labels for Slack and other platforms
      "twitter:label1": "Category",
      "twitter:data1": "Sports Analytics",
      "twitter:label2": "Experience",
      "twitter:data2": "Interactive data visualization",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-48x48.png"
          sizes="48x48"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className={`${roboto.className} ${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
