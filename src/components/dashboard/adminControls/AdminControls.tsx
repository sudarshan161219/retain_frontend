import { useState } from "react";
import { useRetainerAdmin } from "@/hooks/client/useRetainerAdmin";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { Button } from "@/components/ui/button";
import type { RetainerLog } from "@/types/retainer/retainer";
import {
  Copy,
  Check,
  PlayCircle,
  PauseCircle,
  Archive,
  AlertTriangle,
  Plus,
  Loader2,
  Pencil,
  Zap,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import styles from "./index.module.css";

interface AdminControlsProps {
  adminToken: string;
  client: any;
}

export const AdminControls = ({ adminToken, client }: AdminControlsProps) => {
  const { openModal } = useModalStore(); // To trigger Refill
  const {
    addLog,
    updateStatus,
    updateDetails,
    isAddingLog,
    isUpdatingStatus,
    isUpdatingDetails,
  } = useRetainerAdmin(adminToken);

  // --- LOG FORM ---
  const [formData, setFormData] = useState({
    description: "",
    hours: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // --- SETTINGS FORM (Decoupled from Hours) ---
  const [isEditing, setIsEditing] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: client.name || "",
    refillLink: client.refillLink || "",
  });

  // --- COPY LINK ---
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const url = `${window.location.origin}/${client.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.hours) return;
    addLog(
      {
        description: formData.description,
        hours: Number(formData.hours),
        date: new Date(formData.date).toISOString(),
      },
      {
        onSuccess: () =>
          setFormData((prev) => ({ ...prev, description: "", hours: "" })),
      },
    );
  };

  // ✅ FIX: This now ONLY updates Name/Link. It ignores hours completely.
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails(
      {
        name: settingsForm.name,
        refillLink: settingsForm.refillLink || null,
        // Notice: No totalHours here!
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const hoursSpent = client.logs
    .filter((log: RetainerLog) => log.type !== "REFILL")
    .reduce((acc: number, log: RetainerLog) => acc + Number(log.hours), 0);

  // 2. Calculate Remaining
  const totalBudget = Number(client.totalHours);
  const remaining = totalBudget - hoursSpent;

  return (
    <div className={styles.stack}>
      {/* 1. SECURITY WARNING */}
      <div className={styles.warningCard}>
        <AlertTriangle className={styles.warningIcon} size={20} />
        <div>
          <h3 className={styles.warningTitle}>Save your Admin Link</h3>
          <p className={styles.warningText}>
            Bookmark this page. If you lose this URL, you lose access to the
            dashboard.
          </p>
        </div>
      </div>

      {/* 2. BUDGET & STATUS (The "Money" Card) */}
      <div className={styles.card}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2
              className={styles.cardHeader}
              style={{ marginBottom: "0.25rem" }}
            >
              Project Status
            </h2>
            <p className="text-xs text-zinc-500">
              Manage budget and visibility
            </p>
          </div>

          {/* Top Up Button */}
          <Button
            onClick={() => openModal("REFILL_BALANCE")} // Trigger Modal
            variant="outline"
            className={styles.topUpBtn}
          >
            <Zap size={14} fill="currentColor" />
            Top Up Balance
          </Button>
        </div>

        <div className={styles.budgetcard}>
          <div className={styles.budgetsection}>
            <p className={styles.budgetlabel}>Total Budget</p>
            <p className={styles.budgetvalue}>
              {totalBudget.toFixed(2)}
              <span className={styles.budgetunit}>hrs</span>
            </p>
          </div>

          <div className={styles.budgetdivider}></div>

          <div className={styles.budgetsection}>
            <p className={styles.budgetlabel}>Remaining</p>
            <p className={styles.budgetvalue}>
              {remaining.toFixed(2)}
              <span className={styles.budgetunit}>hrs</span>
            </p>
          </div>
        </div>

        {/* Status Toggles */}
        <div className={styles.statusGrid}>
          <StatusButton
            active={client.status === "ACTIVE"}
            onClick={() => updateStatus("ACTIVE")}
            label="Active"
            icon={<PlayCircle size={16} />}
            activeClass={styles.statusActive}
            isLoading={isUpdatingStatus && client.status !== "ACTIVE"}
          />
          <StatusButton
            active={client.status === "PAUSED"}
            onClick={() => updateStatus("PAUSED")}
            label="Paused"
            icon={<PauseCircle size={16} />}
            activeClass={styles.statusPaused}
            isLoading={isUpdatingStatus && client.status !== "PAUSED"}
          />
          <StatusButton
            active={client.status === "ARCHIVED"}
            onClick={() => updateStatus("ARCHIVED")}
            label="Done"
            icon={<Archive size={16} />}
            activeClass={styles.statusArchived}
            isLoading={isUpdatingStatus && client.status !== "ARCHIVED"}
          />
        </div>
      </div>

      {/* 3. SETTINGS (The "Identity" Card) */}
      <div className={styles.card}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            Project Settings
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editIconBtn}
            >
              <Pencil size={14} />
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSettingsSubmit} className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label htmlFor="Name" className={styles.label}>
                Project Name
              </label>
              <input
                id="Name"
                className={styles.input}
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, name: e.target.value })
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="Refill" className={styles.label}>
                Refill / Payment Link
              </label>
              <div className="relative">
                <LinkIcon
                  size={14}
                  className="absolute left-3 top-3 text-zinc-500"
                />
                <input
                  id="Refill"
                  className={`${styles.RefillInput} pl-9`}
                  value={settingsForm.refillLink}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      refillLink: e.target.value,
                    })
                  }
                  placeholder="https://stripe.com/..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingDetails}
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                {isUpdatingDetails ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={styles.label}>Public Client Link</label>
              <div className={styles.copyContainer}>
                <code className={styles.codeBlock}>
                  {window.location.origin}/{client.slug}
                </code>
                <button onClick={handleCopy} className={styles.copyButton}>
                  {copied ? (
                    <Check size={16} color="#16a34a" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. ADD LOG FORM (Unchanged) */}
      <div className={styles.card}>
        <h2 className={styles.cardHeader}>
          <Plus className={styles.plusIcon} /> Log Hours
        </h2>
        <form onSubmit={handleLogSubmit} className={styles.formStack}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Fixed navigation bug on mobile"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={client.status !== "ACTIVE"}
            />
          </div>
          <div className={styles.gridCols2}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Hours</label>
              <input
                type="number"
                step="0.25"
                placeholder="0.00"
                className={styles.input}
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                disabled={client.status !== "ACTIVE"}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                disabled={client.status !== "ACTIVE"}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              isAddingLog ||
              !formData.description ||
              !formData.hours ||
              client.status !== "ACTIVE"
            }
            variant="outline"
            className={styles.submitButton}
          >
            {isAddingLog ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Add Entry"
            )}
          </Button>

          {client.status !== "ACTIVE" && (
            <p className={styles.errorMessage}>
              Client is currently {client.status}. Resume to add logs.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// Helper
const StatusButton = ({
  active,
  onClick,
  label,
  icon,
  activeClass,
  isLoading,
}: any) => {
  const btnClass = `${styles.statusButton} ${active ? activeClass : ""}`;
  return (
    <button
      onClick={onClick}
      disabled={active || isLoading}
      className={btnClass}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
      <span className={styles.statusLabel}>{label}</span>
    </button>
  );
};
