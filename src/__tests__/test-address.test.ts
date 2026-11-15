import { describe, it, expect } from 'vitest';
import { isReservedTestEmail } from '@/lib/utils/helpers';

describe('isReservedTestEmail', () => {
  it('genkender reserverede testadresser', () => {
    for (const e of ['hq-test+1@example.com', 'a@example.org', 'x@foo.test', 'y@shop.example', 'z@nope.invalid', 'w@localhost', 'V@EXAMPLE.NET']) expect(isReservedTestEmail(e)).toBe(true);
  });
  it('lader rigtige adresser være', () => {
    for (const e of ['kunde@gmail.com', 'info@retsklar.dk', 'a@example.dk', 'b@testfirma.dk', 'c@mytest.com']) expect(isReservedTestEmail(e)).toBe(false);
  });
});
