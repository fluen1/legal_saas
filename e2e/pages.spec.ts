import { test, expect } from '@playwright/test';

test.describe('Static pages', () => {
  test('homepage loads with key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Retsklar')).toBeVisible();
  });

  test('404 page shows branded message', async ({ page }) => {
    const response = await page.goto('/denne-side-findes-ikke-abc123');
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Siden blev ikke fundet')).toBeVisible();
    await expect(page.locator('text=Gå til forsiden')).toBeVisible();
    await expect(page.locator('text=Start juridisk tjek')).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privatlivspolitik');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/handelsbetingelser');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('cookie policy page loads', async ({ page }) => {
    await page.goto('/cookiepolitik');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('resources page loads', async ({ page }) => {
    await page.goto('/ressourcer');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Lead magnet pages', () => {
  test('GDPR tjekliste page loads with form', async ({ page }) => {
    await page.goto('/ressourcer/gdpr-tjekliste');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('ejeraftale page loads with form', async ({ page }) => {
    await page.goto('/ressourcer/ejeraftale-skabelon');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('fraflytningsguide page loads with form', async ({ page }) => {
    await page.goto('/ressourcer/fraflytningsguide');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('lead magnet form validates email', async ({ page }) => {
    await page.goto('/ressourcer/gdpr-tjekliste');
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('not-an-email');

    // Find and click the submit/download button
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show validation error or not submit
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/ressourcer/gdpr-tjekliste');
    }
  });
});

test.describe('Wizard start', () => {
  test('wizard page loads with first step', async ({ page }) => {
    await page.goto('/helbredstjek');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('wizard step navigation works', async ({ page }) => {
    await page.goto('/helbredstjek');

    // Answer first step questions
    await page.getByTestId('company_type-aps').click();
    await page.getByTestId('industry').fill('Test');
    await page.getByTestId('employee_count-1-4').click();
    await page.getByTestId('revenue_range-0-500k').click();
    await page.getByTestId('has_international_customers-no').click();
    await page.getByTestId('multiple_owners-no').click();

    // Click next
    await page.getByTestId('wizard-next').click();

    // Should be on step 2
    await expect(page.url()).toContain('/helbredstjek/');
  });
});
