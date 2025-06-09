import { motion } from "framer-motion";
import { Activity, Calendar, Globe, Trophy } from "lucide-react";
import React from "react";
import { Section, SectionHeader } from "./section";

export const ProjectOverview: React.FC<{ id?: string }> = ({ id }) => {
  const stats = [
    {
      label: "Sets Analyzed",
      value: "750k+",
      icon: <Activity className="w-6 h-6" />,
    },
    {
      label: "Unique Score Slugs Found",
      value: "15,143",
      icon: <Trophy className="w-6 h-6" />,
    },
    {
      label: "Years of Data",
      value: "44",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      label: "Tournaments Covered",
      value: "1,000+",
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  return (
    <Section>
      <SectionHeader
        title="The Project"
        subtitle="Exploring the mathematical beauty of tennis scoring"
        id={id}
      />

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold mb-6 text-green-400">
            What is Scorigami?
          </h3>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            Scorigami represents the occurrence of a final score that has never
            happened before in a sport&apos;s history. Originated by{" "}
            <a
              href="https://en.wikipedia.org/wiki/Jon_Bois"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 underline"
            >
              Jon Bois
            </a>{" "}
            for American football, we&apos;ve adapted this concept to tennis,
            tracking every unique match score combination across professional
            tournaments.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            With tennis&apos;s unique scoring system, there are 735 possible
            final scores in best-of-3 matches and over 108,000 in best-of-5
            matches. Our mission is to track which of these have occurred and
            which remain theoretical possibilities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3 text-green-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
