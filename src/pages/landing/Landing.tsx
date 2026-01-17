import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { Feature } from "@/components/feature/Feature";
import { formatDuration } from "@/lib/formatters";
import api, { setAuthToken } from "@/lib/api/api";

import {
  ArrowRight,
  Clock,
  Link,
  BarChart3,
  Loader2,
  Twitter,
  Coffee,
  Zap,
  Lock,
  Eye,
} from "lucide-react";

export const Landing = () => {
  const navigate = useNavigate();

  // State for the new dual-input form
  const [name, setName] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !name.trim() || !totalHours) return;

    setLoading(true);

    try {
      // 1. Call the new /clients endpoint
      const { data } = await api.post<{
        data: { adminToken: string; slug: string };
      }>("/clients", {
        name,
        totalHours: Number(totalHours),
      });

      const { adminToken } = data.data;

      // 2. Save Admin Token & Redirect to the Admin Manager
      setAuthToken(adminToken);
      navigate(`/manage/${adminToken}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Failed to create retainer");
      } else {
        alert("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            {/* Changed icon to Clock/Chart for Retain */}
            <BarChart3 size={20} strokeWidth={3} />
          </div>
          Retain
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a
            href="https://x.com/buildwithSud"
            target="_blank"
            rel="noreferrer"
            className={styles.navLink}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Twitter size={16} />
            <span style={{ fontSize: "0.875rem" }}>Updates</span>
          </a>

          <a
            href="https://buymeacoffee.com/sudarshanhosalli"
            target="_blank"
            rel="noreferrer"
            className={styles.navLink}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Coffee size={16} />
            <span style={{ fontSize: "0.875rem" }}>Support</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <main className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.pulseDot} />
          v1.0 Public Beta
        </div>

        <h1 className={styles.title}>
          Stop sending <br />
          <span className={styles.gradientText}>"hours remaining" emails.</span>
        </h1>

        <p className={styles.subtitle}>
          Give your clients a live progress bar for their retainer. You log
          work, they see the burn rate. Zero friction. No sign-ups.
        </p>

        {/* UPDATED FORM: Two Inputs now */}
        <form onSubmit={handleStart} className={styles.form}>
          <div className={styles.formGlow} />
          <div
            className={styles.formInner}
            style={{ flexDirection: "column", gap: "0.5rem" }}
          >
            {/* Input Group: Flex on desktop, Stack on mobile */}
            <div style={{ display: "flex", width: "100%", gap: "0.5rem" }}>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client Name (e.g. Acme Corp)"
                className={styles.input}
                style={{ flex: 2 }}
                disabled={loading}
              />

              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="number"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  placeholder="Hours"
                  className={styles.input}
                  style={{ width: "100%" }}
                  disabled={loading}
                />

                {/* 3. ADD THIS: Floating helper text */}
                {totalHours && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-25px",
                      right: "0",
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {formatDuration(Number(totalHours))}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !totalHours || loading}
              className={styles.button}
              style={{ width: "100%" }}
            >
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                "Create Dashboard"
              )}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>

          <p className={styles.helperText}>
            Free forever. No account required.
          </p>
        </form>
      </main>

      {/* HOW IT WORKS (Retainer Logic) */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <Clock />
            </div>
            <h3>1. Set Budget</h3>
            <p>Define the total hours for the month (e.g. 20 hrs).</p>
          </div>

          <div className={styles.stepArrow}>
            <ArrowRight />
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <Link />
            </div>
            <h3>2. Share Link</h3>
            <p>Send the unique link. The client sees a live progress bar.</p>
          </div>

          <div className={styles.stepArrow}>
            <ArrowRight />
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <BarChart3 />
            </div>
            <h3>3. Log Work</h3>
            <p>Add logs as you go. The progress bar updates instantly.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <Feature
            icon={<Zap />}
            title="Real-Time Sync"
            text="Updates appear instantly on the client's screen via WebSockets."
          />
          <Feature
            icon={<Lock />}
            title="Private Admin Link"
            text="You get a secret admin key. No username or password to forget."
          />
          <Feature
            icon={<Eye />}
            title="Total Transparency"
            text="Clients see exactly where their money is going, down to the decimal."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <span>
            © {new Date().getFullYear()} Retain. Built for Freelancers.
          </span>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
            <a
              href="https://x.com/buildwithSud"
              target="_blank"
              rel="noreferrer"
              style={{
                opacity: 0.6,
                fontSize: "0.8rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Built by Sudarshan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
