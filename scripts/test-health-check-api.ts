/**
 * Runs 3 health-check API calls to verify JSON extraction.
 * Requires dev server on localhost:3000 and ANTHROPIC_API_KEY.
 * Run: npx tsx scripts/test-health-check-api.ts
 */
const TEST_ANSWERS = {
  company_type: 'aps',
  industry: 'IT-konsulent',
  employee_count: '5-9',
  revenue_range: '2m-10m',
  has_international_customers: 'eu',
  multiple_owners: 'yes',
  gdpr_processes_personal_data: 'yes',
  gdpr_has_privacy_policy: 'no',
  gdpr_has_dpa: 'unsure',
  gdpr_has_record_of_processing: 'no',
  gdpr_has_cookie_consent: 'basic',
  employment_has_contracts: 'some',
  employment_has_handbook: 'no',
  employment_has_apv: 'no',
  employment_follows_collective: 'no',
  corporate_has_shareholder_agreement: 'no',
  corporate_articles_updated: 'no',
  corporate_annual_report: 'yes',
  corporate_holds_general_meeting: 'yes',
  corporate_owner_register: 'unsure',
  contracts_has_terms: 'no',
  contracts_has_supplier_agreements: 'no',
  contracts_has_nda: 'no',
  contracts_has_ip_clauses: 'no',
};

async function runOne(index: number): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch('http://localhost:3000/api/health-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: TEST_ANSWERS,
      email: `test-${index}-${Date.now()}@example.com`,
      tier: 'free',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || res.statusText };
  }
  return { ok: true, id: data.healthCheckId };
}

async function main() {
  console.log('Running 3 health-check API calls...\n');
  const results: { ok: boolean; id?: string; error?: string }[] = [];

  for (let i = 1; i <= 3; i++) {
    process.stdout.write(`Run ${i}/3... `);
    const r = await runOne(i);
    results.push(r);
    if (r.ok) {
      console.log(`OK (id: ${r.id?.slice(0, 8)}...)`);
    } else {
      console.log(`FAILED: ${r.error}`);
    }
  }

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n${passed}/3 returned valid JSON.`);
  process.exit(passed < 3 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
