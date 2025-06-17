"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Mail, MessageSquarePlus, Users } from "lucide-react";
import Link from "next/link";

export const FeedbackPopover = () => {
  const feedbackOptions = [
    {
      icon: MessageSquarePlus,
      label: "Feature Requests",
      description: "Suggest new features",
      href: "https://tennis-scorigami.canny.io/",
      external: true,
    },
    {
      icon: Users,
      label: "Join Community",
      description: "Connect on Discord",
      href: "https://discord.gg/rhUKR2Hpj3",
      external: true,
    },
    {
      icon: Mail,
      label: "Email Us",
      description: "Get in touch directly",
      href: "mailto:support@tennis-scorigami.com",
      external: false,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="font-geist-mono text-white/90 text-base sm:text-lg uppercase hover:text-green-400 px-3 sm:px-4 transition-all duration-300 hover:scale-110 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-green-400 after:transition-all after:duration-300 hover:after:w-full"
        >
          Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-gray-800/95 border-gray-700 backdrop-blur-sm">
        <div className="p-4">
          <h3 className="font-bold text-white mb-3">
            We&apos;d love to hear from you!
          </h3>
          <div className="space-y-2">
            {feedbackOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.label}
                  href={option.href}
                  target={option.external ? "_blank" : undefined}
                  rel={option.external ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                >
                  <Icon className="w-5 h-5 text-green-400 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-green-400 transition-colors">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
