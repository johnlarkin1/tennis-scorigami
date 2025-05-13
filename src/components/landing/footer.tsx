"use client";

import Link from "next/link";
import { SocialIcon } from "react-social-icons";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4">🎾 Tennis Scorigami</div>
            <p className="text-gray-300 mb-4 max-w-md">
              Exploring the uncharted territory of tennis scores. A data
              visualization project tracking unique score combinations in
              professional tennis.
            </p>
            <div className="flex space-x-4">
              <SocialIcon
                url="https://twitter.com/JLarks32"
                bgColor="#1DA1F2"
                style={{ height: 36, width: 36 }}
                target="_blank"
              />
              <SocialIcon
                url="https://github.com/johnlarkin1"
                bgColor="#6e5494"
                style={{ height: 36, width: 36 }}
                target="_blank"
              />
              <SocialIcon
                url="https://linkedin.com/in/johnlarkin"
                bgColor="#0077B5"
                style={{ height: 36, width: 36 }}
                target="_blank"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#concept"
                  className="text-gray-300 hover:text-white transition"
                >
                  The Concept
                </Link>
              </li>
              <li>
                <Link
                  href="/#explore"
                  className="text-gray-300 hover:text-white transition"
                >
                  Explore
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Team</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition"
                >
                  Henry Head
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition"
                >
                  John Larkin
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition"
                >
                  Sebastian Hoar
                </Link>
              </li>
              <li>
                <a
                  href="mailto:john@tennisscorigami.com"
                  className="text-gray-300 hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} Tennis Scorigami. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Tennis Scorigami is not affiliated with ATP, WTA, or ITF.
          </p>
        </div>
      </div>
    </footer>
  );
};
