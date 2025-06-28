import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Tennis Scorigami",
  description:
    "Learn about the team, technology, and data behind Tennis Scorigami's exploration of unique tennis scores. Meet the creators and understand our methodology.",
  keywords: [
    "about tennis scorigami",
    "team",
    "methodology",
    "data sources",
    "technology stack",
    "tennis research",
  ],
  openGraph: {
    title: "About Tennis Scorigami",
    description:
      "Learn about the team, technology, and data behind Tennis Scorigami's exploration of unique tennis scores",
    url: "https://www.tennis-scorigami.com/about",
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
    title: "About Tennis Scorigami",
    description:
      "Learn about the team, technology, and data behind Tennis Scorigami's exploration of unique tennis scores",
    images: ["https://www.tennis-scorigami.com/unfurls/2d-graph-static.png"],
    creator: "@tennisscorigami",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
