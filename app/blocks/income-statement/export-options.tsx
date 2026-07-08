import { IconDownload, IconFileText } from "@tabler/icons-react";
import styles from "./export-options.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props { 
  className?: string;
  sales?: any[];
  expenses?: any[];
}

export function ExportOptions({ className, sales = [], expenses = [] }: Props) {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("FlipTrack Income Statement", 14, 22);
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
      head: [["Metric", "Amount"]],
      body: [
        ["Total Revenue", `$${revenue.toFixed(2)}`],
        ["Cost of Goods Sold (COGS)", `$${cogs.toFixed(2)}`],
        ["Gross Profit", `$${grossProfit.toFixed(2)}`],
        ["Platform Fees", `$${platformFees.toFixed(2)}`],
        ["Shipping Costs", `$${shippingCosts.toFixed(2)}`],
        ["Other Expenses", `$${totalExpenses.toFixed(2)}`],
        ["Net Profit", `$${netProfit.toFixed(2)}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [66, 66, 66] },
    });
    
    const monthlyData: Record<string, { revenue: number, costs: number, expenses: number }> = {};
    
    sales.forEach(s => {
      const date = new Date(s.saleDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, costs: 0, expenses: 0 };
      monthlyData[month].revenue += s.salePrice;
      monthlyData[month].costs += (s.inventoryItem?.purchasePrice || 0) + s.platformFee + s.shippingCost;
    });
    
    expenses.forEach(e => {
      const date = new Date(e.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, costs: 0, expenses: 0 };
      monthlyData[month].expenses += e.amount;
    });

    const monthlyRows = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => [
        month,
        `$${data.revenue.toFixed(2)}`,
        `$${data.costs.toFixed(2)}`,
        `$${data.expenses.toFixed(2)}`,
        `$${(data.revenue - data.costs - data.expenses).toFixed(2)}`
      ]);

    if (monthlyRows.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Month", "Revenue", "COGS & Fees", "Expenses", "Net Profit"]],
        body: monthlyRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
      });
    }

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

    doc.save("fliptrack_income_statement.pdf");
  };

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <a href="/api/export/tax" download className={[styles.btn, styles.csvBtn].join(" ")} style={{ textDecoration: 'none' }}><IconDownload size={16} /> Export CSV</a>
      <button className={[styles.btn, styles.pdfBtn].join(" ")} onClick={handleExportPDF}><IconFileText size={16} /> Export PDF</button>
    </div>
  );
}
