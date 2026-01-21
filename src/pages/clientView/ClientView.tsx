import { useParams } from "react-router-dom";
import { Loader2, Calendar, Clock, Sun, Moon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useRetainerClient } from "@/hooks/client/useRetainerClient";
import { formatDuration } from "@/lib/formatters";
import { RetainerSocketManager } from "@/components/socketManager/RetainerSocketManager";
import styles from "./index.module.css";
import { useThemeStore } from "@/store/theme/useThemeStore";
import type { RetainerLog, RetainerStatus } from "@/types/retainer/retainer";

export const ClientView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: client, isLoading, isError } = useRetainerClient(slug);
  const { theme, toggleLight, toggleDark } = useThemeStore();

  if (isLoading)
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  if (isError || !client) {
    return (
      <div className={styles.loaderContainer}>
        <div style={{ textAlign: "center", opacity: 0.7 }}>
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className={styles.clientName} style={{ marginBottom: "0.5rem" }}>
            Project Not Found
          </h2>
          <p className={styles.subTitle}>
            This project has been deleted or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  // CALCULATIONS
  const totalHours = Number(client.totalHours || 0);

  const hoursUsed = client.logs
    .filter((log: RetainerLog) => log.type !== "REFILL")
    .reduce((acc: number, log: RetainerLog) => acc + Number(log.hours || 0), 0);

  const percentage =
    totalHours > 0 ? Math.min((hoursUsed / totalHours) * 100, 100) : 0;

  const isOverBudget = hoursUsed > totalHours;
  const remaining = totalHours - hoursUsed;

  // Determine Badge Style
  const getBadgeStyle = (status: RetainerStatus) => {
    switch (status) {
      case "ACTIVE":
        return styles.statusActive;
      case "PAUSED":
        return styles.statusPaused;
      case "ARCHIVED":
        return styles.statusArchived;
      default:
        return styles.statusActive;
    }
  };

  const handleThemeToggle = () => {
    if (theme === "dark") {
      toggleLight();
    } else {
      toggleDark();
    }
  };

  return (
    <div className={styles.page}>
      {/* 1. SOCKET LISTENER (Invisible Component) */}
      {slug && <RetainerSocketManager slug={slug} />}

      {/* 2. ARCHIVED BANNER */}
      {client.status === "ARCHIVED" && (
        <div className={styles.archivedBanner}>
          This project is archived and read-only
        </div>
      )}

      {/* 3. TOP BAR */}
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div>
            <h1 className={styles.clientName}>{client.name}</h1>
            <p className={styles.subTitle}>Retainer Dashboard</p>
          </div>

          <div className={styles.themeStatusContainer}>
            <button
              onClick={handleThemeToggle}
              className={styles.iconButton}
              title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className={styles.verticalLine}></div>
            <div
              className={`${styles.statusBadge} ${getBadgeStyle(
                client.status,
              )}`}
            >
              {client.status.toLowerCase()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* 4. PROGRESS CARD */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.budgetLabel}>Budget Used</p>
              <div className={styles.percentageBig}>
                {percentage.toFixed(0)}%
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                className={`${styles.remainingText} ${
                  remaining < 0 ? styles.textDanger : styles.textNormal
                }`}
              >
                {remaining < 0
                  ? `${Math.abs(remaining).toFixed(2)} hrs OVER`
                  : `${remaining.toFixed(2)} hrs remaining`}
              </p>
              <p className={styles.totalLabel}>
                of {formatDuration(totalHours)} total
              </p>
            </div>
          </div>

          {/* The Bar */}
          <div className={styles.progressBarTrack}>
            <div className={styles.patternOverlay} />
            <div
              className={`${styles.progressFill} ${
                isOverBudget ? styles.fillRed : styles.fillWhite
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Refill CTA (Hidden if Archived or not needed) */}
          {client.refillLink &&
            client.status === "ACTIVE" &&
            (isOverBudget || percentage > 90) && (
              <a
                href={client.refillLink}
                target="_blank"
                rel="noreferrer"
                className={styles.refillButton}
              >
                Renew Retainer
              </a>
            )}
        </div>

        {/* 5. HISTORY LIST */}
        <div>
          <h3 className={styles.sectionTitle}>
            <Clock size={16} /> Work History
          </h3>

          <div className={styles.logList}>
            {client.logs.length === 0 ? (
              <div className={styles.emptyState}>
                <Calendar className="mx-auto mb-2 opacity-50" size={24} />
                <p>No work logged yet.</p>
              </div>
            ) : (
              client.logs.map((log: RetainerLog) => (
                <div key={log.id} className={styles.logItem}>
                  <div>
                    <p className={styles.logDescription}>{log.description}</p>
                    <p className={styles.logDate}>
                      {format(new Date(log.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className={styles.logHours}>
                    {Number(log.hours).toFixed(2)}h
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
