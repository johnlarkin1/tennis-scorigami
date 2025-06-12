import { motion } from "framer-motion";
import { Check, Link } from "lucide-react";
import React, { useState } from "react";

export const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = "", id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={`py-20 group ${className}`}
  >
    <div className="container mx-auto px-6">{children}</div>
  </motion.section>
);

export const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  id?: string;
}> = ({ title, subtitle, id }) => {
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
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h2>
        {id && (
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
        )}
      </div>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">{subtitle}</p>
    </div>
  );
};
