import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "./section";
import { TeamMemberCard, TeamMember } from "./team-member-card";

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
      bio: "Passionate about creating intuitive user experiences and turning complex data into beautiful visualizations.",
      skills: ["React", "TypeScript", "UI/UX", "Product Design"],
    },
    {
      name: "John Larkin",
      role: "Software Engineer",
      image: "/john.jpeg",
      linkedin: "https://www.linkedin.com/in/johnlarkin/",
      email: "john@tennisscorigami.com",
      github: "https://github.com/johnlarkin1",
      website: "https://johnlarkin1.github.io/",
      twitter: "https://x.com/JLarks32",
      stackoverflow: "https://stackoverflow.com/users/6347839/jlarks32",
      bio: "Full-stack developer with a love for data engineering and building scalable systems.",
      skills: ["Python", "Node.js", "PostgreSQL", "System Architecture"],
    },
    {
      name: "Sebastian Hoar",
      role: "Data Scientist",
      image: "/seb.jpeg",
      linkedin: "https://www.linkedin.com/in/sebastian-hoar-a71a5b112/",
      email: "hoar.sebastian@gmail.com",
      github: "https://github.com/johnlarkin1",
      bio: "Data enthusiast specializing in statistical analysis and machine learning applications in sports analytics.",
      skills: [
        "Machine Learning",
        "Statistics",
        "Python",
        "Data Visualization",
      ],
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