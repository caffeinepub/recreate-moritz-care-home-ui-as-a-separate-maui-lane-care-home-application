import { useState, useEffect, useRef } from 'react';
import { BRAND } from '@/lib/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const hasLoggedErrorRef = useRef(false);

  // Resolve logo path against base URL for IC deployment compatibility
  const resolvedLogoSrc = (() => {
    const base = import.meta.env.BASE_URL || '/';
    const logoPath = BRAND.logoPath;
    
    // If logoPath is already absolute (http/https), use as-is
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    // For relative paths, resolve against BASE_URL
    // Remove leading slash from logoPath if present
    const cleanPath = logoPath.startsWith('/') ? logoPath.slice(1) : logoPath;
    
    // Ensure base ends with / and append clean path
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}${cleanPath}`;
  })();

  // Reset error state when logo source changes
  useEffect(() => {
    setImageError(false);
    hasLoggedErrorRef.current = false;
  }, [resolvedLogoSrc]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const handleImageError = () => {
    setImageError(true);
    
    // Development-only, log-once error message
    if (import.meta.env.DEV && !hasLoggedErrorRef.current) {
      hasLoggedErrorRef.current = true;
      console.error(
        `[BrandLogo] Failed to load logo image.\n` +
        `  Attempted src: ${resolvedLogoSrc}\n` +
        `  Original path: ${BRAND.logoPath}\n` +
        `  BASE_URL: ${import.meta.env.BASE_URL || '/'}\n` +
        `  Falling back to initials (ML).`
      );
    }
  };

  // Fallback to initials if image fails to load
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold ${className}`}
      >
        <span className={size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}>
          ML
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedLogoSrc}
      alt="Maui Lane Care Home logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={handleImageError}
      loading="eager"
    />
  );
}
