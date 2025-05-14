"use client";

import { motion } from "framer-motion";
import { ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FloatingExploreButtonProps {
  targetId: string;
}

export const FloatingExploreButton: React.FC<FloatingExploreButtonProps> = ({
  targetId,
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-8 left-0 right-0 flex justify-center z-50"
    >
      <Link
        href="/explore"
        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
        onClick={(e) => {
          e.preventDefault();
          router.push("/explore");
        }}
      >
        <span>Explore interactively</span>
        <motion.div
          animate={{
            x: [0, 5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronsRightIcon className="w-5 h-5" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
