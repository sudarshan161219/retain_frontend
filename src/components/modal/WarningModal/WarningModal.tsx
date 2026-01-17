import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useModalStore } from "@/store/modalStore/useModalStore";
import styles from "./index.module.css";

export const WarningModal = () => {
  const { isOpen, type, data, closeModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || type !== "WARNING" || !data) return null;

  const handleConfirm = async () => {
    if (!data.onConfirm) return;

    try {
      setIsLoading(true);
      await data.onConfirm();
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <button
          onClick={closeModal}
          disabled={isLoading}
          className={styles.closeButton}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className={styles.contentWrapper}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={32} />
          </div>

          <h3 className={styles.title}>{data.title}</h3>

          <p className={styles.description}>{data.description}</p>

          <div className={styles.actions}>
            <button
              onClick={closeModal}
              disabled={isLoading}
              className={`${styles.baseButton} ${styles.cancelButton}`}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`${styles.baseButton} ${styles.confirmButton}`}
            >
              {isLoading ? (
                <Loader2 className={styles.spin} size={18} />
              ) : (
                data.confirmText || "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
