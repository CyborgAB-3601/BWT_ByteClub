# EcoSense Master Build Prompt

You are an expert Senior Full-Stack Developer and Chrome Extension Specialist. Your task is to build **EcoSense**, a high-fidelity Chrome Extension that tracks and visualizes the real-time carbon footprint of a user's web browsing activity.

**Tech Stack:**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (configured for Chrome Extension: `vite-plugin-web-extension` or manual CRX setup)
- **Styling:** Tailwind CSS (Dark Mode default, "Cyber-Eco" aesthetic: #0e1216 bg, Mint/Teal accents)
- **Animation:** Framer Motion (smooth transitions, floating bubbles)
- **Icons:** Lucide React
- **Charts:** Recharts

---

## 🚀 Phase 1: Foundation & UI/UX (The "EcoBubble")

**Goal:** Create the extension shell and the floating interaction point injected into every webpage.

1.  **Manifest V3 Setup**:
    *   Permissions: `storage`, `activeTab`, `scripting`, `tabs`.
    *   Host Permissions: `<all_urls>`.
    *   Content Scripts: Inject `content.tsx` into all pages.
    *   Options Page: `index.html` (React App).

2.  **The EcoBubble (Content Script)**:
    *   Inject a floating, draggable bubble into every webpage.
    *   **Visuals**:
        *   Default: A glowing globe icon.
        *   **Dynamic State**: The bubble color **MUST** change based on the current website's carbon intensity (logic defined in Phase 2).
            *   **Green**: Low intensity (e.g., Wikipedia).
            *   **Yellow**: Medium intensity (e.g., GitHub).
            *   **Red + Pulse**: High intensity/Streaming (e.g., YouTube, Netflix).
    *   **Live Rate Indicator**:
        *   Display a small floating tag *below* the bubble showing the real-time Carbon Rate: e.g., `0.00250g/s`.
    *   **Interaction**:
        *   Clicking the bubble opens the **Mini Control Panel** (overlay).
        *   State (Open/Closed) must sync across all open tabs. If I close it in Tab A, it closes in Tab B.

3.  **Mini Control Panel**:
    *   A glassmorphism card that expands from the bubble.
    *   **Controls**:
        *   **"Start Session"**: Starts the global timer.
        *   **"End Session"**: Stops timer, saves data, resets. **NO Pause button**.
    *   **Stats**:
        *   Show "Session Duration" (00:00:00).
        *   Show "Session Carbon" (accumulated kgCO2).

---

## 🧠 Phase 2: The Carbon Engine (Logic)

**Goal:** Implement the scientific model for calculating digital carbon.

1.  **Constants**:
    *   `BASE_RATE` = **0.0000025 kg/s** (Baseline for laptop + network).

2.  **Domain Intensity Map**:
    *   **Low (x1.0)**: `wikipedia.org`, `google.com`, `docs.google.com`.
    *   **Medium (x1.6)**: `slack.com`, `github.com`, `notion.so`.
    *   **High (x2.4)**: `figma.com`, `aws.amazon.com`, `canva.com`.
    *   **Streaming (x4.0 - x6.0)**: `youtube.com`, `netflix.com`, `primevideo.com`.
    *   **Logic**: Create a `getMultiplier(domain)` function that checks for exact matches AND substring matches (e.g., `netflix.com/browse` should match `netflix.com`).

3.  **Calculation Loop**:
    *   Runs every 1 second when "Session is Running".
    *   Formula: `Carbon = BASE_RATE * getMultiplier(current_domain) * time_delta`.
    *   **Per-Tab Tracking**: Only track the *active* tab (check `!document.hidden`).
    *   **Storage**: Save to `chrome.storage.local`:
        *   `timerState`: { startTime, isRunning, carbonTotal }
        *   `websiteActivity`: { domain: { timeSpent, carbon, lastVisited } }
        *   `dailyStats`: { date, totalCarbon, totalTime }

---

## 📊 Phase 3: The Dashboard (Full Page)

**Goal:** A comprehensive dashboard for analytics and configuration.

**Layout**: Fixed Sidebar (Left) + Scrollable Main Content (Right).
**Navigation**: Dashboard, Configure, Leaderboard, Analytics.

1.  **Page 1: Dashboard (Home)**
    *   **Summary Cards**: "Total Carbon Today" (Real data from `dailyStats`), "Session Time", "Eco Score".
    *   **Top Website Activity Table**:
        *   Columns: Domain, Time Spent, **Est. Carbon (Real Calc)**, Intensity Score.
        *   Sort by Carbon descending.

2.  **Page 2: Configure (Setup)**
    *   **Crucial Requirement**: All values must start at **0 / Empty**.
    *   **Device Selector**: Cards for Laptop (65W), Desktop (250W), Monitor (30W), etc.
    *   **Environment**:
        *   Lighting: LED (10W), Incandescent (60W), Natural (0W).
        *   Climate Slider: 0% (Off) to 100% (AC Max).
    *   **Logic**:
        *   `Total Watts = Sum(Devices) + Lighting + Climate`.
        *   **Persistence**: Save to `userConfig_v2`. If no config exists, default to 0W. Do NOT default to arbitrary values like 510W.

3.  **Page 3: Analytics**
    *   **3-Day Trend**: Cards showing Today vs Yesterday.
    *   **Monthly Calendar**: A grid view where days are colored based on carbon intensity (Low=Green, High=Red).

4.  **Page 4: Leaderboard (Gamification)**
    *   **Rankings**: List of users (Mock data + "You").
    *   **Rewards Store**: Sidebar showing coupons (Tree Planting, Coffee) redeemable for points.
    *   **Points Logic**: 10g CO2 saved = 50 Points.

---

## 🛠️ Phase 4: Implementation Details & Constraints

1.  **Storage Architecture**:
    *   Use `chrome.storage.local` for everything.
    *   **Keys**: `userConfig_v2` (Setup), `timerState` (Session), `dailyStats` (History), `websiteActivity` (Domain breakdown).

2.  **Zero-State Handling**:
    *   On first install, **NO** data should be pre-filled.
    *   Dashboard should show empty states or 0s.
    *   Setup page should show 0W until user selects devices.

3.  **Visual Style (Tailwind)**:
    *   **Background**: `#0e1216` (Deep dark blue/grey).
    *   **Primary**: `#10b981` (Emerald/Mint).
    *   **Secondary**: `#f59e0b` (Amber/Yellow).
    *   **Danger**: `#ef4444` (Red).
    *   **Components**: Glassmorphism panels (`bg-white/5 backdrop-blur`), rounded-xl borders.

4.  **Sync Logic**:
    *   Use `chrome.storage.onChanged` to sync the Bubble's Open/Close state and the Timer's Start/Stop state across all open tabs instantly.

---

**Deliverable**:
Start by initializing the project with Vite + React + TypeScript. Configure the manifest. Then build the "EcoBubble" content script first, as it is the core entry point for the user.
