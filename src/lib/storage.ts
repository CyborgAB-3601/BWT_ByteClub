// src/lib/storage.ts
export interface TimerState {
  startTime: number | null; // Timestamp when session started, or null if not running
  elapsedBeforePause: number; // Seconds accumulated before current start
  isRunning: boolean;
  carbonTotal: number; // Accumulated carbon (kg)
}

export interface WebsiteActivity {
  domain: string;
  timeSpent: number; // seconds
  lastVisited: number; // timestamp
  carbon?: number; // Accumulated carbon in kg
}

// PART 1: BASE ENGINE CONSTANTS
export const BASE_RATE = 0.0000025; // kg per second (Laptop + cloud baseline)

// PART 2: DOMAIN INTENSITY TABLE
export const DOMAIN_INTENSITY: Record<string, number> = {
    // LOW INTENSITY (1.0)
    "wikipedia.org": 1.0,
    "medium.com": 1.0,
    "docs.google.com": 1.0,
    "drive.google.com": 1.0,
    "stackoverflow.com": 1.0,
    
    // MEDIUM INTENSITY (1.6)
    "slack.com": 1.6,
    "notion.so": 1.6,
    "github.com": 1.6,
    "trello.com": 1.6,
    "asana.com": 1.6,
    
    // HIGH INTENSITY (2.4)
    "figma.com": 2.4,
    "canva.com": 2.4,
    "miro.com": 2.4,
    "aws.amazon.com": 2.4,
    "console.cloud.google.com": 2.4,
    "azure.microsoft.com": 2.4,
    
    // STREAMING HD (4.0)
    "youtube.com": 4.0,
    "netflix.com": 4.0,
    "primevideo.com": 4.0,
    
    // STREAMING 4K (6.0) - simplified matching for now
    "youtube.com/4k": 6.0
};

export const getMultiplier = (domain: string): number => {
    // 1. Exact match
    if (DOMAIN_INTENSITY[domain]) return DOMAIN_INTENSITY[domain];
    
    // 2. Subdomain/Path matching (e.g. netflix.com should match netflix.com/browse)
    // We iterate through keys to find if current domain contains the key
    const keys = Object.keys(DOMAIN_INTENSITY);
    for (const key of keys) {
        // If domain ends with key (e.g. www.netflix.com ends with netflix.com)
        // OR if domain contains key (simple check)
        if (domain.includes(key)) {
            return DOMAIN_INTENSITY[key];
        }
    }
    
    return 1.0;
};

export interface DeviceConfig {
  id: string;
  name: string;
  watts: number;
  type: 'laptop' | 'desktop' | 'monitor' | 'router' | 'printer' | 'other';
  selected: boolean;
}

export const INITIAL_TIMER_STATE: TimerState = {
  startTime: null,
  elapsedBeforePause: 0,
  isRunning: false,
  carbonTotal: 0
};

export interface DailyStats {
    carbon: number;
    time: number;
    lastUpdated: number;
}

export const DEFAULT_DEVICES: DeviceConfig[] = [
  { id: 'laptop', name: 'Laptop', watts: 65, type: 'laptop', selected: false },
  { id: 'desktop', name: 'Desktop PC', watts: 250, type: 'desktop', selected: false },
  { id: 'monitor', name: 'Monitor', watts: 30, type: 'monitor', selected: false },
  { id: 'router', name: 'Wi-Fi Router', watts: 10, type: 'router', selected: false },
  { id: 'printer', name: 'Printer', watts: 50, type: 'printer', selected: false },
];
