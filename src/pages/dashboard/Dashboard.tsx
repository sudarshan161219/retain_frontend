import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRetainerAdmin } from "@/hooks/client/useRetainerAdmin";
import { RetainerSocketManager } from "@/components/socketManager/RetainerSocketManager";
import { AdminControls } from "@/components/dashboard/adminControls/AdminControls";
import { PublicRetainerCard } from "@/components/dashboard/publicRetainerCard/PublicRetainerCard";
import styles from "./index.module.css";

export const Dashboard = () => {
  const { adminToken } = useParams();

  // 1. Fetch Admin Data
  const { client, isLoading, isError } = useRetainerAdmin(adminToken);

  if (isLoading) {
    return (
      <div className={styles.centerContainer}>
        <Loader2 className={styles.spinner} size={32} />
        <p className={styles.loadingText}>Loading Dashboard...</p>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className={styles.centerContainer}>
        <div className="text-center">
          <h1 className={styles.errorTitle}>Access Denied</h1>
          <p className={styles.errorText}>
            Invalid admin token or project expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* SYNC ENGINE */}
      {client.slug && <RetainerSocketManager slug={client.slug} />}

      {/* MAIN CONTENT */}
      <main className={styles.mainGrid}>
        {/* LEFT COLUMN: Controls */}
        <div className={styles.controlsColumn}>
          <h2 className={styles.sectionTitle}>Management Console</h2>
          <AdminControls adminToken={adminToken!} client={client} />
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div>
          <div className={styles.previewHeader}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Client Live Preview
            </h2>
            <span className={styles.liveBadge}>LIVE</span>
          </div>

          <div className={styles.cardWrapper}>
            {/* Glow Effect */}
            <div className={styles.cardGlow}></div>

            {/* Card Content */}
            <div className={styles.cardInner}>
              <PublicRetainerCard client={client} />
            </div>
          </div>

          <p className={styles.helperText}>
            This card is exactly what your client sees when they visit the
            public link.
          </p>
        </div>
      </main>
    </div>
  );
};
