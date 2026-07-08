import styles from "./marketplace-logos-strip.module.css";
import { MARKETPLACE_LOGOS } from "./marketplace-logos";

interface Props {
  className?: string;
}

export function MarketplaceLogosStrip({ className }: Props) {
  const doubled = [...MARKETPLACE_LOGOS, ...MARKETPLACE_LOGOS];
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <p className={styles.label}>Connected to the platforms you already use</p>
      <div style={{ overflow: "hidden" }}>
        <div className={styles.track}>
          {doubled.map((marketplace, i) => {
            const Logo = marketplace.Component;
            return (
              <div key={i} className={styles.logo}>
                <Logo className={styles.logoImage} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}