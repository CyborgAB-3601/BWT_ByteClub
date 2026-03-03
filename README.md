# BWT_ByteClub

🌿 EcoSense

EcoSense is a behavioral carbon intelligence platform designed for hybrid workers.
It combines a Chrome extension for real-time tracking with a web dashboard for analytics and insights.

The system estimates carbon emissions from:

Device electricity usage

Cloud-based website activity

Office commute

All real-time calculations happen locally in the browser, while Supabase handles secure storage and analytics.

🏗 System Architecture

EcoSense follows a client-first architecture with four main layers:

Chrome Extension (Real-time Engine)

External APIs (Environmental Context)

Supabase Backend (Persistence & Security)

Web Dashboard (Analytics & Visualization)

1️⃣ Chrome Extension

The Chrome extension is the core intelligence layer of EcoSense.

It is responsible for real-time carbon modeling and user interaction.

Components
Popup UI

Displayed when the extension icon is clicked.
Allows users to:

Start a work session

Select Home or Office mode

Enter work hours

Open the full dashboard

Floating EcoBubble Panel

A draggable floating panel that appears on webpages.

Features:

Live carbon counter

Active session timer

Environmental alerts

Optimization suggestions

This provides continuous behavioral feedback during work.

Background Script

Runs silently in the browser.

Responsible for:

Tracking active website domains

Measuring time spent per domain

Running per-second carbon calculations

Syncing summarized data to Supabase

Carbon Calculation Engine

Carbon is calculated using three independent components:

Cloud Carbon

Estimated using domain intensity classification.

Formula:

Cloud Carbon = Base Rate × Domain Multiplier × Time
Device Carbon

Calculated based on device power consumption.

Formula:

Energy (kWh) = Power (kW) × Work Hours
Device Carbon = Energy × Grid Emission Factor
Commute Carbon (Office Mode Only)

Formula:

Commute Carbon = Distance × 2 × Transport Emission Factor
Final Daily Calculation
Total Daily Carbon =
Device Carbon +
Cloud Carbon +
Commute Carbon

All calculations are executed locally for performance and responsiveness.

2️⃣ External APIs
Weather API

Used to:

Fetch local temperature

Trigger optimization alerts

Provide contextual sustainability suggestions

Maps API

Used to:

Calculate commute distance

Estimate transport emissions

3️⃣ Supabase Backend

Supabase provides secure authentication and persistent storage.

Authentication

User identity and session management.

PostgreSQL Database

Stores:

User profiles

Device configurations

Work sessions

Domain activity breakdown

Daily summaries

Sustainability scores

Row Level Security

Ensures each user can only access their own data.

4️⃣ Web Dashboard

The dashboard is a separate web application connected to Supabase.

It provides:

Daily carbon breakdown

Domain-level analysis

Hybrid vs Office comparisons

Monthly projections

Sustainability scoring

Gamification and rewards

User configuration settings

The dashboard is analytics-focused and optimized for visualization.

🔄 Data Flow

User starts a session from the extension

Domain activity is tracked per second

Carbon is calculated locally in real time

Session data is temporarily stored in the extension

Aggregated results are pushed to Supabase

Dashboard fetches structured data for analytics

⚙ Design Principles

Real-time client-side processing

Minimal backend dependency

Secure and scalable data storage

Modular carbon calculation engine

Clear separation of tracking, storage, and visualization

EcoSense is designed to be lightweight, scalable, and extensible for enterprise hybrid work environments.
