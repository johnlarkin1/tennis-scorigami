import { motion } from "framer-motion";
import { Mail, MessageSquarePlus, Twitter, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Section } from "./section";

export const FeedbackSection: React.FC<{ id?: string }> = ({ id: _id }) => {
  const feedbackOptions = [
    {
      icon: Mail,
      title: "Email Us",
      description:
        "Questions or feedback? Drop us a line at support@tennis-scorigami.com",
      href: "mailto:support@tennis-scorigami.com",
      linkText: "Send Email",
      external: false,
    },
    {
      icon: Twitter,
      title: "Tweet at Us",
      description:
        "Follow and tweet @TennisScorigami on X for quick updates and discussions.",
      href: "https://x.com/TennisScorigami",
      linkText: "Tweet @TennisScorigami",
      external: true,
    },
    {
      icon: MessageSquarePlus,
      title: "Request Features",
      description: "Have an idea? Let us know what features you'd like to see!",
      href: "https://tennis-scorigami.canny.io/",
      linkText: "Visit Canny",
      external: true,
    },
    {
      icon: Users,
      title: "Join Our Community",
      description: "Connect with other tennis data enthusiasts on Discord.",
      href: "https://discord.gg/rhUKR2Hpj3",
      linkText: "Join Discord",
      external: true,
    },
  ];

  return (
    <Section>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-300">
            Contact us by email or tweet at us on X! We&apos;re always looking
            to improve Tennis Scorigami and your feedback helps us build a
            better experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feedbackOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="h-full p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-400/50 transition-all hover:scale-105 group flex flex-col">
                  <Icon className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-300 mb-6 flex-grow">{option.description}</p>
                  <Link
                    href={option.href}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center text-green-400 font-medium group-hover:gap-2 transition-all mt-auto"
                  >
                    {option.linkText}
                    <span className="ml-1 group-hover:ml-2 transition-all">
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};
