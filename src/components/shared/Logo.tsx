import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Logo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const iconSize = size === 'large' ? 32 : 22;
  const textClass = size === 'large' ? 'text-xl' : 'text-base';

  return (
    <Link href="/" className="flex items-center gap-2">
      <Shield className="text-deep-blue" size={iconSize} />
      <span className={`${textClass} font-serif font-normal text-deep-blue`}>
        Retsklar
      </span>
      <span className={`${size === 'large' ? 'text-lg' : 'text-sm'} font-sans font-normal text-text-secondary`}>
        .dk
      </span>
    </Link>
  );
}
