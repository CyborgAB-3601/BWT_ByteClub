# ByteClub 
THEME : CLIMATE OPTIMIZATION ENGINE

# 🌿 EcoSense

EcoSense is a behavioral carbon intelligence platform built for hybrid workers.

# 🌍 The Problem
Hybrid work has introduced a new sustainability challenge for organizations.
As employees work from home using personal devices, energy usage shifts away from centralized offices, making carbon tracking more complex.
Traditional carbon accounting systems do not account for:
Home office devices | Work-hour electricity usage | Cloud-based digital activity | Changing commute patterns

This creates a visibility gap in measuring hybrid workforce emissions.

# 💡Solution
EcoSense combines a Chrome extension for real-time carbon tracking with a web dashboard for analytics and sustainability insights.

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


All calculations run locally for speed and performance.

---

## 2️⃣ External APIs

### 🌤 Weather API

Used to:
- Fetch local temperature
- Trigger AC optimization alerts
- Provide environmental awareness

---

### 🗺 Maps API

Used to:
- Calculate commute distance
- Estimate transport emissions

---

## 3️⃣ Supabase Backend

Supabase handles authentication and persistent storage.

### 🔐 Authentication
Secure user login and session management.

### 🗄 PostgreSQL Database

Stores:

- User profiles
- Device configurations
- Work sessions
- Domain activity logs
- Daily summaries
- Sustainability scores

### 🛡 Row Level Security

Ensures each user can only access their own data.

---

## 4️⃣ Web Dashboard

The dashboard is a separate web application connected to Supabase.

It provides:

- 📊 Daily carbon breakdown
- 🌐 Domain-level analysis
- 🔄 Hybrid vs Office comparison
- 📅 Monthly projections
- 🏆 Sustainability score
- 🎯 Gamification and rewards
- ⚙️ User settings

---

# 🔄 Data Flow

1. User starts session from the extension  
2. Website activity is tracked per second  
3. Carbon is calculated locally in real time  
4. Session data is temporarily stored  
5. Aggregated results are pushed to Supabase  
6. Dashboard fetches structured data for analytics  

---

# ⚙ Design Principles

- Real-time client-side processing  
- Minimal backend dependency  
- Secure and scalable storage  
- Modular carbon calculation engine  
- Clear separation of tracking, storage, and visualization  

---

EcoSense is designed to be lightweight, scalable, and extensible for enterprise hybrid work environments.

Based on domain intensity classification.
