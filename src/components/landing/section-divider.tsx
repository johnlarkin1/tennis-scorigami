"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type SectionDividerProps = {
  id: string;
  title: string;
  fullWidth?: boolean;
};

export const SectionDivider: React.FC<SectionDividerProps> = ({
  id,
  title,
  fullWidth = false,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id={id} className="py-10 bg-gray-900" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center"
        >
          <div
            className={`h-px bg-gray-700 flex-grow ${fullWidth ? "" : "max-w-md md:max-w-xl lg:max-w-2xl"}`}
          ></div>
          <h2 className="text-3xl md:text-4xl font-bold mx-6 text-center">
            {title}
          </h2>
          <div
            className={`h-px bg-gray-700 flex-grow ${fullWidth ? "" : "max-w-md md:max-w-xl lg:max-w-2xl"}`}
          ></div>
        </motion.div>
      </div>
    </section>
  );
};
