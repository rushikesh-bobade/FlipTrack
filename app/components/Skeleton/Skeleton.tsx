import styles from "./Skeleton.module.css";

type SkeletonVariant = "text" | "rect" | "circle";

type SkeletonProps = {
  /** Width as a CSS value. Numbers are treated as px. Defaults to 100%. */
  width?: string | number;
  /** Height as a CSS value. Numbers are treated as px. Defaults to 1rem. */
  height?: string | number;
  /** Visual shape of the placeholder. */
  variant?: SkeletonVariant;
  /** Optional border-radius override (CSS value / px number). */
  radius?: string | number;
  /** Extra class names to merge with the component styles. */
  className?: string;
};

const toCssSize = (value?: string | number) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * Skeleton — a lightweight, theme-aware loading placeholder.
 *
 * Use it while data is loading to reduce layout shift and improve the
 * perceived performance of data-heavy views (tables, cards, charts).
 *
 * @example
 * <Skeleton width={180} height={20} />
 * <Skeleton variant="circle" width={40} />
 * <Skeleton variant="rect" height={120} radius={12} />
 */
export function Skeleton({
  width = "100%",
  height = "1rem",
  variant = "text",
  radius,
  className,
}: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: toCssSize(width),
        // A circle should be a perfect round, so height tracks width.
        height: variant === "circle" ? toCssSize(width) : toCssSize(height),
        ...(radius != null ? { borderRadius: toCssSize(radius) } : {}),
      }}
      // Purely decorative: keep it out of the accessibility tree.
      aria-hidden="true"
    />
  );
}

export default Skeleton;
