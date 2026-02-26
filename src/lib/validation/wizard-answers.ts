import { z } from 'zod';

/**
 * Server-side Zod schema for validating wizard answers.
 * Ensures all required fields are present with valid values,
 * text fields have max lengths, and HTML is stripped.
 */

// Strip HTML tags from string
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

const safeText = (maxLength: number) =>
  z.string().max(maxLength).transform(stripHtml);

export const WizardAnswersSchema = z.object({
  // ─── Company basics (always required) ───
  company_type: z.enum([
    'sole_proprietorship', 'aps', 'as', 'ivs', 'is', 'holding', 'other',
  ]),
  industry: safeText(200),
  employee_count: z.enum(['0', '1-4', '5-9', '10-24', '25-49', '50+']),
  revenue_range: z.enum(['under_500k', '500k-2m', '2m-10m', '10m-50m', '50m+']),
  has_international_customers: z.enum(['no', 'eu', 'global']),
  multiple_owners: z.enum(['yes', 'no']),

  // ─── GDPR (always required) ───
  gdpr_processes_personal_data: z.enum(['yes', 'no', 'unsure']),
  gdpr_has_privacy_policy: z.enum(['yes', 'outdated', 'no', 'unsure']),
  gdpr_has_dpa: z.enum(['yes_all', 'yes_some', 'no', 'unsure']),
  gdpr_has_record_of_processing: z.enum(['yes', 'no', 'unsure']),
  gdpr_has_cookie_consent: z.enum(['yes', 'basic', 'no', 'no_website']),

  // ─── Employment (conditional — optional at schema level) ───
  employment_has_contracts: z.enum(['yes', 'some', 'no']).optional(),
  employment_has_handbook: z.enum(['yes', 'outdated', 'no']).optional(),
  employment_has_apv: z.enum(['yes_recent', 'yes_old', 'no', 'unsure']).optional(),
  employment_has_whistleblower: z.enum(['yes', 'no']).optional(),
  employment_follows_collective: z.enum(['yes', 'no', 'unsure']).optional(),

  // ─── Corporate (conditional — optional at schema level) ───
  corporate_has_shareholder_agreement: z.enum(['yes', 'no', 'unsure']).optional(),
  corporate_articles_updated: z.enum(['yes', 'no']).optional(),
  corporate_annual_report: z.enum(['yes', 'sometimes_late', 'no']).optional(),
  corporate_holds_general_meeting: z.enum(['yes', 'no', 'unsure']).optional(),
  corporate_owner_register: z.enum(['yes', 'no', 'unsure']).optional(),

  // ─── Contracts (always required) ───
  contracts_has_terms: z.enum(['yes', 'no']),
  contracts_has_supplier_agreements: z.enum(['yes_all', 'yes_some', 'no']),
  contracts_has_nda: z.enum(['yes', 'no']),
  contracts_has_ip_clauses: z.enum(['yes', 'no', 'unsure', 'not_relevant']),
}).passthrough(); // Allow extra fields from future wizard versions

export type ValidatedWizardAnswers = z.infer<typeof WizardAnswersSchema>;