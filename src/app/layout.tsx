import { Providers } from "@/providers";
import "@/styles";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://tennis-scorigami.com"),
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
    { name: "Henry Carscadden" },
    { name: "Sebastian Tota" },
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
    url: "https://tennis-scorigami.com",
    siteName: "Tennis Scorigami",
    images: [
      {
        url: "https://tennis-scorigami.com/unfurls/hero-section.gif",
        width: 1200,
        height: 630,
        alt: "Tennis Scorigami - Explore never-played tennis scores",
        type: "image/gif",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tennis Scorigami",
    description:
      "Explore never-played tennis scores and unique match progressions",
    // Use static image for Twitter since it doesn't support animated GIFs
    images: ["https://tennis-scorigami.com/unfurls/hero-section-static.png"],
    creator: "@tennisscorigami",
  },
  other: {
    // LinkedIn specific - keep GIF for LinkedIn since it works there
    "linkedin:image": "https://tennis-scorigami.com/unfurls/hero-section.gif",
    // Additional labels for Slack and other platforms
    "twitter:label1": "Category",
    "twitter:data1": "Sports Analytics",
    "twitter:label2": "Experience",
    "twitter:data2": "Interactive data visualization",
  },
};

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

        {/* Additional meta tags for better social sharing */}
        <meta property="og:site_name" content="Tennis Scorigami" />
        <meta property="og:image:type" content="image/gif" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Tennis Scorigami - Explore never-played tennis scores"
        />
        {/* Discord-specific meta tags to ensure only GIF is shown */}
        <meta property="og:image:secure_url" content="https://tennis-scorigami.com/unfurls/hero-section.gif" />
        <meta name="twitter:creator" content="@tennisscorigami" />
        <meta name="twitter:site" content="@tennisscorigami" />
        <meta
          name="twitter:image:alt"
          content="Tennis Scorigami - Explore never-played tennis scores"
        />
      </head>
      <body
        className={`${roboto.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
