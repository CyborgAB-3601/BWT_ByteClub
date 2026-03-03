# Byte_Club 
# 🌿 EcoSense

EcoSense is a behavioral carbon intelligence platform built for hybrid workers.

It combines a Chrome extension for real-time carbon tracking with a web dashboard for analytics and sustainability insights.

The system estimates carbon emissions from:

- 💻 Device electricity usage  
- ☁️ Cloud-based website activity  
- 🚗 Office commute  

All real-time calculations run locally inside the browser, while Supabase provides secure storage and analytics.

---

# 🏗 System Architecture

EcoSense follows a **client-first architecture** with four core layers:

1. Chrome Extension (Real-Time Engine)
2. External APIs (Environmental Context)
3. Supabase Backend (Persistence & Security)
4. Web Dashboard (Analytics & Visualization)

---

## 1️⃣ Chrome Extension

The Chrome extension is the core intelligence layer of EcoSense.

It performs real-time tracking and carbon calculations directly in the browser.

### Components

### 🔹 Popup UI
Displayed when the extension icon is clicked.

Allows users to:
- Start a work session
- Select Home or Office mode
- Enter work hours
- Open the full dashboard

---

### 🔹 Floating EcoBubble Panel
A draggable floating panel that appears on webpages.

Features:
- Live carbon counter
- Active session timer
- Environmental alerts
- Optimization suggestions

---

### 🔹 Background Script

Runs continuously and handles:

- Active domain tracking
- Time spent per website
- Per-second carbon calculation
- Periodic sync with Supabase

---

### 🔹 Carbon Calculation Engine

Carbon emissions are calculated using three components:

#### ☁️ Cloud Carbon

Based on domain intensity classification.
