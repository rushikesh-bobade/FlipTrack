import styles from "./export-options.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  taxYear: number;
  className?: string;
  sales?: any[];
  expenses?: any[];
}

export function ExportOptions({ taxYear, className, sales = [], expenses = [] }: Props) {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`FlipTrack Tax Report - ${taxYear}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    const revenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
    const cogs = sales.reduce((sum, s) => sum + (s.inventoryItem?.purchasePrice || 0), 0);
    const platformFees = sales.reduce((sum, s) => sum + s.platformFee, 0);
    const shippingCosts = sales.reduce((sum, s) => sum + s.shippingCost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - platformFees - shippingCosts - totalExpenses;
    
    autoTable(doc, {
      startY: 40,
      head: [["Tax Summary Metric", "Amount"]],
      body: [
        ["Total Revenue", `$${revenue.toFixed(2)}`],
        ["Cost of Goods Sold (COGS)", `$${cogs.toFixed(2)}`],
        ["Gross Profit", `$${grossProfit.toFixed(2)}`],
        ["Deductible Fees (Platform)", `$${platformFees.toFixed(2)}`],
        ["Deductible Costs (Shipping)", `$${shippingCosts.toFixed(2)}`],
        ["Other Business Expenses", `$${totalExpenses.toFixed(2)}`],
        ["Net Taxable Income", `$${netProfit.toFixed(2)}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
    });
    
    if (expenses.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Date", "Expense Category", "Amount"]],
        body: expenses.map(e => [
          new Date(e.date).toLocaleDateString(),
          e.category,
          `$${e.amount.toFixed(2)}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
      });
    }

    doc.save(`fliptrack_tax_report_${taxYear}.pdf`);
  };
  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <a
        href={`/api/export/tax?year=${taxYear}`}
        download
        className={styles.btn}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <span className={styles.btnIcon}>📄</span>
        CSV Export
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          For spreadsheets
        </span>
      </a>
      <button
        className={styles.btn}
        onClick={handleExportPDF}
      >
        <span className={styles.btnIcon}>📊</span>
        PDF Report
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          Download PDF
        </span>
      </button>
      <button
        className={styles.btn}
        disabled
        style={{ opacity: 0.5, cursor: "not-allowed" }}
      >
        <span className={styles.btnIcon}>📝</span>
        Form 8949
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            display: "block",
            marginTop: "2px",
          }}
        >
          Coming soon
        </span>
      </button>
    </div>
  );
}
