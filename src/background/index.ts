import {
  DEFAULT_DAILY_STATS,
  DEFAULT_TIMER_STATE,
  DEFAULT_UI_STATE,
  STORAGE_KEYS,
  storageGet,
  storageSet,
  type DailyStats,
  type DailyStatsHistory,
  type TimerState,
  type UiState,
  type WebsiteActivity
} from "../shared/storage";
import { todayKey } from "../shared/time";

const ensureDefaults = async (): Promise<void> => {
  const date = todayKey();
  const existing = await storageGet<{
    [STORAGE_KEYS.timerState]?: TimerState;
    [STORAGE_KEYS.uiState]?: UiState;
    [STORAGE_KEYS.websiteActivity]?: WebsiteActivity;
    [STORAGE_KEYS.dailyStats]?: DailyStats;
    [STORAGE_KEYS.dailyStatsHistory]?: DailyStatsHistory;
  }>({
    [STORAGE_KEYS.timerState]: undefined,
    [STORAGE_KEYS.uiState]: undefined,
    [STORAGE_KEYS.websiteActivity]: undefined,
    [STORAGE_KEYS.dailyStats]: undefined,
    [STORAGE_KEYS.dailyStatsHistory]: undefined
  });

  const toSet: Record<string, unknown> = {};
  if (!existing[STORAGE_KEYS.timerState]) toSet[STORAGE_KEYS.timerState] = DEFAULT_TIMER_STATE;
  if (!existing[STORAGE_KEYS.uiState]) toSet[STORAGE_KEYS.uiState] = DEFAULT_UI_STATE;
  if (!existing[STORAGE_KEYS.websiteActivity]) toSet[STORAGE_KEYS.websiteActivity] = {};

  const daily = existing[STORAGE_KEYS.dailyStats];
  if (!daily || daily.date !== date) toSet[STORAGE_KEYS.dailyStats] = DEFAULT_DAILY_STATS(date);
  if (!existing[STORAGE_KEYS.dailyStatsHistory]) toSet[STORAGE_KEYS.dailyStatsHistory] = {};

  if (Object.keys(toSet).length > 0) await storageSet(toSet);
};

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaults();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureDefaults();
});
