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
export function getPlatformSpecificImage(userAgent?: string): string {
  const baseUrl = "https://tennis-scorigami.com";
  
  // Default to GIF
  let imageUrl = `${baseUrl}/unfurls/hero-section.gif`;
  
  if (userAgent) {
    // Twitter clients
    if (userAgent.includes("Twitterbot")) {
      imageUrl = `${baseUrl}/unfurls/hero-section-static.png`;
    }
    // Facebook crawler
    else if (userAgent.includes("facebookexternalhit")) {
      imageUrl = `${baseUrl}/unfurls/hero-section-static.png`;
    }
    // WhatsApp
    else if (userAgent.includes("WhatsApp")) {
      imageUrl = `${baseUrl}/unfurls/hero-section-static.png`;
    }
  }
  
  return imageUrl;
}