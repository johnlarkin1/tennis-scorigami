import { Metadata } from "next";

export function generateMetadata(): Metadata {
  const baseUrl = "https://tennis-scorigami.com";

  return {
    metadataBase: new URL(baseUrl),
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
      url: baseUrl,
      siteName: "Tennis Scorigami",
      images: [
        {
          url: `${baseUrl}/unfurls/hero-section.gif`,
          width: 1200,
          height: 630,
          alt: "Tennis Scorigami - Explore never-played tennis scores",
          type: "image/gif",
        },
        // Fallback static image for platforms that don't support GIF
        {
          url: `${baseUrl}/unfurls/hero-section-static.png`,
          width: 1200,
          height: 630,
          alt: "Tennis Scorigami - Explore never-played tennis scores",
          type: "image/png",
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
      images: [`${baseUrl}/unfurls/hero-section-static.png`],
      creator: "@tennisscorigami",
    },
    // Additional platform-specific metadata
    other: {
      // LinkedIn specific
      "linkedin:image": `${baseUrl}/unfurls/hero-section.gif`,
      "linkedin:image:type": "image/gif",
      "linkedin:image:width": "1200",
      "linkedin:image:height": "627", // LinkedIn prefers 1.91:1 ratio

      // Apple/iMessage specific
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",

      // Additional labels for Slack and other platforms
      "twitter:label1": "Category",
      "twitter:data1": "Sports Analytics",
      "twitter:label2": "Reading time",
      "twitter:data2": "Interactive experience",
    },
  };
}

// Helper function to generate platform-specific metadata
export function getPlatformSpecificImage(
  userAgent?: string,
  imageType: 'hero' | '2d-graph' = 'hero'
): { url: string; type: string } {
  const baseUrl = "https://tennis-scorigami.com";

  // Determine base image names
  const images = {
    hero: {
      gif: `${baseUrl}/unfurls/hero-section.gif`,
      static: `${baseUrl}/unfurls/hero-section-static.png`,
    },
    '2d-graph': {
      gif: `${baseUrl}/unfurls/2d-graph.gif`,
      static: `${baseUrl}/unfurls/2d-graph-static.png`,
    },
  };

  // Default to GIF for platforms that support it
  let imageUrl = images[imageType].gif;
  let mimeType = "image/gif";

  if (userAgent) {
    // Platforms that don't support GIFs - use static image
    if (
      userAgent.includes("Twitterbot") ||
      userAgent.includes("facebookexternalhit") ||
      userAgent.includes("WhatsApp") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    ) {
      imageUrl = images[imageType].static;
      mimeType = "image/png";
    }
    // Platforms that support GIFs: LinkedIn, Discord, Slack
    // (Default case already handles this)
  }

  return { url: imageUrl, type: mimeType };
}

// Legacy function for backwards compatibility - returns just the URL string
export function getPlatformSpecificImageUrl(userAgent?: string): string {
  return getPlatformSpecificImage(userAgent, 'hero').url;
}
