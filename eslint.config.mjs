// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Global rules and settings
  ...compat.extends(
    "next",
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ),
  {
    settings: {
      next: {
        rootDir: "src",
      },
    },
    rules: {
      "import/no-unused-modules": "off", // Turn off unused-modules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
    },
  }, // File-specific rules and ignores
  // {
  //   files: ["src/**/*.ts", "src/**/*.tsx"],
  //   ignores: [
  //     "src/app/api/**",
  //     "src/app/about/page.tsx",
  //     "src/app/layout.tsx",
  //     "src/app/page.tsx",
  //     "src/components/ui/**",
  //
  //   ],
  //   rules: {
  //     "import/no-unused-modules": "error",
  //   },
  // },
  {
    files: [
      "src/app/api/**/*.ts",
      "src/app/about/page.tsx",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/components/ui/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow `any` in API files
      "@typescript-eslint/no-unused-vars": "off", // Ignore unused
      "import/no-unused-modules": "off", // Turn off unused-modules
    },
  },
  {
    files: ["src/components/graph/force-graph-3d.tsx"], // or ["**/*.ts"] for broader scope
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
];
