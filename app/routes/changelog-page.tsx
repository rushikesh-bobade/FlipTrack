import styles from "./changelog-page.module.css";
import { ChangelogHeader } from "~/blocks/changelog-page/changelog-header";
import { VersionReleases } from "~/blocks/changelog-page/version-releases";
import { SubscribeToUpdates } from "~/blocks/changelog-page/subscribe-to-updates";
import type { Route } from "./+types/changelog-page";
import { CACHE_PUBLIC_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PUBLIC_PAGE,
  };
}

export default function ChangelogPage() {
  return (
    <div className={styles.page}>
      <ChangelogHeader />
      <VersionReleases />
      <SubscribeToUpdates />
    </div>
  );
}
