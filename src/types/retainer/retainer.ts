export type RetainerStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type RetainerLogType = "REFILL" | "USAGE" | "ADJUSTMENT";

export interface RetainerLog {
  id: string;
  description: string;
  hours: string; // Decimal-safe
  date: string; // ISO string
  type: RetainerLogType;
}

export interface Retainer {
  id: string;
  name: string;
  slug: string;
  totalHours: string;
  refillLink: string | null;
  status: RetainerStatus;
  createdAt: string;
  logs: RetainerLog[];
}
