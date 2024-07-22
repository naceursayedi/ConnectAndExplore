/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  reporters: ["default", "jest-junit"],
  testMatch: ["**/*.test.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  detectOpenHandles: true,
  setupFilesAfterEnv: ["./tests/jest.setup.ts"],
  verbose: true,
  cacheDirectory: ".jest-cache",
  collectCoverage: false,
};
