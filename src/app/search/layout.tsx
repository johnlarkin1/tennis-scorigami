import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Tennis Scorigami",
  description:
    "Search tennis matches, players, and tournaments. Find specific scorelines and discover unique match results across professional tennis history.",
  keywords: [
    "tennis search",
    "match results",
    "player search",
    "tournament search",
    "tennis scores",
    "scorigami search",
  ],
  openGraph: {
    title: "Search Tennis Scorigami",
    description:
      "Search tennis matches, players, and tournaments across professional tennis history",
    url: "https://www.tennis-scorigami.com/search",
    siteName: "Tennis Scorigami",
    images: [
      {
        url: "https://www.tennis-scorigami.com/unfurls/2d-graph-static.png",
        width: 1200,
        height: 630,
        alt: "Tennis Score Tree Visualization",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Tennis Scorigami",
    description:
      "Search tennis matches, players, and tournaments across professional tennis history",
    images: ["https://www.tennis-scorigami.com/unfurls/2d-graph-static.png"],
    creator: "@tennisscorigami",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
