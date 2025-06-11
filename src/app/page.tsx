import { HeroSection } from "@/components/landing/hero-section";
import UnscoredMatchesSection from "@/components/landing/unscored-matches-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Metadata } from "next";
import { headers } from "next/headers";
import { getPlatformSpecificImage } from "./metadata";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const baseUrl = "https://tennis-scorigami.com";
  const { url: imageUrl, type: imageType } =
    getPlatformSpecificImage(userAgent);

  return {
    openGraph: {
      title: "Tennis Scorigami",
      description:
        "Explore never-played tennis scores and unique match progressions",
      url: baseUrl,
      siteName: "Tennis Scorigami",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "Tennis Scorigami - Explore never-played tennis scores",
          type: imageType,
        },
      ],
    },
  };
}

export default function Home() {
  return (
    <div className="bg-gray-900 text-white">
      <Header />
      <main>
        {/* Main content visible on initial load */}
        <div className="min-h-screen flex flex-col">
          <HeroSection className="h-[20vh] sm:h-[30vh]" />
          <UnscoredMatchesSection className="h-auto flex-1" />

          {/* <FloatingExploreButton targetId="force-graph" /> */}
        </div>

        {/* Additional sections below the fold */}
        {/* <KeyStatsSection stats={stats} isLoading={isLoading} error={error} /> */}

        {/* <ConceptExplanation /> */}

        {/* 3D Force Graph Section */}
        {/* <ForceGraphSection /> */}
      </main>
      <Footer />
    </div>
  );
}
