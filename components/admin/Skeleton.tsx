'use client';

// Deterministic width sets per row/col so there's no SSR mismatch
const W = [
  ['55%','72%','38%','60%','44%','50%','65%','45%'],
  ['70%','48%','62%','35%','55%','68%','40%','58%'],
  ['42%','80%','55%','70%','38%','52%','75%','47%'],
  ['62%','45%','75%','50%','65%','35%','58%','70%'],
  ['50%','65%','42%','78%','52%','68%','44%','60%'],
  ['78%','40%','60%','45%','70%','48%','55%','38%'],
  ['35%','68%','52%','65%','42%','58%','72%','48%'],
  ['65%','55%','70%','38%','60%','72%','48%','62%'],
];

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 8, cols = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-50 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="h-3.5 bg-gray-100 rounded-md animate-pulse"
                style={{ width: W[r % W.length][c % 8] }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 bg-gray-100 rounded-md w-28" />
        <div className="w-8 h-8 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-8 bg-gray-100 rounded-md w-20 mb-2" />
      <div className="h-3 bg-gray-100 rounded-md w-36" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-36 bg-gray-100 rounded-xl" />
        <div className="h-4 w-28 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-10 w-32 bg-gray-100 rounded-xl" />
    </div>
  );
}

export function FilterBarSkeleton({ tabs = 4 }: { tabs?: number }) {
  const tabWidths = [76, 110, 88, 120, 96];
  return (
    <div className="flex gap-1.5 animate-pulse">
      {Array.from({ length: tabs }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-100 rounded-full" style={{ width: `${tabWidths[i % tabWidths.length]}px` }} />
      ))}
    </div>
  );
}
