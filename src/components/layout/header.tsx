"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Header = () => (
  <header className="font-sans bg-gradient-to-b from-gray-900/95 to-gray-900 text-white shadow-lg px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
      <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group transition-all duration-300 hover:scale-105">
        <Image
          src="/favicon/favicon.svg"
          alt="Tennis Scorigami Logo"
          width={32}
          height={32}
          className="sm:w-10 sm:h-10 transition-transform duration-300 group-hover:rotate-12"
          priority
        />
        <div className="flex flex-col items-center font-geist-mono text-lg sm:text-xl font-black tracking-[0.2em] sm:tracking-[0.25em] leading-tight text-center uppercase">
          <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Tennis</span>
          <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">Scorigami</span>
        </div>
      </Link>
      <nav className="flex space-x-4 sm:space-x-6">
        {[
          { href: "/", label: "Home" },
          { href: "/explore", label: "Explore" },
          { href: "/about", label: "About" },
        ].map(({ href, label }) => (
          <Button
            key={href}
            variant="link"
            asChild
            className="font-geist-mono text-white/90 text-base sm:text-lg uppercase hover:text-green-400 px-3 sm:px-4 transition-all duration-300 hover:scale-110 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </nav>
    </div>
  </header>
);
