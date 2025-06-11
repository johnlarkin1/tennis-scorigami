"use client";

import { ParticleCanvas } from "@/components/ui/particle-canvas";
import { MobileParticleCanvas } from "@/components/ui/mobile-particle-canvas";
import React from "react";
import { isMobile } from "react-device-detect";

export const HeroSection: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <section
      className={`relative w-full h-[20vh] sm:h-[32vh] overflow-hidden bg-gray-900 ${className}`}
    >
      {isMobile ? (
        <MobileParticleCanvas className="absolute inset-0 w-full h-full" />
      ) : (
        <ParticleCanvas className="absolute inset-0 w-full h-full" />
      )}
    </section>
  );
};

export default HeroSection;
