/**
 * Calculate age from a date of birth string.
 * Returns null if the date is invalid or cannot be parsed.
 */
export function calculateAge(dateOfBirth: string | undefined | null): number | null {
  if (!dateOfBirth) {
    return null;
  }

  try {
    const birthDate = new Date(dateOfBirth);
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Sanity check: age should be reasonable (0-150)
    if (age < 0 || age > 150) {
      return null;
    }

    return age;
  } catch {
    return null;
  }
}

/**
 * Format age for display. Returns empty string if age is null.
 */
export function formatAge(age: number | null): string {
  if (age === null) {
    return '';
  }
  return `(${age})`;
}
