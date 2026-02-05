import { useState } from 'react';
import { BRAND } from '../../lib/brand';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-24 w-24',
};

export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback: Display brand name initials
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold ${sizeClasses[size]} ${className}`}
        title={BRAND.logo.alt}
      >
        ML
      </div>
    );
  }

  return (
    <img
      src={BRAND.logo.path}
      alt={BRAND.logo.alt}
      className={`object-contain ${sizeClasses[size]} ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
