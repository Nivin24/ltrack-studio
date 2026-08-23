# ⚡ LTrack Studio — Modern Peer Learning & Collaborative Engineering Platform

<div align="center">

![LTrack Logo](public/logo.png)

**Real-Time Collaborative Code Studio, WebRTC Live Voice Calling, WhatsApp-Grade Audio Notes & Verified Progress Engine.**

[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Live_Voice-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 🌟 Overview

**LTrack Studio** is an enterprise-grade learning management and live peer collaboration ecosystem built with **Apple Human Interface Guidelines (Dark Mode Obsidian)** aesthetics. It enables software engineering students, bootcamps, and teams to pair-program, share live voice notes, communicate via real-time WebRTC audio calls, run interactive Python challenges, and track syllabus mastery with zero lag.

---

## ✨ Key Features

### 🎙️ 1. Live Peer Pairing Studio (WebRTC & WhatsApp Audio)
- **Discord-Grade Real-Time Voice Calling**: 128kbps Opus HD voice stream directly between browsers using WebRTC and Google STUN.
- **Voice Activity Detection (VAD)**: Real-time speaking detection with audio level meters.
- **WhatsApp Voice Notes Player**:
  - Record real microphone audio notes with dynamic waveform visualization.
  - Interactive playback with **`0.5x`, `1x`, `1.5x`, `2x`** speed control and seek scrubbing.
  - WhatsApp-style inline delete confirmation directly inside chat bubbles.
- **Auto-Scroll & Unread Dividers**: Automatically scrolls to the newest messages while anchoring unread peer messages with a clean indicator.
- **Live Typing Indicator**: Real-time pulsing `• • •` typing indicator when your peer types.

### 💻 2. Collaborative Python Code Sandbox & Live Co-Op Execution
- **Multiplayer Syntax-Highlighted Editor**: Layered Python token highlighting for keywords, built-ins, strings, and comments.
- **Dynamic Active Editor Indicator**: Clean presence chips distinguishing local vs peer active typing with zero canvas overlap.
- **Co-Op Python Execution Engine**: Click **`▶ Run`** to execute scratchpad code with output synchronized to all participants in real time.
- **Phase-by-Phase Challenges & Concept Quizzes**: Built-in coding problems covering Async Python, FastAPI, Docker, and RAG Architectures.

### 📊 3. Role-Based Dashboards (Learner vs Admin)
- **Learner Dashboard**: Interactive progress ring, syllabus milestones, daily check-in modal, active task streaks, and verified proof-of-work metrics.
- **Admin & Coordinator Command Center**:
  - Cohort health radar and at-risk learner alert cards.
  - CRUD Modals for Assignments, Topics, and Members.
  - Deep-dive assignment evaluation drawer with granular rubric scoring (Code Quality, Understanding, Testing, Documentation).

### 🌐 4. High-Performance Zero-Latency Sync Architecture
- **Dual-Layer Real-Time Engine**:
  - **BroadcastChannel IPC**: Sub-millisecond zero-network local IPC for tabs on the same machine.
  - **FastAPI WebSockets**: Networked broadcast across remote devices and cloud instances.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System (Apple HIG Space Gray & Metallic Copper `#d4a373`).
- **Icons**: Lucide React.
- **Audio & Media**: Browser MediaRecorder API, WebRTC `RTCPeerConnection`, Web Audio API `AudioContext` & `AnalyserNode`.
- **Backend**: FastAPI, Uvicorn, Python 3.12, WebSockets, Pydantic v2.
- **Hosting**: Vercel (SPA Frontend) + Render / Railway / Fly.io (Backend WebSockets).

---

## 🚀 Quick Start

### Prerequisites
- Node.js `v18.0.0+`
- Python `3.10+` (optional for local backend API)

### 1. Clone the Repository
```bash
git clone https://github.com/Nivin24/ltrack-studio.git
cd ltrack-studio
```

### 2. Install & Run Frontend
```bash
# Install NPM dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run FastAPI Backend (Optional)
```bash
# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python requirements
pip install -r backend/requirements.txt

# Start FastAPI server on port 8080
uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
```

---

## ☁️ Deployment on Vercel

1. Push your changes to GitHub.
2. Import the repository on [Vercel](https://vercel.com/).
3. Vercel automatically detects the Vite framework and builds using:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy and share the live URL with your peers!

---

## 📄 License

MIT License © 2026 Nivin / LTrack Studio.
