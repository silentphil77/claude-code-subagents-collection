import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
    // Run tests sequentially to avoid state pollution with singleton ConfigManager
    pool: 'forks',
    poolOptions: {
      threads: {
        singleThread: true
      },
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'tests/**',
        'dist/**',
        '*.config.ts',
        '**/*.d.ts',
        '**/index.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    testTimeout: 10000,
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
})