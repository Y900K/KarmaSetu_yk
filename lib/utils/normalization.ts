/**
 * Standardizes department names across the platform to ensure 
 * consistent reporting and analytics.
 */
export function normalizeDepartment(dept: string | null | undefined): string {
  if (!dept || typeof dept !== 'string') return 'General';
  
  const trimmed = dept.trim();
  const lower = trimmed.toLowerCase();

  // Safety & EHS Consolidation
  if (
    lower === 'ehs' || 
    lower === 'safety' || 
    lower === 'hse' || 
    lower === 'safety & ehs' || 
    lower === 'safety and ehs'
  ) {
    return 'Safety & EHS';
  }

  // Chemical / Process Consolidation
  if (
    lower === 'chemical' || 
    lower === 'process' || 
    lower.includes('chemical') && lower.includes('process')
  ) {
    return 'Chemical / Process';
  }

  // Standardization for 'All Departments' (internal usage)
  if (lower === 'all departments' || lower === 'all department' || lower === 'all') {
    return 'All Departments';
  }

  // Capitalize first letter of each word for others
  return trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
