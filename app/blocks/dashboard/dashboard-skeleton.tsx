import { Skeleton } from "~/blocks/__global/skeleton";

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* Stats cards row — 4 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--space-6)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Skeleton width="100%" height="100px" />
          </div>
        ))}
      </div>

      {/* Cash flow chart */}
      <Skeleton width="100%" height="280px" />

      {/* 3 charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)" }}>
        <Skeleton width="100%" height="220px" />
        <Skeleton width="100%" height="220px" />
        <Skeleton width="100%" height="220px" />
      </div>

      {/* Top selling items table */}
      <Skeleton width="100%" height="200px" />

      {/* Recent sales */}
      <Skeleton width="100%" height="200px" />

    </div>
  );
}