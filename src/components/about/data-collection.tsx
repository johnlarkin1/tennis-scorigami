import { motion } from "framer-motion";
import { Award, Database, LineChart, Target } from "lucide-react";
import React from "react";
import { FeatureCard } from "./feature-card";
import { Section, SectionHeader } from "./section";

// Animated glowing tag for 'Coming Soon'
const ComingSoonTag: React.FC = () => (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-400/90 text-yellow-900 text-xs font-bold animate-pulse-glow border border-yellow-300 relative">
    <span className="relative z-10">Coming Soon</span>
    {/* Animated glow effect */}
    <span className="absolute inset-0 rounded-full pointer-events-none animate-glow" />
  </span>
);

export const DataCollection: React.FC<{ id?: string }> = ({ id }) => {
  const timelineEvents = [
    {
      year: "1968",
      event: "Open Era begins",
      description: (
        <>
          Professional tennis enters the modern era, allowing pros to compete in
          Grand Slams.
          <br />
          <br />
          Welcome to civilization.
        </>
      ),
    },
    {
      year: "1973",
      event: "ATP Rankings launch",
      description: (
        <>
          Official computer rankings system established for men&apos;s tennis...
          <br />
          <br />
          How insane is that? Before this, it was just Lance Tigray and the
          likes ranking tennis players for seeds.
        </>
      ),
    },
    {
      year: "1990s",
      event: "Digital scorekeeping",
      description:
        "Finally some tech in the mix. Electronic line calling and digital match tracking begin at major tournaments.",
    },
    {
      year: "2012",
      event: "Potential scorigami?",
      description:
        "Henry and John play a best of five on the (fake green) clay in Cincinnati. Who knows - coulda been a scorigami, if only this project was around",
    },
    {
      year: "2024",
      event: "Groupchat texts about Tennis Scorigami",
      description: (
        <>
          <a
            href="https://www.linkedin.com/in/jebhenryhead/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
          >
            Henry
          </a>
          {", "}
          <a
            href="https://www.linkedin.com/in/sebastian-hoar-a71a5b112/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
          >
            Seb
          </a>
          {", and "}
          <a
            href="https://www.linkedin.com/in/johnlarkin/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
          >
            John
          </a>
          {" start yapping about tracking unique tennis scores in a groupchat"}
        </>
      ),
    },
    {
      year: "2025",
      event: "Tennis Scorigami launch",
      description:
        "Interactive visualization platform goes live to explore score patterns",
    },
  ];

  return (
    <Section>
      <SectionHeader
        title="Data Collection & Analysis"
        subtitle="From tennis history to comprehensive database"
        id={id}
      />

      <div className="relative z-20 max-w-6xl mx-auto">
        {/* Timeline */}
        <div className="relative mb-20 px-4 sm:px-0">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-green-500 to-blue-500" />

          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0
                  ? "flex-col md:flex-row"
                  : "flex-col md:flex-row-reverse"
              }`}
            >
              <div
                className={`w-full md:w-5/12 ${
                  index % 2 === 0
                    ? "text-center md:pr-12"
                    : "text-center md:pl-12"
                }`}
              >
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="text-green-400 font-bold text-2xl mb-2">
                    {event.year}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{event.event}</h4>
                  <p className="text-gray-400">{event.description}</p>
                </div>
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-gray-900 md:top-1/2 md:-translate-y-1/2 -top-2" />
            </motion.div>
          ))}
        </div>

        {/* Data Collection Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-900 rounded-2xl p-8 mb-16"
        >
          <h3 className="text-3xl font-bold mb-6 text-center">
            The Challenge of Tennis Data
          </h3>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            In a more meta sense, the data quality of this project was (and is)
            one of the biggest challenges of this. It&apos;s borderline
            impossible to find <b>free</b> high-quality tennis data. I signed up
            for numerous free trials to pull as much data as I could from
            SportRadar, SportsDataIO, SportsDev, and RapidAPI. We actually had a
            good amount of success with RapidAPI for a truly free (but highly
            rate limited platform). SportRadar (sadly) is preposteroulsy
            expensive but has some of the highest quality data.
          </p>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Data is fragmented across multiple sources, often incomplete, and
            requires significant cleaning and normalization. The bulk of this
            data comes from Jeff Sackmann&apos;s comprehensive tennis databases,
            but... even with that, there are numerous issues, redundant
            player-ids, incorrect scores, etc.
          </p>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            We have plans to build a more sophisticated data collection system
            and make this data free through API and files that are free to
            download.
          </p>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Although this being said, per usual, we&apos;re stronger together,
            so please join the Discord or file a Canny issue, or email us,
            whatever you want if you <b>HAVE</b> tennis data, or you see any
            issues with the data.
          </p>

          <div className="grid md:grid-cols-1 gap-8 px-4 sm:px-0">
            <div className="bg-gray-800 p-6 rounded-lg">
              <Award className="w-8 h-8 text-green-400 mb-4" />
              <h4 className="text-xl font-bold mb-3">Special Thanks</h4>
              <p className="text-gray-300 mb-4">
                Once again, we owe a tremendous debt of gratitude to{" "}
                <a
                  href="https://www.jeffsackmann.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
                >
                  Jeff Sackmann
                </a>
                , whose comprehensive tennis databases form the foundation of
                our historical data. Jeff has painstakingly compiled match
                results, player information, and detailed statistics for ATP and
                WTA tours going back decades.
              </p>
              <p className="text-gray-300 mb-4">
                You can find his invaluable open-source repositories at{" "}
                <a
                  href="https://github.com/JeffSackmann/tennis_atp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
                >
                  ATP Data
                </a>{" "}
                and{" "}
                <a
                  href="https://github.com/JeffSackmann/tennis_wta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 font-semibold hover:text-green-300 transition-colors underline"
                >
                  WTA Data
                </a>
                . He has put in hundreds of hours of work to get the data to
                where it is (and i think he&apos;s sandbagging and probably
                it&apos;s more time than that).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 px-4 sm:px-0"
        >
          <FeatureCard
            icon={<Database className="w-8 h-8" />}
            title="Comprehensive Coverage"
            description="Data from 1968 onwards, covering ATP, WTA, and Grand Slam tournaments"
          />
          <FeatureCard
            icon={<LineChart className="w-8 h-8" />}
            title={
              <span className="flex items-center">
                Real-time Updates
                <ComingSoonTag />
              </span>
            }
            description="Continuous monitoring of ongoing tournaments to identify new scorigami moments"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Data Integrity"
            description="Rigorous validation and cross-referencing to ensure accuracy across all matches"
          />
        </motion.div>
      </div>
    </Section>
  );
};
