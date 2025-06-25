import { HedgehogIcon } from "@/components/ui/hedgehog-icon";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Brain,
  Code,
  Database,
  Terminal,
} from "lucide-react";
import React from "react";
import { SectionHeader } from "./section";
import { TechCard } from "./tech-card";

const ExternalLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-green-400 hover:text-green-300 underline cursor-pointer"
  >
    {children}
  </a>
);

export const TechnologyStack: React.FC<{ id?: string }> = ({ id }) => {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Technology Stack"
          subtitle="Built with modern tools (...and optimizing for cost)"
          id={id}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto py-8 place-items-center">
          <TechCard
            icon={<Code />}
            title="NextJS"
            description={
              <>
                <ExternalLink href="https://vercel.com/blog/turbopack">
                  Turbopack
                </ExternalLink>{" "}
                with NextJS 15
              </>
            }
          />
          <TechCard
            icon={<Database />}
            title="PostgreSQL"
            description={
              <>
                Big fan of{" "}
                <ExternalLink href="https://neon.com/">Neon</ExternalLink>{" "}
                (started with{" "}
                <ExternalLink href="https://supabase.com/">
                  Supabase
                </ExternalLink>
                , then{" "}
                <ExternalLink href="https://aiven.io/">Aiven</ExternalLink>,
                then finally{" "}
                <ExternalLink href="https://neon.com/">Neon</ExternalLink>)
              </>
            }
          />
          <TechCard
            icon={<BarChart3 />}
            title="D3.js, Sigma.js, and react-force-graph"
            description={
              <>
                Kudos to{" "}
                <ExternalLink href="https://github.com/vasturiano">
                  Vasco Asturiano
                </ExternalLink>{" "}
                for react-force-graph!
              </>
            }
          />
          <TechCard
            icon={<Brain />}
            title="TypeScript"
            description="Type-safe development"
          />
          <TechCard
            icon={<Terminal className="w-8 h-8" />}
            title="Python"
            description={
              <>
                Used for data ETL (cleaning, preparing, ingestion) from various
                sources (ATP, WTA, ITF, etc.)
              </>
            }
          />
          <TechCard
            icon={<HedgehogIcon />}
            title="PostHog"
            description={
              <>
                Open-source analytics platform for tracking user behavior and
                product insights
              </>
            }
          />
        </div>
        <div className="mb-10" />

        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <ExternalLink href="https://johnlarkin1.github.io/2025/tennis-scorigami/">
              <div className="flex items-center gap-2 bg-gray-800 text-md hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors">
                <BookOpen className="w-5 h-5" />
                <span>Read the technical deep dive on my blog</span>
              </div>
            </ExternalLink>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
