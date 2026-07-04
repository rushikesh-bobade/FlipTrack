import { IconStar } from "@tabler/icons-react";
import styles from "./testimonials-section.module.css";

interface Props {
  className?: string;
}

/* PLACEHOLDER: These testimonials are placeholder data for UI demonstration purposes only */
const testimonials = [
  {
    quote: "FlipTrack completely replaced my Google Sheets setup. The live price comparison table alone saves me 2 hours a week. The AI insights are actually useful — it flagged a sell window on my PS5 inventory that netted me an extra $80.",
    name: "Marcus T.",
    role: "Full-time Reseller",
    initials: "MT",
  },
  {
    quote: "I was skeptical about paying for a tool but the free plan already gives way more than my old spreadsheet. Upgraded to Pro after the first week. The tax report export alone is worth the $12/month — saved me 3 hours come April.",
    name: "Jordan K.",
    role: "Part-time Reseller, 150+ items",
    initials: "JK",
  },
  {
    quote: "Our team uses the Business plan and it's been a game changer. Everyone can see inventory in real-time, no more double-selling the same item. The activity log keeps everyone accountable.",
    name: "Riley & Sam",
    role: "Reselling Team, Business Plan",
    initials: "RS",
  },
];

export function TestimonialsSection({ className }: Props) {
  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2>Loved by resellers</h2>
          <p>Join thousands of resellers tracking smarter.</p>
        </div>
        <div className={styles.grid}>
          {testimonials.map((t) => (
            <div key={t.name} className={styles.card}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map((s) => <IconStar key={s} size={14} fill="#FFB347" className={styles.star} />)}
              </div>
              <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.initials}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.placeholderNote}>* Placeholder testimonials for demonstration purposes</p>
      </div>
    </section>
  );
}
