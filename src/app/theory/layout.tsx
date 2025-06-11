import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tennis Scorigami Theory",
  description:
    "Theoretical foundations and mathematical concepts behind tennis score analysis and scorigami exploration. Dive deep into the mathematical models and algorithms.",
  keywords: [
    "tennis theory",
    "mathematical models",
    "graph theory",
    "score analysis",
    "algorithms",
    "data science",
  ],
  openGraph: {
    title: "Tennis Scorigami Theory",
    description:
      "Theoretical foundations and mathematical concepts behind tennis score analysis and scorigami exploration",
    url: "https://tennis-scorigami.com/theory",
    siteName: "Tennis Scorigami",
    images: [
      {
        url: "https://tennis-scorigami.com/unfurls/2d-graph-static.png",
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
    title: "Tennis Scorigami Theory",
    description:
      "Theoretical foundations and mathematical concepts behind tennis score analysis and scorigami exploration",
    images: ["https://tennis-scorigami.com/unfurls/2d-graph-static.png"],
    creator: "@tennisscorigami",
  },
};

export default function TheoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
