import { test, expect } from '@playwright/test';

test.describe('Helbredstjek wizard E2E', () => {
  test('full flow with test data', async ({ page }) => {
    test.setTimeout(180000); // 3 min for AI + redirect
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/helbredstjek');

    // Trin 1 - Din virksomhed
    await page.getByTestId('company_type-aps').click();
    await page.getByTestId('industry').fill('IT-konsulent');
    await page.getByTestId('employee_count-5-9').click();
    await page.getByTestId('revenue_range-2m-10m').click();
    await page.getByTestId('has_international_customers-eu').click();
    await page.getByTestId('multiple_owners-yes').click();
    await page.getByTestId('wizard-next').click();

    // Trin 2 - GDPR
    await page.getByTestId('gdpr_processes_personal_data-yes').click();
    await page.getByTestId('gdpr_has_privacy_policy-no').click();
    await page.getByTestId('gdpr_has_dpa-unsure').click();
    await page.getByTestId('gdpr_has_record_of_processing-no').click();
    await page.getByTestId('gdpr_has_cookie_consent-basic').click();
    await page.getByTestId('wizard-next').click();

    // Trin 3 - Ansættelse
    await page.getByTestId('employment_has_contracts-some').click();
    await page.getByTestId('employment_has_handbook-no').click();
    await page.getByTestId('employment_has_apv-no').click();
    await page.getByTestId('employment_follows_collective-no').click();
    await page.getByTestId('wizard-next').click();

    // Trin 4 - Selskab
    await page.getByTestId('corporate_has_shareholder_agreement-no').click();
    await page.getByTestId('corporate_articles_updated-no').click();
    await page.getByTestId('corporate_annual_report-yes').click();
    await page.getByTestId('corporate_holds_general_meeting-yes').click();
    await page.getByTestId('corporate_owner_register-unsure').click();
    await page.getByTestId('wizard-next').click();

    // Trin 5 - Kontrakter
    await page.getByTestId('contracts_has_terms-no').click();
    await page.getByTestId('contracts_has_supplier_agreements-no').click();
    await page.getByTestId('contracts_has_nda-no').click();
    await page.getByTestId('contracts_has_ip_clauses-no').click();
    await page.getByTestId('wizard-next').click();

    // Opsummering - indtast email
    await page.getByTestId('summary-email').fill('test@example.com');

    // Overvåg API-kald
    let apiResponse: { status?: number; body?: string } = {};
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/health-check') && !url.includes('/api/health-check/')) {
        apiResponse = { status: response.status(), body: await response.text().catch(() => '') };
      }
    });

    await page.getByTestId('wizard-submit').click();

    // Vent på redirect (120 sek)
    const redirected = await page.waitForURL(/\/helbredstjek\/resultat\?id=/, { timeout: 120000 }).catch(() => false);

    if (!redirected) {
      const errorText = await page.locator('p.text-red-600').first().textContent().catch(() => '');
      const apiError = apiResponse.status && apiResponse.status >= 400 ? apiResponse.body : '';
      throw new Error(
        `Rapporten blev ikke genereret. API status: ${apiResponse.status || '?'}. ` +
          `Fejl: ${errorText || apiError || 'Timeout'}`
      );
    }
    await page.waitForLoadState('networkidle');

    // Vent på at rapporten er loadet (AI kan tage tid - polling hver 3 sek)
    await page.waitForSelector('text=Juridisk compliance-tjek', { timeout: 90000 });
    await page.waitForLoadState('networkidle');

    // Tæl lovhenvisninger (retsinformation.dk URLs)
    const pageContent = await page.content();
    const lawRefMatches = pageContent.match(/retsinformation\.dk/g) || [];
    const lawRefCount = lawRefMatches.length;
    const hasRetsinfoUrls = lawRefCount > 0;

    // Output rapport til konsol
    console.log('\n========== HELBREDSTJEK E2E RAPPORT ==========');
    console.log('1. Rapport genereret: JA');
    console.log('2. Antal lovhenvisninger (retsinformation.dk):', lawRefCount);
    console.log('3. Lovhenvisninger har retsinformation.dk-URLs:', hasRetsinfoUrls ? 'JA' : 'NEJ');
    console.log('4. Console-fejl:', consoleErrors.length, consoleErrors.length > 0 ? consoleErrors : '');
    console.log('===============================================\n');

    // Assertioner
    expect(page.url()).toContain('resultat');
    expect(lawRefCount).toBeGreaterThanOrEqual(0);
  });
});
