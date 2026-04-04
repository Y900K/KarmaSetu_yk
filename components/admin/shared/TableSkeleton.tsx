import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

/**
 * Renders skeleton `<tr>` rows for use INSIDE an existing `<tbody>`.
 * Does NOT wrap in its own <div>/<table>/<tbody> to avoid hydration errors.
 */
export default function TableSkeleton({ rows = 5, cols = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-white/5 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-6">
              <div className="flex items-center gap-3">
                {j === 0 && <div className="h-8 w-8 rounded-full bg-white/5 shrink-0" />}
                <div className={`h-2 bg-white/5 rounded-full ${j === 0 ? 'w-24' : 'w-16'}`} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
