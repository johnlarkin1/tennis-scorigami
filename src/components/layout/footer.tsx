"use client";

import Link from "next/link";
import { SocialIcon } from "react-social-icons";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white border-t border-gray-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          <div className="sm:col-span-2 md:col-span-2">
            <div className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl animate-bounce">
                🎾
              </span>
              <span
                className="
                relative inline-block bg-gradient-to-r from-green-400 via-white to-green-300
                bg-clip-text text-transparent bg-[length:200%_100%]
                animate-shine"
              >
                Tennis Scorigami
              </span>
            </div>
            <p className="text-gray-300 mb-3 sm:mb-4 max-w-md text-sm sm:text-base">
              As if tennis wasn&apos;t already exciting enough! Maybe the match
              you&apos;re about to watch will be a tennis scorigami.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <SocialIcon
                url="https://x.com/TennisScorigami"
                bgColor="#000000"
                style={{ height: 32, width: 32 }}
                target="_blank"
                className="hover:scale-110 transition-transform sm:!h-9 sm:!w-9"
              />
              <SocialIcon
                url="https://www.linkedin.com/company/tennis-scorigami/about"
                bgColor="#0077B5" // LinkedIn blue
                style={{ height: 32, width: 32 }}
                target="_blank"
                className="hover:scale-110 transition-transform sm:!h-9 sm:!w-9"
              />
              <SocialIcon
                url="https://discord.gg/rhUKR2Hpj3"
                bgColor="#5865F2" // Discord “blurple”
                style={{ height: 32, width: 32 }}
                target="_blank"
                className="hover:scale-110 transition-transform sm:!h-9 sm:!w-9"
              />
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 border-b border-gray-700/30 pb-2">
              Navigation
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Search
                </Link>
              </li>
              {/* TODO(@larkin): Re-add theory page once it's written by a human */}
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 border-b border-gray-700/30 pb-2">
              Team
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Henry Head
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  John Larkin
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Sebastian Hoar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 border-b border-gray-700/30 pb-2">
              Get in Touch
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a
                  href="mailto:support@tennis-scorigami.com"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Email Us
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/TennisScorigami"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Tweet @TennisScorigami
                </a>
              </li>
              <li>
                <a
                  href="https://tennis-scorigami.canny.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Request a Feature
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/rhUKR2Hpj3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition flex items-center group text-sm sm:text-base"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-2 group-hover:bg-green-400 transition-colors"></span>
                  Join Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-gray-400">
          <p className="text-sm sm:text-base">
            © {currentYear} Tennis Scorigami. All rights reserved.
          </p>
          <p className="mt-2 text-xs sm:text-sm">
            Tennis Scorigami is not affiliated with ATP, WTA, or ITF.
          </p>
        </div>
      </div>
    </footer>
  );
};
