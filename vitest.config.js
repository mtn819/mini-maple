import { defineConfig } from 'vitest/config';

// jsdom is required, not just convenient: every src/*.js file's first line is
// `window.G = window.G || {}`, so `window` must exist before any source file
// can even be imported.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'src/logic/**',
        'src/systems/Leveling.js',
        'src/systems/InputController.js',
        'src/core/PixelArt.js',
        'src/core/AnimationBuilder.js',
        'src/core/Constants.js',
      ],
      thresholds: {
        lines: 98,
        statements: 98,
        functions: 100,
        branches: 95,
      },
    },
  },
});
