module.exports = {
  rootDir: "./",
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "html"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*.module.ts", 
    "!src/**/models/*", 
    "!src/**/dto/*", 
    "!src/database/**/*",
  ],
};
