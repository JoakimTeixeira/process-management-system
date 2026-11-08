import { expect, test } from '@playwright/test';

import { publicBaseUrl } from '../playwright.config';

test('public portal boots its home route in Chromium', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto(publicBaseUrl);

  await expect(
    page.getByRole('heading', { level: 1, name: 'Process Management System' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore Processes' })).toHaveAttribute(
    'href',
    '/catalog/processes',
  );
  await expect(page.getByRole('link', { name: 'Find Procedures' })).toHaveAttribute(
    'href',
    '/catalog/procedures',
  );
  expect(pageErrors).toEqual([]);
});
