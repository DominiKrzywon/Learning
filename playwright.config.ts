import { BASE_URL } from '@_config/env.config';
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

export const STORAGE_STAGE = path.join(process.cwd(), 'tmp/session.json');
export const RESPONSE_TIMEOUT = 10_000;

export default defineConfig({
  testDir: './tests',
  globalSetup: 'config/global.setup.ts',
  timeout: 15_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: 0,
  workers: undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    actionTimeout: 0,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'chromium-non-logged',
      grepInvert: /@logged/,
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup',
      testMatch: '*.setup.ts',
    },
    {
      name: 'chromium-logged',
      testDir: './tests/ui',
      dependencies: ['setup'],
      grep: /@logged/,
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STAGE },
    },
  ],
});
