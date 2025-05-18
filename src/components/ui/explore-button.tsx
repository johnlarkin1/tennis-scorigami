"use client";

import { motion } from "framer-motion";
import { ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ExploreButtonProps {
  className?: string;
}

export const ExploreButton: React.FC<ExploreButtonProps> = ({
  className = "",
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className={`flex justify-center ${className}`}
    >
      <Link
        href="/explore"
        className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-full shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-lg border-2 border-green-400"
        onClick={(e) => {
          e.preventDefault();
          router.push("/explore");
        }}
      >
        <span className="text-xl">Explore interactively</span>
        <motion.div
          animate={{
            x: [0, 8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronsRightIcon className="w-6 h-6" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
