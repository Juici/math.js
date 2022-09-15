/**
 * @type {import("ts-jest").JestConfigWithTsJest}
 */
export default {
  testPathIgnorePatterns: ["/node_modules/", "/build/", "/dist/", "/scripts/", "/build/"],
  transform: {
    "\\.ts$": [
      "ts-jest",
      {
        // isolatedModules: true,
      },
    ],
  },
};
