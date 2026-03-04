export type TimerState = {
  startTime: number | null;
  isRunning: boolean;
  carbonTotalKg: number;
};

export type UiState = {
  isPanelOpen: boolean;
};

export type WebsiteActivityEntry = {
  timeSpentSec: number;
  carbonKg: number;
  lastVisited: number;
};

export type WebsiteActivity = Record<string, WebsiteActivityEntry>;

export type DailyStats = {
  date: string;
  totalCarbonKg: number;
  totalTimeSec: number;
};

export type DailyStatsHistory = Record<string, DailyStats>;

export type UserConfigV2 = {
  deviceWatts: Record<string, number>;
  lightingWatts: number;
  climatePercent: number;
  climateWattsAt100: number;
};

export type BubblePosition = {
  x: number;
  y: number;
};

export const STORAGE_KEYS = {
  timerState: "timerState",
  uiState: "uiState",
  websiteActivity: "websiteActivity",
  dailyStats: "dailyStats",
  dailyStatsHistory: "dailyStatsHistory",
  userConfigV2: "userConfig_v2",
  bubblePosition: "bubblePosition"
} as const;

export const DEFAULT_TIMER_STATE: TimerState = {
  startTime: null,
  isRunning: false,
  carbonTotalKg: 0
};

export const DEFAULT_UI_STATE: UiState = {
  isPanelOpen: false
};

export const DEFAULT_DAILY_STATS = (date: string): DailyStats => ({
  date,
  totalCarbonKg: 0,
  totalTimeSec: 0
});

export const DEFAULT_USER_CONFIG_V2: UserConfigV2 = {
  deviceWatts: {},
  lightingWatts: 0,
  climatePercent: 0,
  climateWattsAt100: 0
};

export const storageGet = async <T>(
  keys: string | string[] | Record<string, unknown>
): Promise<T> => {
  return (await chrome.storage.local.get(keys)) as T;
};

export const storageSet = async (items: Record<string, unknown>): Promise<void> => {
  await chrome.storage.local.set(items);
};

export const storageSubscribe = (
  handler: (changes: Record<string, chrome.storage.StorageChange>) => void
): (() => void) => {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local") return;
    handler(changes);
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
};
