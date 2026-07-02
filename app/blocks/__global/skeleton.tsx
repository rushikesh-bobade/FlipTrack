import styles from "./skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: "default" | "circle";
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  variant = "default",
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.skeleton} ${variant === "circle" ? styles.circle : ""} ${className}`}
      style={{ width, height }}
    />
  );
}