import { useEffect, useRef } from "react";
import { BASE_RATE_KG_PER_S, getMultiplier } from "../../shared/carbon";
import {
  DEFAULT_DAILY_STATS,
  DEFAULT_TIMER_STATE,
  STORAGE_KEYS,
  storageGet,
  storageSet,
  storageSubscribe,
  type DailyStats,
  type DailyStatsHistory,
  type TimerState,
  type WebsiteActivity
} from "../../shared/storage";
import { todayKey } from "../../shared/time";

const getDomain = (): string => {
  try {
    return window.location.hostname;
  } catch {
    return "unknown";
  }
};

export const useCarbonEngine = () => {
  const timerRef = useRef<TimerState>(DEFAULT_TIMER_STATE);

  useEffect(() => {
    void (async () => {
      const result = await storageGet<{ [STORAGE_KEYS.timerState]?: TimerState }>({
        [STORAGE_KEYS.timerState]: DEFAULT_TIMER_STATE
      });
      timerRef.current = result[STORAGE_KEYS.timerState] ?? DEFAULT_TIMER_STATE;
    })();

    return storageSubscribe((changes) => {
      const change = changes[STORAGE_KEYS.timerState];
      if (!change) return;
      timerRef.current = (change.newValue ?? DEFAULT_TIMER_STATE) as TimerState;
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const timerState = timerRef.current;
      if (!timerState.isRunning) return;
      if (document.hidden) return;

      const domain = getDomain();
      const multiplier = getMultiplier(domain);
      const deltaS = 1;
      const incrementKg = BASE_RATE_KG_PER_S * multiplier * deltaS;

      void (async () => {
        const date = todayKey();
        const stored = await storageGet<{
          [STORAGE_KEYS.timerState]?: TimerState;
          [STORAGE_KEYS.websiteActivity]?: WebsiteActivity;
          [STORAGE_KEYS.dailyStats]?: DailyStats;
          [STORAGE_KEYS.dailyStatsHistory]?: DailyStatsHistory;
        }>({
          [STORAGE_KEYS.timerState]: DEFAULT_TIMER_STATE,
          [STORAGE_KEYS.websiteActivity]: {},
          [STORAGE_KEYS.dailyStats]: DEFAULT_DAILY_STATS(date),
          [STORAGE_KEYS.dailyStatsHistory]: {}
        });

        const nextTimer: TimerState = {
          ...(stored[STORAGE_KEYS.timerState] ?? DEFAULT_TIMER_STATE),
          carbonTotalKg: (stored[STORAGE_KEYS.timerState]?.carbonTotalKg ?? 0) + incrementKg
        };

        const activity = { ...(stored[STORAGE_KEYS.websiteActivity] ?? {}) };
        const prevEntry = activity[domain] ?? { timeSpentSec: 0, carbonKg: 0, lastVisited: Date.now() };
        activity[domain] = {
          timeSpentSec: prevEntry.timeSpentSec + deltaS,
          carbonKg: prevEntry.carbonKg + incrementKg,
          lastVisited: Date.now()
        };

        const history = { ...(stored[STORAGE_KEYS.dailyStatsHistory] ?? {}) };
        const current = stored[STORAGE_KEYS.dailyStats];
        let daily: DailyStats;
        if (!current || current.date !== date) {
          if (current?.date) history[current.date] = current;
          daily = DEFAULT_DAILY_STATS(date);
        } else {
          daily = current;
        }

        const nextDaily: DailyStats = {
          date: daily.date,
          totalCarbonKg: daily.totalCarbonKg + incrementKg,
          totalTimeSec: daily.totalTimeSec + deltaS
        };

        await storageSet({
          [STORAGE_KEYS.timerState]: nextTimer,
          [STORAGE_KEYS.websiteActivity]: activity,
          [STORAGE_KEYS.dailyStatsHistory]: history,
          [STORAGE_KEYS.dailyStats]: nextDaily
        });
      })();
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);
};

