"use client";

import { CallToAction } from "@/components/about/call-to-action";
import { DataCollection } from "@/components/about/data-collection";
import { FeedbackSection } from "@/components/about/feedback-section";
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
  const sectionIds = [
    "project-overview",
    "data-collection",
    "technology-stack",
    "team",
    "feedback",
    "call-to-action",
  ];
  useSectionObserver(sectionIds);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Header />

      <main>
        <HeroSection />

        <Section id="project-overview">
          <ProjectOverview id="project-overview" />
        </Section>

        <Section
          className="relative bg-gradient-to-br from-gray-800/70 via-green-900/20 to-blue-900/30 overflow-hidden"
          id="data-collection"
        >
          {/* Tennis court background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-0.5 h-full bg-white"></div>
            <div className="absolute top-0 right-1/4 w-0.5 h-full bg-white"></div>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2"></div>
            <div className="absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-white"></div>
            <div className="absolute bottom-1/4 left-1/4 right-1/4 h-0.5 bg-white"></div>
          </div>
          {/* Animated floating tennis balls */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-30 animate-bounce"
              style={{ animationDelay: "0s", animationDuration: "3s" }}
            ></div>
            <div
              className="absolute top-40 right-20 w-3 h-3 bg-yellow-400 rounded-full opacity-20 animate-bounce"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            ></div>
            <div
              className="absolute bottom-32 left-1/3 w-5 h-5 bg-yellow-400 rounded-full opacity-25 animate-bounce"
              style={{ animationDelay: "2s", animationDuration: "3.5s" }}
            ></div>
            <div
              className="absolute bottom-20 right-1/4 w-3.5 h-3.5 bg-yellow-400 rounded-full opacity-30 animate-bounce"
              style={{ animationDelay: "0.5s", animationDuration: "2.8s" }}
            ></div>
          </div>
          <DataCollection id="data-collection" />
        </Section>

        <Section id="technology-stack">
          <TechnologyStack id="technology-stack" />
        </Section>

        <Section className="bg-gray-800/50" id="team">
          <TeamSection id="team" />
        </Section>

        <Section id="feedback">
          <FeedbackSection id="feedback" />
        </Section>

        <Section className="bg-gray-800/50" id="call-to-action">
          <CallToAction id="call-to-action" />
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
