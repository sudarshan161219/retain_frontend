import { useParams } from "react-router-dom";
import { FileSpreadsheet, X } from "lucide-react";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { Button } from "@/components/ui/button";
import styles from "./index.module.css";
import { useRetainerAdmin } from "@/hooks/client/useRetainerAdmin";

export const ExportModal = () => {
  const { adminToken } = useParams();
  const { closeModal } = useModalStore();
  const { client, exportReport, isExporting } = useRetainerAdmin(adminToken);

  const handleConfirmExport = () => {
    // 2. Call the mutation from the hook
    // We pass onSuccess to close the modal ONLY after download starts
    exportReport(undefined, {
      onSuccess: () => {
        closeModal();
      },
    });
  };
  if (!client) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button onClick={() => closeModal()} className={styles.closeBtn}>
          <X size={18} />
        </button>

        <div className={styles.modalIcon}>
          <FileSpreadsheet size={32} strokeWidth={1.5} />
        </div>

        <h3 className={styles.modalTitle}>Export Report</h3>
        <p className={styles.modalText}>
          Download a detailed Excel breakdown of all
          <b> {client.logs.length}</b> work logs?
        </p>

        <div className={styles.modalActions}>
          <Button
            variant="secondary"
            onClick={() => closeModal()}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmExport}
            disabled={isExporting}
            variant="default"
            className="cursor-pointer"
          >
            {isExporting ? "Downloading..." : "Download Excel"}
          </Button>
        </div>
      </div>
    </div>
  );
};
