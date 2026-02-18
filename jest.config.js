// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/src/__tests__/__mocks__/', '<rootDir>/src/__tests__/helpers/', '<rootDir>/e2e/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/stories/**/*',
    '!src/db/migrations/**/*',
    '!src/db/scripts/**/*',
    '!src/db/schema/**/*',
    '!src/db/index.ts',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/components/graph/**/*',
    '!src/components/landing/**/*',
    '!src/components/scorigami/**/*',
    '!src/components/sections/**/*',
    '!src/components/search/**/*',
    '!src/components/about/**/*',
    '!src/providers/**/*',
    '!src/store/**/*',
    '!src/styles/**/*',
  ],
  coverageThreshold: {
    global: { statements: 15, branches: 10, functions: 10, lines: 15 },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
}

module.exports = createJestConfig(customJestConfig)