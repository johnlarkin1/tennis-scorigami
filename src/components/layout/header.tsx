"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Header = () => (
  <header className="font-sans bg-gray-900 text-white shadow-md px-6 py-4">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <Link href="/" className="flex items-center space-x-1">
        <Image
          src="/favicon/favicon.svg"
          alt="Tennis Scorigami Logo"
          width={40}
          height={40}
          priority
        />
        <div className="flex flex-col items-center font-geist-mono text-xl font-bold tracking-[0.25em] leading-tight w-[14ch] text-center uppercase">
          <span>Tennis</span>
          <span>Scorigami</span>
        </div>
      </Link>
      <nav className="flex space-x-6">
        {[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ].map(({ href, label }) => (
          <Button
            key={href}
            variant="link"
            asChild
            className="font-geist-mono text-white text-lg uppercase hover:text-gray-300 "
          >
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </nav>
    </div>
  </header>
);
