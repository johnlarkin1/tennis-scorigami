"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Mail, Menu, MessageSquarePlus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/search", label: "Search" },
    { href: "/about", label: "About" },
    // TODO(@larkin): Re-add theory page once it's written by a human
  ];

  const feedbackItems = [
    {
      icon: MessageSquarePlus,
      label: "Feature Requests",
      href: "https://tennis-scorigami.canny.io/",
      external: true,
    },
    {
      icon: Users,
      label: "Join Discord",
      href: "https://discord.gg/rhUKR2Hpj3",
      external: true,
    },
    {
      icon: Mail,
      label: "Email Us",
      href: "mailto:support@tennis-scorigami.com",
      external: false,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden text-white hover:text-green-400"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[280px] bg-gray-900 border-gray-700 text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-white font-geist-mono text-xl">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col space-y-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-white/90 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all font-geist-mono uppercase"
            >
              {label}
            </Link>
          ))}

          <div className="border-t border-gray-700 my-4" />

          <h3 className="px-4 py-2 text-sm font-bold text-gray-400 uppercase">
            Get in Touch
          </h3>

          {feedbackItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-green-400 hover:bg-gray-800/50 rounded-lg transition-all"
              >
                <Icon className="w-5 h-5 text-green-400" />
                <span className="font-geist-mono">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
