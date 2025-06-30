import { motion } from "framer-motion";
import React from "react";
import { Section, SectionHeader } from "./section";
import { TeamMember, TeamMemberCard } from "./team-member-card";

export const TeamSection: React.FC<{ id?: string }> = ({ id }) => {
  const teamMembers: TeamMember[] = [
    {
      name: "Henry Head",
      role: "Product Engineer",
      image: "/henry.jpeg",
      linkedin: "https://www.linkedin.com/in/jebhenryhead/",
      email: "jeb.henryhead@gmail.com",
      github: "https://github.com/henryhead",
      twitter: "https://x.com/jebhenryhead",
      bio: "World-renowned Cincinnati doubles expert. Made his claim to fame in 2013 with a deep run at high school state dubs. Some of the silkiest volleys you'll probably never see.",
      // skills: ["React", "TypeScript", "UI/UX", "Product Design"],
    },
    {
      name: "John Larkin",
      role: "Software Engineer",
      image: "/john.jpeg",
      linkedin: "https://www.linkedin.com/in/johnlarkin1/",
      email: "john@tennisscorigami.com",
      github: "https://github.com/johnlarkin1",
      website: "https://johnlarkin1.github.io/",
      twitter: "https://x.com/JLarks32",
      stackoverflow: "https://stackoverflow.com/users/6347839/jlarks32",
      bio: "Washed up Swarthmore tennis player. Catch him still trying to tear the cover off the ball on West Side Highway. Tennis game is focused on linearity.",
      // skills: ["Python", "Node.js", "PostgreSQL", "System Architecture"],
    },
    {
      name: "Sebastian Hoar",
      role: "Data Scientist",
      image: "/seb.jpeg",
      linkedin: "https://www.linkedin.com/in/sebastian-hoar-a71a5b112/",
      email: "hoar.sebastian@gmail.com",
      github: "https://github.com/johnlarkin1",
      bio: "Long time lover of all sports and data expert and afficionado. I'd trust his logistic regression skills over his backhand.",
      // skills: [
      //   "Machine Learning",
      //   "Statistics",
      //   "Python",
      //   "Data Visualization",
      // ],
    },
  ];

  return (
    <Section className="bg-gray-800/50">
      <SectionHeader
        title="Meet Our Team"
        subtitle="Three friends from Cincinnati united by data and tennis"
        id={id}
      />

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <TeamMemberCard {...member} />
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
