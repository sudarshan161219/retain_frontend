import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  ExternalLink,
  Loader2,
  Twitter,
  Coffee,
  LogOut,
  Sun,
  Moon,
  Trash2,
  Download,
} from "lucide-react";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { useRetainerAdmin } from "@/hooks/client/useRetainerAdmin";
import { clearAuthToken } from "@/lib/api/api";
import { useThemeStore } from "@/store/theme/useThemeStore";
import styles from "./index.module.css";

export const DashboardNavbar = () => {
  const { adminToken } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModalStore();
  const { theme, toggleLight, toggleDark } = useThemeStore();

  // 1. Fetch Admin Data
  const { client, isLoading, deleteProject } = useRetainerAdmin(adminToken);

  // 2. Handle Logout
  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
  };

  // 3. Handle Exit
  const handleExitClick = () => {
    openModal("WARNING", {
      title: "Close Dashboard?",
      description:
        "This URL is your password. If you leave without saving it, you will lose access to this project and its data permanently.",
      confirmText: "Delete",
      variant: "neutral",
      onConfirm: async () => {
        handleLogout();
      },
    });
  };

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal("WARNING", {
      title: "Leave Page?",
      description:
        "Leaving this page will reset your current session data. Ensure you have the link saved if you want to return.",
      confirmText: "Leave & Reset",
      variant: "neutral",
      onConfirm: async () => {
        handleLogout();
        navigate("/");
      },
    });
  };

  const handleDeleteClick = () => {
    openModal("WARNING", {
      title: "Delete Project Permanently?",
      description:
        "This will wipe all data, logs, and access links immediately. This action cannot be undone.",
      confirmText: "Delete Everything",
      variant: "danger",
      onConfirm: async () => {
        deleteProject(undefined, {
          onSuccess: () => {
            handleLogout();
          },
        });
      },
    });
  };

  // 4. Handle Theme Toggle
  const handleThemeToggle = () => {
    if (theme === "dark") {
      toggleLight();
    } else {
      toggleDark();
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* LEFT: Branding */}
        <div className={styles.leftSection}>
          <Link onClick={handleLeaveClick} to="/" className={styles.brandLink}>
            <div className={styles.logoBox}>
              <LayoutDashboard size={18} strokeWidth={2} />
            </div>
            <span className={styles.brandText}>Retain</span>
          </Link>

          <span className={styles.divider}></span>

          <div className={styles.clientName}>
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              client?.name || "Project Dashboard"
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className={styles.rightSection}>
          {/* Desktop Only Links */}
          <div className={styles.desktopLinks}>
            <a
              href="https://x.com/buildwithSud"
              target="_blank"
              rel="noreferrer"
              className={styles.xButton}
              title="Follow Updates"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://buymeacoffee.com/sudarshanhosalli"
              target="_blank"
              rel="noreferrer"
              className={styles.supportButton}
            >
              <Coffee size={14} />
              <span>Support</span>
            </a>
          </div>

          <div className={styles.verticalLine}></div>

          {/* THEME TOGGLE (New) */}
          <button
            onClick={handleThemeToggle}
            className={styles.iconButton}
            title={theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={handleDeleteClick}
            className={styles.deleteButton}
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>

          {/* PUBLIC VIEW LINK */}
          {client?.slug && (
            <a
              href={`/${client.slug}`}
              target="_blank"
              rel="noreferrer"
              title="View as Client"
              className={styles.publicLinkButton}
            >
              <ExternalLink size={16} />
              <span className={styles.brandText}>Client View</span>
            </a>
          )}

          <button
            onClick={() => openModal("EXPORT_REPORT")}
            className={styles.iconBtn}
            title="Download Report"
          >
            <Download size={16} />
          </button>

          {/* LOGOUT / EXIT */}
          <button
            onClick={handleExitClick}
            title="Exit Dashboard"
            className={styles.exitButton}
          >
            <LogOut size={16} />
            <span className={styles.brandText}>Exit</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
