"use client";

import { ParticleCanvas } from "@/components/ui/particle-canvas";
import React from "react";

export const HeroSection: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <section
      className={`relative w-full h-[32vh] overflow-hidden bg-gray-900 ${className}`}
    >
      <ParticleCanvas className="absolute inset-0 w-full h-full" />
    </section>
  );
};

export default HeroSection;
