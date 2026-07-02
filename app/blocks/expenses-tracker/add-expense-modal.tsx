import { useState } from "react";
import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./add-expense-modal.module.css";

interface Props {
  className?: string;
  onClose: () => void;
  expense?: any;
}

export function AddExpenseModal({ className, onClose, expense }: Props) {
  const isEditing = !!expense;
  const [isRecurring, setIsRecurring] = useState(false);

  const dateValue = expense?.date
    ? new Date(expense.date).toISOString().split("T")[0]
    : "";

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={[styles.modal, className].filter(Boolean).join(" ")}>
        <div className={styles.header}>
          <span className={styles.title}>{isEditing ? "Edit Expense" : "Add Expense"}</span>
          <button className={styles.closeBtn} onClick={onClose}><IconX size={18} /></button>
        </div>
        <Form method="post" onSubmit={() => onClose()}>
          <input type="hidden" name="intent" value={isEditing ? "update" : "create"} />
          {isEditing && <input type="hidden" name="id" value={expense.id} />}
          <div className={styles.body}>
          {!isEditing && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <input type="checkbox" name="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{marginRight: '8px'}} />
                  Is this a recurring monthly expense?
                </label>
              </div>
            </div>
          )}
          <div className={styles.row}>
            {isRecurring && !isEditing ? (
              <div className={styles.field}><label className={styles.label}>Day of Month *</label><input name="dayOfMonth" className={styles.input} type="number" min="1" max="31" defaultValue="1" required /></div>
            ) : (
              <div className={styles.field}><label className={styles.label}>Date *</label><input name="date" className={styles.input} type="date" defaultValue={dateValue} required /></div>
            )}
            <div className={styles.field}><label className={styles.label}>Amount *</label><input name="amount" className={styles.input} type="number" step="0.01" placeholder="0.00" defaultValue={expense?.amount ?? ""} required /></div>
          </div>
          <div className={styles.field}><label className={styles.label}>Description *</label><input name="description" className={styles.input} placeholder="e.g. StockX seller fee" defaultValue={expense?.description ?? ""} required /></div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select name="type" className={styles.input} defaultValue={expense?.type ?? "MARKETPLACE_FEE"}><option value="MARKETPLACE_FEE">Marketplace Fee</option><option value="SHIPPING">Shipping</option><option value="BOT_FEE">Bot Fee</option><option value="ADVERTISING">Advertising</option><option value="STORAGE">Storage</option><option value="SUPPLIES">Supplies</option><option value="CUSTOM">Custom</option></select>
          </div>
        </div>
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.saveBtn}>{isEditing ? "Update Expense" : "Save Expense"}</button>
        </div>
        </Form>
      </div>
    </div>
  );
}