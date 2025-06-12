import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Section } from "./section";

export const CallToAction: React.FC<{ id?: string }> = ({ id }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!id) return;

    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-6" />
        <div className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-4xl font-bold">Ready to Explore?</h2>
          {/* {id && (
            <button
              onClick={handleCopyLink}
              className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-green-400"
              title="Copy link to this section"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Link className="w-5 h-5" />
              )}
            </button>
          )} */}
        </div>
        <p className="text-xl text-gray-300 mb-8">
          Dive into our interactive visualization and discover which tennis
          scores have never been played in professional history.
        </p>
        <motion.a
          href="/explore"
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore the Data
          <ChevronRight className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </Section>
  );
};
