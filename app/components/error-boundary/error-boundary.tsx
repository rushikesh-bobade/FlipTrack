import { useEffect, useState } from "react";
import { isRouteErrorResponse, Link } from "react-router";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import type { Route } from "../../+types/root";
import styles from "./error-boundary.module.css";

const STATUS_COPY: Record<number, { title: string; description: string }> = {
  400: {
    title: "Bad request",
    description: "That request could not be processed. Please check the details and try again.",
  },
  401: {
    title: "Sign in required",
    description: "You need to be signed in to view this page.",
  },
  403: {
    title: "Access denied",
    description: "You do not have permission to view this page.",
  },
  404: {
    title: "Page not found",
    description: "The page you are looking for does not exist or may have been moved.",
  },
  500: {
    title: "Server error",
    description: "Something went wrong on our end. Please try again in a moment.",
  },
};

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const [copied, setCopied] = useState(false);

  let title = "Something went wrong";
  let description = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    const copy = STATUS_COPY[error.status];
    title = copy ? copy.title : "Error " + error.status;
    description = copy ? copy.description : error.statusText || description;
  } else if (error instanceof Error) {
    if (import.meta.env.DEV) {
      description = error.message || description;
      stack = error.stack;
    }
  }

  useEffect(() => {
    console.error("[ErrorBoundary] Caught an error:", error);
  }, [error]);

  const handleCopy = () => {
    if (!stack) return;
    navigator.clipboard.writeText(stack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className={styles.errorBoundary}>
      <div className={styles.errorContainer}>
        <div className={styles.iconWrapper}>
          <IconAlertTriangle size={40} stroke={1.5} />
        </div>

        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorDetails}>{description}</p>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={() => window.location.reload()}>
            <IconRefresh size={18} stroke={1.75} />
            Reload page
          </button>
          <Link to="/" className={styles.secondaryButton}>
            <IconHome size={18} stroke={1.75} />
            Go to homepage
          </Link>
        </div>

        {stack && (
          <div className={styles.errorStackWrapper}>
            <button className={styles.copyButton} onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <pre className={styles.errorStack}>
              <code>{stack}</code>
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
