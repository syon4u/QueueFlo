
// This file is used to add scripts to package.json without modifying it directly
// The scripts will be available via npm run <script-name>

export default {
  test: "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
};
