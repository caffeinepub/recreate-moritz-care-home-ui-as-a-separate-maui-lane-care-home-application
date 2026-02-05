import { useState, useEffect, useRef } from 'react';
import { BRAND } from '@/lib/brand';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const hasLoggedErrorRef = useRef(false);
  const attemptedUrlsRef = useRef<string[]>([]);

  // Generate multiple URL variants to try
  const logoSrcVariants = (() => {
    const base = import.meta.env.BASE_URL || '/';
    const logoPath = BRAND.logoPath;
    
    // If logoPath is already absolute (http/https), use as-is
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return [logoPath];
    }
    
    const variants: string[] = [];
    
    // Variant 1: Root-relative path (works in both dev and IC deployment)
    // This is the primary variant that should work
    if (logoPath.startsWith('/')) {
      // For IC deployments with base path, prepend BASE_URL
      if (base !== '/') {
        const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
        variants.push(`${normalizedBase}${logoPath}`);
      }
      // Always try the root-relative path as-is
      variants.push(logoPath);
    } else {
      // If path doesn't start with /, treat it as relative
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      variants.push(`${normalizedBase}${logoPath}`);
      variants.push(`/${logoPath}`);
    }
    
    // Remove duplicates while preserving order
    return [...new Set(variants)];
  })();

  const currentSrc = logoSrcVariants[currentSrcIndex];

  // Reset error state and attempt index when logo path changes
  useEffect(() => {
    setImageError(false);
    setCurrentSrcIndex(0);
    hasLoggedErrorRef.current = false;
    attemptedUrlsRef.current = [];
  }, [BRAND.logoPath]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const handleImageError = () => {
    // Track this attempt
    attemptedUrlsRef.current.push(currentSrc);
    
    // Try next variant if available
    if (currentSrcIndex < logoSrcVariants.length - 1) {
      setCurrentSrcIndex(currentSrcIndex + 1);
    } else {
      // All variants failed, show fallback
      setImageError(true);
      
      // Development-only, log-once error message with all attempted URLs
      if (import.meta.env.DEV && !hasLoggedErrorRef.current) {
        hasLoggedErrorRef.current = true;
        console.error(
          `[BrandLogo] Failed to load logo image after trying all variants.\n` +
          `  Original path: ${BRAND.logoPath}\n` +
          `  BASE_URL: ${import.meta.env.BASE_URL || '/'}\n` +
          `  Attempted URLs:\n${attemptedUrlsRef.current.map((url, i) => `    ${i + 1}. ${url}`).join('\n')}\n` +
          `  Falling back to initials (ML).`
        );
      }
    }
  };

  // Fallback to initials if all image variants fail to load
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
      key={currentSrc}
      src={currentSrc}
      alt="Maui Lane Care Home logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={handleImageError}
      loading="eager"
    />
  );
}
