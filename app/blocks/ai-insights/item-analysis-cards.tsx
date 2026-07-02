import styles from "./item-analysis-cards.module.css";
import type { AiInsightItem } from "~/routes/ai-insights";

interface Props { 
  className?: string; 
  onSelectItem?: (id: string) => void; 
  data: AiInsightItem[]; 
}

export function ItemAnalysisCards({ className, onSelectItem, data }: Props) {
  if (!data || data.length === 0) {
    return <div className={styles.emptyState}>No AI market insights available right now.</div>;
  }

  return (
    <div className={[styles.grid, className].filter(Boolean).join(" ")}>
      {data.map(item => (
        <div key={item.id} className={styles.card} onClick={() => onSelectItem?.(item.id)}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.name}>{item.name}</div>
              <div className={styles.sku}>{item.sku}</div>
            </div>
            <span className={[styles.recBadge, styles[item.recommendation]].join(" ")}>{item.recommendation}</span>
          </div>
          <p className={styles.reasoning}>{item.reasoning}</p>
          <div className={styles.footer}>
            <div className={styles.confidence}>
              <div className={styles.confLabel}>Confidence: {item.confidence}%</div>
              <div className={styles.confBar}><div className={styles.confFill} style={{ width: `${item.confidence}%` }} /></div>
            </div>
            <div className={styles.target}>Target: ${item.targetPrice}</div>
          </div>
        </div>
      ))}
    </div>
  );
}