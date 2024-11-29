"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">🎾 Tennis Scorigami</div>
        <nav className="space-x-4">
          <Button
            variant="link"
            className="text-white hover:text-gray-300"
            asChild
          >
            <Link href="/">Home</Link>
          </Button>
          <Button
            variant="link"
            className="text-white hover:text-gray-300"
            asChild
          >
            <Link href="/about">About</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
