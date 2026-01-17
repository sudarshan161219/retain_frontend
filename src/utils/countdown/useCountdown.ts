import { useCallback, useEffect, useState } from "react";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const useCountdown = (expiresAt: string | null): Countdown => {
  const calculate = useCallback((): Countdown => {
    if (!expiresAt) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = expiry - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false,
    };
  }, [expiresAt]);

  const [time, setTime] = useState<Countdown>(() => calculate());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculate]);

  return time;
};
