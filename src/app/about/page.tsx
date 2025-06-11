"use client";

import { CallToAction } from "@/components/about/call-to-action";
import { DataCollection } from "@/components/about/data-collection";
import { HeroSection } from "@/components/about/hero-section";
import { ProjectOverview } from "@/components/about/project-overview";
import { Section } from "@/components/about/section";
import { TeamSection } from "@/components/about/team-section";
import { TechnologyStack } from "@/components/about/technology-stack";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useSectionObserver } from "@/lib/hooks/use-section-observer";
import React from "react";

const AboutPage: React.FC = () => {
  const sectionIds = ['project-overview', 'data-collection', 'technology-stack', 'team', 'call-to-action'];
  useSectionObserver(sectionIds);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Header />

      <main>
        <HeroSection />

        <Section id="project-overview">
          <ProjectOverview id="project-overview" />
        </Section>

        <Section className="bg-gray-800/50" id="data-collection">
          <DataCollection id="data-collection" />
        </Section>

        <Section id="technology-stack">
          <TechnologyStack id="technology-stack" />
        </Section>

        <Section className="bg-gray-800/50" id="team">
          <TeamSection id="team" />
        </Section>

        <Section id="call-to-action">
          <CallToAction id="call-to-action" />
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
