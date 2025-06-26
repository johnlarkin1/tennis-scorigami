import { Metadata } from "next";

export function generateMetadata(): Metadata {
  const baseUrl = "https://www.tennis-scorigami.com";

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
      // Discord specific - explicitly specify GIF support
      "discord:image": `${baseUrl}/unfurls/hero-section.gif`,
      "discord:image:width": "1200",
      "discord:image:height": "630",
      "discord:image:type": "image/gif",

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

      // Explicit GIF support declarations
      "og:video": `${baseUrl}/unfurls/hero-section.gif`,
      "og:video:type": "image/gif",
      "og:video:width": "1200",
      "og:video:height": "630",
    },
  };
}

// Helper function to generate platform-specific metadata
export function getPlatformSpecificImage(
  userAgent?: string,
  imageType: "hero" | "2d-graph" = "hero"
): { url: string; type: string } {
  const baseUrl = "https://tennis-scorigami.com";

  // Determine base image names
  const images = {
    hero: {
      gif: `${baseUrl}/unfurls/hero-section.gif`,
      static: `${baseUrl}/unfurls/hero-section-static.png`,
      mp4: `${baseUrl}/unfurls/hero-section.mp4`, // MP4 for iMessage autoplay
    },
    "2d-graph": {
      gif: `${baseUrl}/unfurls/2d-graph.gif`,
      static: `${baseUrl}/unfurls/2d-graph-static.png`,
      mp4: `${baseUrl}/unfurls/2d-graph.mp4`,
    },
  };

  // Default to GIF for platforms that support it
  let imageUrl = images[imageType].gif;
  let mimeType = "image/gif";

  if (userAgent) {
    // Convert to lowercase for case-insensitive matching
    const ua = userAgent.toLowerCase();

    // Explicitly handle Discord - always use GIF
    if (ua.includes("discordbot") || ua.includes("discord")) {
      imageUrl = images[imageType].gif;
      mimeType = "image/gif";
      // Return early to ensure Discord gets GIF
      return { url: imageUrl, type: mimeType };
    }
    // Platforms that don't support GIFs - use static image
    else if (
      ua.includes("twitterbot") ||
      ua.includes("twitter") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("whatsapp")
    ) {
      imageUrl = images[imageType].static;
      mimeType = "image/png";
    }
    // iMessage/iOS - use static image (will be overridden by video tags)
    else if (
      ua.includes("iphone") ||
      ua.includes("ipad") ||
      (ua.includes("applewebkit") &&
        (ua.includes("mobile") ||
          (ua.includes("safari") && !ua.includes("chrome"))))
    ) {
      imageUrl = images[imageType].static;
      mimeType = "image/png";
    }
    // Default case: Platforms that support GIFs (LinkedIn, Slack, etc.)
    // Keep GIF (already set as default)
  }

  return { url: imageUrl, type: mimeType };
}

// Helper function to check if user agent is iMessage/iOS
export function isIMessageUserAgent(userAgent?: string): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    (ua.includes("applewebkit") &&
      (ua.includes("mobile") ||
        (ua.includes("safari") && !ua.includes("chrome"))))
  );
}

// Legacy function for backwards compatibility - returns just the URL string
export function getPlatformSpecificImageUrl(userAgent?: string): string {
  return getPlatformSpecificImage(userAgent, "hero").url;
}
