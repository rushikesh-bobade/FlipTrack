import { Form } from "react-router";
import { IconX } from "@tabler/icons-react";
import styles from "./log-sale-modal.module.css";

interface Props {
  saleId: string;
  onClose: () => void;
}

export function DeleteSaleModal({ saleId, onClose }: Props) {
  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>Delete Sale</span>

          <button
            className={styles.closeBtn}
            type="button"
            onClick={onClose}
          >
            <IconX size={18} />
          </button>
        </div>

        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="saleId" value={saleId} />

          <div className={styles.body}>
            Are you sure you want to delete this sale?
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
            >
              Delete
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}