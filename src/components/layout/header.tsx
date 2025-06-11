"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Header = () => (
  <header className="font-sans bg-gray-900 text-white shadow-md px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
      <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
        <Image
          src="/favicon/favicon.svg"
          alt="Tennis Scorigami Logo"
          width={32}
          height={32}
          className="sm:w-10 sm:h-10"
          priority
        />
        <div className="flex flex-col items-center font-geist-mono text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.25em] leading-tight text-center uppercase">
          <span>Tennis</span>
          <span>Scorigami</span>
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
            className="font-geist-mono text-white text-base sm:text-lg uppercase hover:text-gray-300 px-2 sm:px-3"
          >
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </nav>
    </div>
  </header>
);
