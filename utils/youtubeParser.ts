import { getEmbeddableURL } from '@/lib/utils/mediaParser';

/**
 * Parses YouTube or Google Drive URLs into their corresponding embed formats.
 * Maintained as a wrapper for backward compatibility with components using parseMediaURL.
 */
export function parseMediaURL(url: string | null | undefined): string | null {
  const result = getEmbeddableURL(url);
  return result === '' ? null : result;
}

