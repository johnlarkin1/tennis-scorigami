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
        className="relative bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black font-black px-8 sm:px-10 py-4 sm:py-5 rounded-full shadow-[0_10px_40px_rgba(74,222,128,0.3)] flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-110 hover:shadow-[0_15px_50px_rgba(74,222,128,0.4)] text-base sm:text-lg border border-green-300/50 overflow-hidden group"
        onClick={(e) => {
          e.preventDefault();
          router.push("/explore");
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-lg sm:text-xl relative z-10">Explore interactively</span>
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
          <ChevronsRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
