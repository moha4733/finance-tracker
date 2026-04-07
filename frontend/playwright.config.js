import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    headless: true
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 3001',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120000
  }
})
