import styles from "./home.module.css";
import { HeroSection } from "~/blocks/home/hero-section";
import { ProblemSolutionStrip } from "~/blocks/home/problem-solution-strip";
import { FeaturesShowcase } from "~/blocks/home/features-showcase";
import { MarketplaceLogosStrip } from "~/blocks/home/marketplace-logos-strip";
import { PricingSection } from "~/blocks/home/pricing-section";
import { TestimonialsSection } from "~/blocks/home/testimonials-section";
import { FaqAccordion } from "~/blocks/home/faq-accordion";
import { CtaBanner } from "~/blocks/home/cta-banner";
import type { Route } from "./+types/home";
import { CACHE_PUBLIC_PAGE } from "~/utils/cache-headers";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": CACHE_PUBLIC_PAGE,
  };
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <MarketplaceLogosStrip />
      <ProblemSolutionStrip />
      <FeaturesShowcase />
      <PricingSection />
      <TestimonialsSection />
      <FaqAccordion />
      <CtaBanner />
    </div>
  );
}
