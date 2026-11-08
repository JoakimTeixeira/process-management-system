import { expect, test } from '@playwright/test';

import { backofficeBaseUrl } from '../playwright.config';

test('backoffice boots its anonymous login route in Chromium', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto(`${backofficeBaseUrl}/login`);

  await expect(page.getByText('Sign In', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  expect(pageErrors).toEqual([]);
});
