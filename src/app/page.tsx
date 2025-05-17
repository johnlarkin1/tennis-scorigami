import { HeroSection } from "@/components/landing/hero-section";
import UnscoredMatchesSection from "@/components/landing/unscored-matches-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingExploreButton } from "@/components/ui/floating-explore-button";

export default function Home() {
  return (
    <div className="bg-gray-900 text-white">
      <Header />
      <main>
        {/* Main content visible on initial load */}
        <div className="min-h-screen flex flex-col">
          <HeroSection className="h-[30vh]" />
          <UnscoredMatchesSection className="h-auto flex-1" />

          <FloatingExploreButton targetId="force-graph" />
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
