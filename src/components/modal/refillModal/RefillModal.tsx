import { useState } from "react";
import { useParams } from "react-router-dom";
import { Zap, X, Plus } from "lucide-react";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { useClientRefill } from "@/hooks/client/useClientRefill";
import { Loader2 } from "lucide-react";
import styles from "./index.module.css";

export const RefillModal = () => {
  const { adminToken } = useParams();
  const { closeModal } = useModalStore();

  // 1. Fetch the specific mutation from your hook
  const { refillBalance, isRefilling } = useClientRefill(adminToken);

  // 2. Local state for the form
  const [hours, setHours] = useState(10);
  const [createLog, setCreateLog] = useState(true);

  const handleSubmit = () => {
    if (!refillBalance) return;

    refillBalance(
      { hours: Number(hours), createLog },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        {/* Close Button */}
        <button onClick={closeModal} className={styles.closeBtn}>
          <X size={18} />
        </button>

        {/* Icon Header - Yellow Theme */}
        <div
          className={styles.modalIcon}
          style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308" }}
        >
          <Zap size={32} strokeWidth={1.5} fill="currentColor" />
        </div>

        <h3 className={styles.modalTitle}>Top Up Balance</h3>
        <p className={styles.modalText}>
          Add hours to the total budget. This will increase the "Total Limit"
          and update the remaining balance immediately.
        </p>

        {/* Input Area */}
        <div className="w-full text-left mb-6 space-y-4">
          {/* Hours Input */}
          <div>
            <label htmlFor="add" className={styles.label}>
              Hours to Add
            </label>
            <div className="relative">
              <Plus
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                id="add"
                type="number"
                min="0.25"
                step="0.25"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={styles.input} // Reusing your existing input style
                style={{
                  paddingLeft: "2.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Toggle Log */}
          <label htmlFor="Toggle" className={styles.toggleLog}>
            <input
              id="Toggle"
              type="checkbox"
              checked={createLog}
              onChange={(e) => setCreateLog(e.target.checked)}
              className={styles.toggle}
            />
            <div className="flex flex-col">
              <span className={styles.toggleLogH}>
                Create a "Refill" log entry
              </span>
              <span className={styles.toggleLogP}>
                Adds a visible event to the history timeline so the client knows
                when hours were added.
              </span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          <button
            onClick={closeModal}
            className={styles.cancelBtn}
            disabled={isRefilling}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRefilling || hours <= 0}
            className={styles.confirmBtn}
            // Overriding generic confirm styles for the "Money" action
            style={{
              backgroundColor: "#eab308", // Yellow-500
              color: "#000",
              border: "none",
            }}
          >
            {isRefilling ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              `Add ${hours} Hours`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
