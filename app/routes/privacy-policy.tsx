import styles from "./privacy-policy.module.css";
import { PolicyHeader } from "~/blocks/privacy-policy/policy-header";
import { PolicySections } from "~/blocks/privacy-policy/policy-sections";
import type { Route } from "./+types/privacy-policy";
import { CACHE_LEGAL_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_LEGAL_PAGE,
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <PolicyHeader />
      <PolicySections />
    </div>
  );
}
