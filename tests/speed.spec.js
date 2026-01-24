import { test, expect } from '@playwright/test';

test('$1 → $1B in under 60 seconds', async ({ page }) => {
  // Go to production URL
  await page.goto('https://bread-ebfan4v9b-nulljosh-9577s-projects.vercel.app');

  // Wait for app to load
  await page.waitForSelector('button:has-text("Start")');

  // Start timer
  const startTime = Date.now();

  // Click start button
  await page.click('button:has-text("Start")');

  // Wait for win condition (max 2 minutes timeout)
  await page.waitForSelector('text=$1B REACHED!', { timeout: 120000 });

  // Calculate elapsed time
  const elapsedTime = Date.now() - startTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);

  console.log(`🎯 Time to $1B: ${elapsedSeconds}s`);

  // Assert under 60 seconds
  expect(elapsedSeconds).toBeLessThan(60);
});
