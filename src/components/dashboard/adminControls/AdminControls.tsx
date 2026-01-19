import { useState } from "react";
import { useRetainerAdmin } from "@/hooks/client/useRetainerAdmin";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  PlayCircle,
  PauseCircle,
  Archive,
  AlertTriangle,
  Plus,
  Loader2,
  Pencil, // New Icon
  X, // New Icon
  Save, // New Icon
} from "lucide-react";
import { format } from "date-fns";
import styles from "./index.module.css";

interface AdminControlsProps {
  adminToken: string;
  client: any;
}

export const AdminControls = ({ adminToken, client }: AdminControlsProps) => {
  const {
    addLog,
    updateStatus,
    updateDetails, // New Mutation
    isAddingLog,
    isUpdatingStatus,
    isUpdatingDetails, // New Loading State
  } = useRetainerAdmin(adminToken);

  // --- LOG FORM STATE ---
  const [formData, setFormData] = useState({
    description: "",
    hours: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // --- SETTINGS EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: client.name || "",
    refillLink: client.refillLink || "",
    totalHours: client.totalHours || "",
  });

  // --- COPY LINK STATE ---
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const url = `${window.location.origin}/${client.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- HANDLERS ---
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
        onSuccess: () => {
          setFormData((prev) => ({ ...prev, description: "", hours: "" }));
        },
      }
    );
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails(
      {
        name: settingsForm.name,
        refillLink: settingsForm.refillLink || null, // Send null if empty
        totalHours: Number(settingsForm.totalHours),
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  return (
    <div className={styles.stack}>
      {/* 1. SECURITY WARNING */}
      <div className={styles.warningCard}>
        <AlertTriangle className={styles.warningIcon} size={20} />
        <div>
          <h3 className={styles.warningTitle}>Save your Admin Link</h3>
          <p className={styles.warningText}>
            We don't have accounts. If you lose the URL of this page, you lose
            access to this dashboard forever. Bookmark it now.
          </p>
        </div>
      </div>

      {/* 2. ADD LOG FORM */}
      <div className={styles.card}>
        <h2 className={styles.cardHeader}>
          <Plus className={styles.plusIcon} />
          Log Hours
        </h2>

        <form onSubmit={handleLogSubmit} className={styles.formStack}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              placeholder="e.g. Fixed navigation bug on mobile"
              className={styles.input}
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

      {/* 3. SETTINGS & EDIT DETAILS */}
      <div className={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            Settings
          </h2>

          {/* Toggle Edit Mode */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={styles.editIconBtn}
            title="Edit Project Details"
          >
            {isEditing ? <X size={16} /> : <Pencil size={14} />}
          </button>
        </div>

        {/* EDIT MODE FORM */}
        {isEditing ? (
          <form onSubmit={handleSettingsSubmit} className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Project Name</label>
              <input
                type="text"
                className={styles.input}
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, name: e.target.value })
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Refill / Payment Link</label>
              <input
                type="url"
                placeholder="https://buy.stripe.com/..."
                className={styles.input}
                value={settingsForm.refillLink}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    refillLink: e.target.value,
                  })
                }
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Optional. Paste a payment link here to show a "Refill" button on
                the client dashboard.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isUpdatingDetails}
              variant="default"
              className={styles.submitButton}
            >
              {isUpdatingDetails ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </Button>
          </form>
        ) : (
          /* READ ONLY VIEW */
          <div className="space-y-6">
            {/* Share Link */}
            <div>
              <label
                className={styles.label}
                style={{ marginBottom: "0.5rem" }}
              >
                Public Client Link
              </label>
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

            {/* Total Budget Input with Save Button */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Total Budget (Hours)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className={styles.input}
                  value={settingsForm.totalHours}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      totalHours: e.target.value,
                    })
                  }
                  placeholder="e.g. 20"
                />
                <button
                  onClick={() =>
                    updateDetails({
                      totalHours: Number(settingsForm.totalHours),
                    })
                  }
                  disabled={
                    isUpdatingDetails ||
                    Number(settingsForm.totalHours) === client.totalHours
                  }
                  className="bg-black text-white px-4 rounded-lg text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  title="Save new budget"
                >
                  {isUpdatingDetails ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Enter the new total (e.g. change 20 to 40) after receiving
                payment.
              </p>
            </div>

            {/* Status Toggles */}
            <div>
              <label
                className={styles.label}
                style={{ marginBottom: "0.5rem" }}
              >
                Project Status
              </label>
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
          </div>
        )}
      </div>
    </div>
  );
};

// ... StatusButton Helper Component (Same as before) ...

// Helper Component
const StatusButton = ({
  active,
  onClick,
  label,
  icon,
  activeClass,
  isLoading,
}: any) => {
  // Combine base class + conditional active class
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
