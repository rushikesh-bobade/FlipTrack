import styles from "./terms-of-service.module.css";
import { TermsHeader } from "~/blocks/terms-of-service/terms-header";
import { TermsSections } from "~/blocks/terms-of-service/terms-sections";
import type { Route } from "./+types/terms-of-service";
import { CACHE_LEGAL_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_LEGAL_PAGE,
  };
}

export default function TermsOfServicePage() {
  return (
    <div className={styles.page}>
      <TermsHeader />
      <TermsSections />
    </div>
  );
}
