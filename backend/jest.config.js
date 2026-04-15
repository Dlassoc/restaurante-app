/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "routes/**/*.ts", "!src/server.ts"],
  coverageDirectory: "coverage",
};