/**
 * Converts raw hours into a human-readable "Days + Hours" format.
 * default: 1 Day = 8 Hours (Standard Freelance Workday)
 */
export const formatDuration = (totalHours: number, hoursPerDay = 8): string => {
  if (!totalHours) return "0h";

  // 1. Calculate full days
  const days = Math.floor(totalHours / hoursPerDay);

  // 2. Calculate remaining hours (handle floating point errors)
  const remainderHours = Number((totalHours % hoursPerDay).toFixed(2));

  const parts = [];

  // Add Days part
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  // Add Hours part
  if (remainderHours > 0) {
    parts.push(`${remainderHours} ${remainderHours === 1 ? "hr" : "hrs"}`);
  }

  return parts.join(" ");
};

/**
 * Example Usage:
 * formatDuration(4)    -> "4 hrs"
 * formatDuration(8)    -> "1 day"
 * formatDuration(12)   -> "1 day 4 hrs"
 * formatDuration(20)   -> "2 days 4 hrs"
 * formatDuration(0.5)  -> "0.5 hrs"
 */
