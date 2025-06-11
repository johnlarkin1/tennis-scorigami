import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPlatformSpecificImage } from "../metadata";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const image = getPlatformSpecificImage(userAgent, '2d-graph');

  return {
    title: "Explore Tennis Scorigami Data",
    description:
      "Interactive 2D and 3D visualizations of tennis score sequences and match progressions. Discover unique score patterns and never-played sequences.",
    keywords: [
      "tennis visualization",
      "3D graph",
      "score tree",
      "data exploration",
      "interactive graph",
      "tennis analytics",
    ],
    openGraph: {
      title: "Explore Tennis Scorigami Data",
      description:
        "Interactive 2D and 3D visualizations of tennis score sequences and match progressions",
      url: "https://tennis-scorigami.com/explore",
      siteName: "Tennis Scorigami",
      images: [
        {
          url: image.url,
          width: 1200,
          height: 630,
          alt: "Tennis Score Network Visualization",
          type: image.type,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore Tennis Scorigami Data",
      description:
        "Interactive 2D and 3D visualizations of tennis score sequences and match progressions",
      images: [image.url],
      creator: "@tennisscorigami",
    },
    other: {
      // LinkedIn specific - always use GIF for LinkedIn
      "linkedin:image": "https://tennis-scorigami.com/unfurls/2d-graph.gif",
      "linkedin:image:type": "image/gif",
      "linkedin:image:width": "1200",
      "linkedin:image:height": "630",
    },
  };
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
