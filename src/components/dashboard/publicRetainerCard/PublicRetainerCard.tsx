import { format } from "date-fns";
import { Clock, ExternalLink, Download } from "lucide-react";
import { formatDuration } from "@/lib/formatters";
import styles from "./index.module.css";
import { useModalStore } from "@/store/modalStore/useModalStore";

interface WorkLog {
  id: string;
  description: string;
  hours: string | number;
  date: string;
}

interface ClientData {
  name: string;
  totalHours: string | number;
  refillLink?: string | null;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  logs: WorkLog[];
}

interface PublicRetainerCardProps {
  client: ClientData;
}

export const PublicRetainerCard = ({ client }: PublicRetainerCardProps) => {
  const { openModal } = useModalStore();
  // Calculations
  const total = Number(client.totalHours);
  const used = client.logs
    .filter((log: any) => log.type !== "REFILL")
    .reduce((acc: number, log: any) => acc + Number(log.hours), 0);
  const percentage = Math.min((used / total) * 100, 100);
  const isOverBudget = used > total;
  const remaining = total - used;

  // Helper to determine status color class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return styles.statusActive;
      case "PAUSED":
        return styles.statusPaused;
      default:
        return styles.statusArchived;
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{client.name}</h2>
            <div className={styles.metaRow}>
              <p className={styles.statusText}>
                Status:{" "}
                <span className={getStatusClass(client.status)}>
                  {client.status}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => openModal("EXPORT_REPORT")}
              className={styles.iconBtn}
              title="Download Report"
            >
              <Download size={16} />
            </button>

            {client.refillLink && (
              <a
                href={client.refillLink}
                target="_blank"
                rel="noreferrer"
                className={styles.refillBtn}
              >
                Refill <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        <div className={styles.body}>
          {/* PROGRESS BAR SECTION */}
          <div>
            <div className={styles.statsRow}>
              <div className={styles.status}>
                <span className={styles.percentage}>
                  {percentage.toFixed(0)}%
                </span>
                <span className={styles.usedLabel}>used</span>
              </div>
              <div style={{ textAlign: "right" }} className={styles.remaining}>
                <p
                  className={`${styles.remainingHours} ${
                    isOverBudget ? styles.textRed : styles.textZinc
                  }`}
                >
                  {remaining < 0 ? "+" : ""}
                  {remaining.toFixed(2)} hrs
                </p>
                <p className={styles.remainingLabel}>
                  {isOverBudget ? "Over Budget" : "Remaining"}
                </p>
              </div>
            </div>

            <div className={styles.progressBarContainer}>
              <div className={styles.patternOverlay} />
              <div
                className={`${styles.progressBarFill} ${
                  isOverBudget ? styles.bgRed : styles.bgWhite
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className={styles.limitsRow}>
              <span>0 hrs</span>
              <span>{formatDuration(total)} limit</span>
            </div>
          </div>

          {/* LOG HISTORY */}
          <div>
            <h3 className={styles.recentHeader}>
              <Clock size={12} /> Recent Activity
            </h3>

            <div className={styles.scrollContainer}>
              {client.logs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No work logged yet.</p>
                </div>
              ) : (
                client.logs.map((log) => (
                  <div key={log.id} className={styles.logItem}>
                    <div className={styles.logDescription}>
                      <p className={styles.descText}>{log.description}</p>
                      <div className={styles.dateRow}>
                        <span className={styles.dateText}>
                          {format(new Date(log.date), "MMM d")}
                        </span>
                      </div>
                    </div>
                    <span className={styles.hoursBadge}>
                      {Number(log.hours).toFixed(2)}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
