import { AlertTriangle } from 'lucide-react';
import { DISCLAIMER_TEXT } from '@/lib/utils/constants';

export function Disclaimer() {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
        <p className="text-sm text-yellow-800">{DISCLAIMER_TEXT}</p>
      </div>
    </div>
  );
}
