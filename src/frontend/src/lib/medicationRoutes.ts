import type { MedicationRoute } from '@/backend';

/**
 * Predefined medication administration routes
 */
export const MEDICATION_ROUTES = [
  { value: 'oral', label: 'Oral' },
  { value: 'intravenous_IV', label: 'Intravenous (IV)' },
  { value: 'intramuscular_IM', label: 'Intramuscular (IM)' },
  { value: 'subcutaneous_SubQ', label: 'Subcutaneous (SubQ)' },
  { value: 'sublingual_SL', label: 'Sublingual (SL)' },
  { value: 'topical', label: 'Topical' },
  { value: 'transdermal', label: 'Transdermal' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'inhalation', label: 'Inhalation' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'ophthalmic', label: 'Ophthalmic (Eye)' },
  { value: 'otic', label: 'Otic (Ear)' },
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'injection', label: 'Injection' },
] as const;

// Sentinel value for unset/blank route
export const ROUTE_UNSET = '__UNSET__';

/**
 * Convert backend MedicationRoute to UI select value
 */
export function routeToSelectValue(route: MedicationRoute | null | undefined): string {
  if (!route) return ROUTE_UNSET;
  
  if ('__kind__' in route) {
    if (route.__kind__ === 'other') {
      return `other:${route.other}`;
    }
    return route.__kind__;
  }
  
  return ROUTE_UNSET;
}

/**
 * Convert UI select value to backend MedicationRoute (returns undefined for unset)
 */
export function selectValueToRoute(value: string): MedicationRoute | undefined {
  if (value === ROUTE_UNSET || !value) return undefined;
  
  if (value.startsWith('other:')) {
    const otherText = value.substring(6);
    return { __kind__: 'other', other: otherText };
  }
  
  // Map string values to backend union types
  const routeMap: Record<string, MedicationRoute> = {
    oral: { __kind__: 'oral', oral: null },
    intravenous_IV: { __kind__: 'intravenous_IV', intravenous_IV: null },
    intramuscular_IM: { __kind__: 'intramuscular_IM', intramuscular_IM: null },
    subcutaneous_SubQ: { __kind__: 'subcutaneous_SubQ', subcutaneous_SubQ: null },
    sublingual_SL: { __kind__: 'sublingual_SL', sublingual_SL: null },
    topical: { __kind__: 'topical', topical: null },
    transdermal: { __kind__: 'transdermal', transdermal: null },
    rectal: { __kind__: 'rectal', rectal: null },
    inhalation: { __kind__: 'inhalation', inhalation: null },
    nasal: { __kind__: 'nasal', nasal: null },
    ophthalmic: { __kind__: 'ophthalmic', ophthalmic: null },
    otic: { __kind__: 'otic', otic: null },
    vaginal: { __kind__: 'vaginal', vaginal: null },
    injection: { __kind__: 'injection', injection: null },
  };
  
  return routeMap[value] || undefined;
}

/**
 * Format route for display
 */
export function formatRouteForDisplay(route: MedicationRoute | null | undefined): string {
  if (!route) return '';
  
  if ('__kind__' in route) {
    if (route.__kind__ === 'other') {
      return route.other;
    }
    
    const routeLabel = MEDICATION_ROUTES.find(r => r.value === route.__kind__);
    return routeLabel?.label || route.__kind__;
  }
  
  return '';
}
