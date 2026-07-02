import styles from "./faq-page.module.css";
import { FaqHeader } from "~/blocks/faq-page/faq-header";
import { GeneralQuestions } from "~/blocks/faq-page/general-questions";
import { FeaturesFunctionality } from "~/blocks/faq-page/features-functionality";
import { PricingBilling } from "~/blocks/faq-page/pricing-billing";
import { SecurityData } from "~/blocks/faq-page/security-data";
import { TechnicalIntegration } from "~/blocks/faq-page/technical-integration";
import type { Route } from "./+types/faq-page";
import { CACHE_PUBLIC_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PUBLIC_PAGE,
  };
}

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <FaqHeader />
      <GeneralQuestions />
      <FeaturesFunctionality />
      <PricingBilling />
      <SecurityData />
      <TechnicalIntegration />
    </div>
  );
}
