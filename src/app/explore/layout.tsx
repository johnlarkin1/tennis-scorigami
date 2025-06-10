import type { Metadata } from "next";

export const metadata: Metadata = {
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
        url: "https://tennis-scorigami.com/unfurls/2d-graph.gif",
        width: 1200,
        height: 630,
        alt: "3D Tennis Score Network Visualization",
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
    images: ["https://tennis-scorigami.com/unfurls/2d-graph.gif"],
    creator: "@tennisscorigami",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
