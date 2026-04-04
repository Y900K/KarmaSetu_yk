'use client';

import useSWR, { SWRConfiguration } from 'swr';

/**
 * Generic JSON fetcher for SWR.
 * Throws on non-2xx responses so SWR can handle errors.
 */
async function jsonFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  const data = await res.json();
  return data as T;
}

/**
 * Reusable SWR hook for KarmaSetu API calls.
 *
 * Features:
 * - Automatic caching (no re-fetch on revisit within dedupingInterval)
 * - Automatic revalidation on window focus
 * - Retry on error (1 retry)
 * - Instant UI on revisit (stale-while-revalidate)
 *
 * Usage:
 *   const { data, error, isLoading, mutate } = useAPI<MyType>('/api/admin/users');
 */
export function useAPI<T = unknown>(
  url: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(url, jsonFetcher, {
    dedupingInterval: 10_000,       // Dedup identical requests within 10s
    revalidateOnFocus: true,        // Re-validate on window focus
    errorRetryCount: 1,             // Retry once on error
    keepPreviousData: true,         // Show stale data while revalidating
    ...options,
  });
}

/**
 * Wrapper for SWR mutate — can be used for optimistic updates.
 */
export { mutate } from 'swr';
