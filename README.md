<div align="center">

<br/>

<img src="https://img.shields.io/badge/🚌-SmartTransport-FF4103?style=for-the-badge&labelColor=001621&color=FF4103" alt="SmartTransport"/>

# SmartTransport Management System

### *Digitalising public & private transportation — end to end.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-smart--transport.cyan.vercel.app-FF4103?style=flat-square&logo=vercel&logoColor=white)](https://smart-transport.cyan.vercel.app)
[![API](https://img.shields.io/badge/⚙️%20Backend%20API-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://smarttransport.onrender.com/api/v1/health)
[![Database](https://img.shields.io/badge/🗄️%20Database-Neon%20PostgreSQL-00E699?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Redis](https://img.shields.io/badge/🔴%20Cache-Upstash%20Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://upstash.com)
[![License](https://img.shields.io/badge/📄%20License-MIT-22c55e?style=flat-square)](./LICENSE)
[![Node](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

<br/>

```
  🚌  ──────────────────────────────────────────────────────►  ✅
 Book        Search       Select       Pay        Track       Arrive
  Trip        Route        Seat      Securely    Live GPS    On Time
```

<br/>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Production Troubleshooting](#-production-troubleshooting)
- [Security](#-security)
- [Database Schema](#-database-schema)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

## 📖 Overview

**SmartTransport** is a production-ready, full-stack transportation management platform that covers the complete travel lifecycle — from booking a seat to real-time GPS tracking, payment processing, community updates, and administrator oversight.

Built as a final-year Computer Science & Engineering project at **Addis Ababa Science and Technology University (ASTU)**, it demonstrates enterprise-grade full-stack engineering: secure OTP authentication, role-based access control, real-time Socket.IO communication, cloud deployment, and a modern premium UI.

> **Live at:** [smart-transport.cyan.vercel.app](https://smart-transport.cyan.vercel.app)

---

## 🌐 Live Demo

| Service | URL | Status |
|---------|-----|--------|
| 🎨 Frontend | [smart-transport.cyan.vercel.app](https://smart-transport.cyan.vercel.app) | ![Vercel](https://img.shields.io/badge/deployed-brightgreen?style=flat-square) |
| ⚙️ Backend API | `https://smarttransport.onrender.com/api/v1/health` | ![Render](https://img.shields.io/badge/deploy-brightgreen?style=flat-square) |
| 🗄️ Database | Neon PostgreSQL (serverless) | ![Neon](https://img.shields.io/badge/connected-brightgreen?style=flat-square) |
| 🔴 Cache | Upstash Redis (TLS) | ![Upstash](https://img.shields.io/badge/connected-brightgreen?style=flat-square) |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- Email OTP on every login via Gmail SMTP
- Bcrypt password hashing (factor 12)
- JWT access + refresh token sessions
- Forgot password / reset password flow
- Account lockout after 5 failed attempts
- Rate limiting on all sensitive endpoints

### 🎫 Trip Booking
- Browse admin-created scheduled trips
- Interactive seat selection
- 15-minute reservation hold with Redis locking
- Booking state machine: reserved → confirmed
- Cancel bookings with instant seat release

### 💳 Payment Processing
- Payment session creation
- Webhook-verified confirmation
- Full payment audit trail
- Auto-release on failure

</td>
<td width="50%">

### 📍 Live Vehicle Tracking
- Socket.IO real-time GPS streaming
- Driver shares location from browser
- Passenger subscribes to trip room
- Google Maps integration

### 🌐 Community Feed
- Posts + comments with nested replies
- Like/unlike posts and comments (DB-persisted)
- Share posts via Web Share API or clipboard
- Admin/author moderation: edit + delete

### 🗺️ Nearby Services
- Garages, fuel stations, hotels
- Geolocation detection with distance sorting
- Admin CRUD with Google Maps link parsing
- Maps + Call buttons per service

### 👑 Admin Dashboard
- User management & role assignment
- Trip scheduling with full CRUD
- Booking & payment management
- Audit log (real DB data, paginated)
- System health monitoring

</td>
</tr>
</table>

---

## 👤 User Roles

```
                         ┌──────────────────┐
                         │  system_admin    │  ← Full platform access
                         └────────┬─────────┘
          ┌──────────────────────┼──────────────────────┐
   ┌──────┴──────┐     ┌─────────┴──────┐     ┌────────┴───────────────┐
   │   driver    │     │   traffic_     │     │  garage_manager /      │
   │             │     │   authority    │     │  fuel_station_manager  │
   └──────┬──────┘     └─────────┬──────┘     └────────┬───────────────┘
          └──────────────────────┼──────────────────────┘
                         ┌───────┴──────┐
                         │  passenger   │  ← Default on registration
                         └──────────────┘
```

| Role | Description |
|---|---|
| 🧑‍✈️ `passenger` | Books trips, pays, tracks journeys, reads community posts |
| 🚌 `driver` | Streams live GPS location, views assigned trips |
| 🚦 `traffic_authority` | Publishes traffic announcements |
| 🔧 `garage_manager` | Manages garage service listings |
| ⛽ `fuel_station_manager` | Manages fuel station info |
| 👑 `system_admin` | Full platform control, user management, analytics |

---

## 🏗️ Architecture

```
┌──────────────────────┐          ┌────────────────────────┐
│  Vercel (Frontend)   │  HTTPS   │   Render (Backend API) │
│  React + TypeScript  │─────────►│  Node.js + Express     │
│  Tailwind + Shadcn   │          │  Socket.IO (WebSockets)│
└──────────────────────┘          └──────────┬─────────────┘
                                             │
                         ┌───────────────────┼──────────────────┐
                         │                   │                  │
                  ┌──────▼──────┐   ┌────────▼──────┐  ┌───────▼──────┐
                  │    Neon     │   │   Upstash     │  │    Gmail     │
                  │ PostgreSQL  │   │    Redis      │  │  OTP Emails  │
                  │  v3.1 Schema│   │  Seat Locking │  │  Nodemailer  │
                  └─────────────┘   └───────────────┘  └──────────────┘
```

**Request flow (login example):**

```
Browser (Vercel)
    │
    ▼  POST https://<RENDER-DOMAIN>/api/v1/auth/login
Render Express
    │
    ├─▶ Neon PostgreSQL (verify user, check lockout)
    ├─▶ Generate OTP + persist hashed OTP
    └─▶ Gmail SMTP (send OTP email)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | SPA with type safety |
| | Tailwind CSS + Shadcn UI | Design system |
| | Framer Motion | Animations |
| | React Router v7 | Client-side routing |
| **Backend** | Node.js + Express.js | REST API |
| | Socket.IO | Real-time GPS |
| | Nodemailer + Gmail | Email OTP |
| | JWT + Bcrypt | Auth & security |
| **Database** | PostgreSQL (Neon) | Primary data store |
| | Redis (Upstash) | Seat locking & cache |
| **DevOps** | Render | Backend hosting + WebSockets |
| | Vercel | Frontend + CDN |
| | GitHub Actions | CI/CD (optional) |

---

## 🗂️ Folder Structure

```
smartTransport/
├── 🎨 frontend/
│   └── src/
│       ├── features/          # auth, trip, booking, post, service…
│       ├── pages/             # Route-level pages
│       │   └── admin/         # Admin-only pages
│       ├── providers/         # AuthProvider
│       ├── routes/            # MainLayout, Navbar, ProtectedRoute
│       └── shared/            # UI components + API service
│
├── ⚙️ backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/          # OTP, JWT, forgot-password
│       │   ├── booking/       # Seat reservation state machine
│       │   ├── trip/          # CRUD + seat management
│       │   ├── payment/       # Gateway + webhooks
│       │   ├── post/          # Community + likes
│       │   ├── service/       # Nearby services
│       │   ├── tracking/      # Socket.IO GPS
│       │   ├── admin/         # Metrics, users, bookings
│       │   └── audit/         # Immutable audit log
│       ├── infrastructure/    # DB, Redis, Socket.IO
│       └── shared/            # Middleware, email, utilities
│
├── 🚀 deployment/             # SQL migrations + config templates
├── 🗄️ TMSDB.sql               # PostgreSQL schema v3.1
├── ⚙️  render.yaml            # Render blueprint (also in deployment/)
└── 📖 README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20+ |
| PostgreSQL | v14+ |
| Redis | v6+ |
| Git | Latest |

### 1. Clone

```bash
git clone https://github.com/Alemu-chamada/smartTransport.git
cd smartTransport
```

### 2. Database

```bash
createdb TMSDB
psql -d TMSDB -f TMSDB.sql

# Run migrations (Neon or local)
psql -d TMSDB -f deployment/fix-trips-nullable-columns.sql
psql -d TMSDB -f deployment/add-likes-and-services-columns.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in your values (see Environment Variables below)
npm install
npm run dev      # http://localhost:5002
```

**Health check:** `GET http://localhost:5002/api/v1/health`

### 4. Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5002/api/v1" > .env
npm run dev      # http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env` or Render Dashboard)

```env
NODE_ENV=production
# Render auto-sets PORT; app defaults to 5002. Do NOT hardcode on Render.

# Database (Neon) — PREFER THIS SINGLE CONNECTION STRING
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Individual PostgreSQL vars (use ONLY if NOT using DATABASE_URL)
# PGHOST=your-neon-host.neon.tech
# PGPORT=5432
# PGDATABASE=neondb
# PGUSER=neondb_owner
# PGPASSWORD=your-neon-password

# Redis (Upstash) — MUST use rediss:// TLS URL in production
REDIS_URL=rediss://default:token@host.upstash.io:6379

# Auth (generate securely — minimum 32 chars each)
JWT_SECRET=long-random-string-min-32-chars
JWT_REFRESH_SECRET=another-long-random-string
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=session-random-string

# Email OTP (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# CORS — production Vercel domain
FRONTEND_URL=https://smart-transport.cyan.vercel.app
ALLOWED_ORIGINS=https://smart-transport.cyan.vercel.app

# Misc
OTP_EXPIRES_IN_MINUTES=5
BOOKING_RESERVATION_MINUTES=15
PAYMENT_WEBHOOK_SECRET=webhook-secret
PAYMENT_SESSION_BASE_URL=https://payments.example.test/checkout
```

### Frontend (`frontend/.env` or Vercel Dashboard)

```env
# Backend API — must end with /api/v1, do NOT include /auth/login
# Development: http://localhost:5002/api/v1
# Production:  https://<RENDER-BACKEND-DOMAIN>/api/v1
VITE_API_URL=https://<RENDER-BACKEND-DOMAIN>/api/v1
```

> **Important for Vercel:** Vite embeds `VITE_API_URL` into the build output. After changing it in the Vercel dashboard, **you must trigger a new production deployment** for the change to take effect.

---

## ☁️ Deployment

### 1. Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy the pooled **Connection string** from the dashboard
3. Apply the schema:
   ```bash
   psql "postgresql://user:pass@host:5432/db?sslmode=require" -f TMSDB.sql
   psql "postgresql://..." -f deployment/fix-trips-nullable-columns.sql
   psql "postgresql://..." -f deployment/add-likes-and-services-columns.sql
   ```
4. In **Render**, set env var: `DATABASE_URL=<neon-pooled-connection-string>`

### 2. Upstash Redis

1. Go to [upstash.com](https://upstash.com) and create a Redis database
2. Copy the **TLS (rediss://)** connection string (not the plain redis:// one)
3. In **Render**, set env var: `REDIS_URL=<upstash-tls-url>`

### 3. Render Backend

There are two options:

**Option A — Render Blueprint (easiest, uses `render.yaml` at repo root):**
1. Go to <https://dashboard.render.com>
2. Click **New +** → **Blueprint**
3. Connect the `smartTransport` GitHub repository
4. Render detects `render.yaml` automatically. Fill in the **secret** variables:
   - `DATABASE_URL` (Neon pooled string)
   - `REDIS_URL` (Upstash TLS `rediss://…`)
   - `EMAIL_PASS` (Gmail App Password — see note below)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET`, `PAYMENT_WEBHOOK_SECRET` (Render auto-generates these if `generateValue: true`)
5. Click **Apply**

**Option B — Manual Web Service:**
1. Go to <https://dashboard.render.com> → **New +** → **Web Service**
2. Connect the GitHub repository
3. Settings:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Health Check Path** | `/api/v1/health` |
   | **Plan** | Starter (Standard for production) |
4. In the **Environment** tab, add every variable from the backend env section (or use the [render.yaml blueprint](deployment/render.yaml))

**After Render deploys:**
- Note the backend URL, e.g. `https://smarttransport.onrender.com`
- Verify: `curl https://smarttransport.onrender.com/api/v1/health` → JSON 200
- Use this domain to set `VITE_API_URL` on Vercel (see below)

### 4. Vercel Frontend

1. Go to <https://vercel.com/new>
2. Import the `smartTransport` repo
3. **Configure Project:**
   | Field | Value |
   |-------|-------|
   | Framework Preset | Vite |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
4. In **Project → Settings → Environment Variables**, add:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://<YOUR-RENDER-BACKEND-DOMAIN>/api/v1` |
   ⚠️ **Important:** Do **NOT** set `VITE_API_URL` to the Vercel frontend URL, and do **NOT** append `/auth/login`. It must be the Render backend domain ending with `/api/v1`.
5. Trigger a **production deployment** (Redeploy) so Vite bakes the new env var into the bundle.

### 5. CORS Validation

The backend already allows:
- Explicit origin matches via `ALLOWED_ORIGINS` / `FRONTEND_URL`
- Any Vercel preview deployment (`https://*.vercel.app`) — useful for pull-request previews
- `localhost` in development

For the production Vercel deployment to pass CORS, confirm that in the Render dashboard:
```
FRONTEND_URL   = https://smart-transport.cyan.vercel.app
ALLOWED_ORIGINS= https://smart-transport.cyan.vercel.app
```
(Socket.IO uses the same origin allowlist.)

### 6. Environment Variable Cheat Sheet

#### Backend (Render)

| Variable | Required | Get it from | Notes |
|----------|----------|-------------|-------|
| `NODE_ENV` | ✅ | Hardcode `production` | |
| `PORT` | ❌ | Render auto-sets | App defaults to 5002 |
| `DATABASE_URL` | ✅/🔀 | Neon dashboard | Preferred. Either this **or** the 5 PG* vars below |
| `PGHOST` / `PGPORT` / `PGDATABASE` / `PGUSER` / `PGPASSWORD` | 🔀 | Neon dashboard | Use only if **not** using `DATABASE_URL` |
| `REDIS_URL` | ✅ | Upstash dashboard | Use `rediss://` TLS URL, NOT `redis://` |
| `JWT_SECRET` | ✅ | Render `generateValue` or `crypto.randomBytes(64)` | Min 32 chars |
| `JWT_REFRESH_SECRET` | ✅ | Same | Different from JWT_SECRET |
| `JWT_EXPIRES_IN` | ❌ | `1h` (default) | |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `7d` (default) | |
| `SESSION_SECRET` | ✅ | Render `generateValue` | |
| `EMAIL_USER` | ✅ | Gmail address | e.g. `smartTransportserv@gmail.com` |
| `EMAIL_PASS` | ✅ | Google Account → Security → 2SV → **App Passwords** (16 chars, spaces removed) | NOT your real Gmail password |
| `FRONTEND_URL` | ✅ | `https://smart-transport.cyan.vercel.app` | |
| `ALLOWED_ORIGINS` | ✅ | Same as FRONTEND_URL for single-origin | Comma-separated if multiple |
| `OTP_EXPIRES_IN_MINUTES` | ❌ | Default `5` | |
| `BOOKING_RESERVATION_MINUTES` | ❌ | Default `15` | |
| `PAYMENT_WEBHOOK_SECRET` | ✅ (used in HMAC) | Render generateValue | Even for mock provider |
| `PAYMENT_SESSION_BASE_URL` | ❌ | Default mock URL | |

#### Frontend (Vercel)

| Variable | Required | Value |
|----------|----------|-------|
| `VITE_API_URL` | ✅ | `https://<RENDER-BACKEND-DOMAIN>/api/v1` |

### 7. Redeployment Triggers

- **Render backend:** Re-deployed automatically on each `git push` to your default branch. Environment variable changes also trigger a redeploy.
- **Vercel frontend:** Re-deployed automatically on push. **Environment variable changes do NOT retroactively change an existing build** — you must click **Redeploy** after saving env vars, because Vite embeds `VITE_*` variables at build time.

### 8. Health Check

Render pings the backend at `/api/v1/health`. The endpoint returns:
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": { "redis": "connected", "postgres": "connected" }
}
```
This endpoint does **not** require JWT, DB auth, or OTP. It is intentionally lightweight. (If Render shows the service as "Degraded", first check that you have no trailing spaces in `healthCheckPath`.)

### 9. Production Smoke Test

After both deployments are green:
1. `GET https://<RENDER>/api/v1/health` → 200 JSON
2. Open the Vercel frontend → DevTools → Network tab
3. Try to **log in**. The network tab should show:
   ```
   POST https://<RENDER>/api/v1/auth/login → 200/201 JSON
   ```
   **Not** `/auth/login` against the Vercel domain.
4. Complete OTP → you should land on the Home/Dashboard page with user profile loaded.
5. Open the **Tracking** page as a driver → verify Socket.IO connects (no CORS errors in the console).

---

## 📡 API Reference

**Base URL (Render):** `https://<RENDER-BACKEND-DOMAIN>/api/v1`
**Local:** `http://localhost:5002/api/v1`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register (email + phone required) |
| `POST` | `/auth/login` | Login → sends OTP |
| `POST` | `/auth/verify-otp` | Verify OTP → returns JWT |
| `POST` | `/auth/resend-otp` | Resend OTP |
| `POST` | `/auth/forgot-password` | Send password reset OTP |
| `POST` | `/auth/reset-password` | Reset with OTP |
| `GET`  | `/auth/me` | Get current user |
| `POST` | `/auth/logout` | Logout |

### Trips
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/trips/scheduled` | ✅ |
| `GET` | `/trips/nearby` | ✅ |
| `POST` | `/trips` | 👑 Admin |
| `PATCH` | `/trips/:id` | 👑 Admin |
| `DELETE` | `/trips/:id` | 👑 Admin |

### Community
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/posts` | ✅ |
| `POST` | `/posts` | 🚦 Auth |
| `POST` | `/posts/:id/like` | ✅ |
| `POST` | `/posts/:id/comments` | ✅ |
| `POST` | `/posts/:id/comments/:cid/like` | ✅ |

### Admin
| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/admin/users` | 👑 |
| `GET` | `/admin/bookings` | 👑 |
| `GET` | `/admin/metrics` | 👑 |
| `GET` | `/admin/audit-logs` | 👑 |
| `GET` | `/admin/health` | 👑 |

### Health (unauthenticated)
| Method | Endpoint |
|---|---|
| `GET` | `/health` |
| `GET` | `/api/v1/health` |

---

## 🩺 Production Troubleshooting

### Symptom

Frontend login fails. In the browser console / Network tab you see:
```
POST https://smart-transport.cyan.vercel.app/auth/login  404 (Not Found)
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### Root Cause

The error `"<!DOCTYPE "... is not valid JSON` always means the **frontend received an HTML 404 (or 5xx) error page** when it expected a JSON API response. For this specific project it almost always means `VITE_API_URL` on Vercel is **wrong, empty, or stale** — so the frontend is requesting `/auth/login` **from the Vercel domain itself** (which serves the SPA's `index.html` for every unknown route — hence the HTML `<DOCTYPE>`).

### Expected vs. Actual

Correct request you should see in DevTools → Network:
```
POST https://<RENDER-BACKEND-DOMAIN>/api/v1/auth/login    200 OK  application/json
```

Typical broken requests seen in the wild:
| ❌ Broken Request | Why it's broken |
|---|---|
| `POST https://smart-transport.cyan.vercel.app/auth/login` | `VITE_API_URL` is empty/unset → relative URL hits the Vercel frontend |
| `POST https://smart-transport.cyan.vercel.app/api/v1/auth/login` | `VITE_API_URL` accidentally set to the Vercel frontend URL |
| `POST https://old-render-domain.onrender.com/.../auth/login` | `VITE_API_URL` still points at old/stale Render deployment (update to `https://smarttransport.onrender.com/api/v1`) |
| `POST https://<render>/auth/login` (missing `/api/v1`) | `VITE_API_URL` value is missing the `/api/v1` suffix |

### Fix Checklist — 7 things to verify

1. **`VITE_API_URL` on Vercel**
   Go to **Vercel Dashboard → Project → Settings → Environment Variables**.
   Confirm a Production entry exists:
   ```
   KEY   = VITE_API_URL
   VALUE = https://<YOUR-RENDER-BACKEND-DOMAIN>/api/v1
   ```
   The value must:
   - Use `https://`
   - Be the **Render** backend domain (not `smart-transport.cyan.vercel.app`)
   - End with `/api/v1` (no trailing slash after `v1`)
   - **Not** contain `/auth/login`

2. **Redeploy Vercel after changing the env var**
   Saving `VITE_API_URL` alone does nothing to the running build — Vite inlines it at build time.
   Go to **Vercel → Deployments → ⋯ → Redeploy** on the latest production deployment. Wait for it to finish, then hard-refresh the browser (Ctrl+Shift+R).

3. **Render backend URL is reachable**
   From your own terminal, run:
   ```bash
   curl -i https://<YOUR-RENDER-BACKEND-DOMAIN>/api/v1/health
   ```
   Expected: `HTTP/2 200` with JSON body. If you get a 404 / 500 / connection refused:
   - Check the Render service is not "Suspended" (free plans sleep)
   - Check `Health Check Path` in Render is exactly `/api/v1/health`
   - Open Render → Logs for startup errors (missing env vars, etc.)

4. **`/api/v1` prefix**
   The Express app mounts **everything** under `/api/v1` (see `backend/src/app.js:90`):
   ```js
   app.use("/api/v1", routes);
   ```
   And `routes` mounts auth under `/auth`. So the login endpoint is:
   ```
   /api/v1  +  /auth  +  /login  =  /api/v1/auth/login
   ```
   If `VITE_API_URL` does **not** end with `/api/v1`, you will get a 404 from Render.

5. **CORS**
   If the browser shows a CORS error instead of a 404, confirm that the Render env vars match the Vercel domain exactly (no trailing slash, correct `https://`):
   ```
   FRONTEND_URL   = https://smart-transport.cyan.vercel.app
   ALLOWED_ORIGINS= https://smart-transport.cyan.vercel.app
   ```
   Then redeploy Render (or wait for Render to auto-redeploy after saving env vars).

6. **Render env vars actually applied**
   After changing Render env vars, verify the service redeployed (Render → Events tab). Then check Render → Logs for the startup banner — it includes explicit warnings if `FRONTEND_URL`, `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, or `EMAIL_*` are missing/unsafe.

7. **Socket.IO (Tracking page)**
   The Tracking page strips the `/api/v1` suffix from `VITE_API_URL` to build the Socket.IO endpoint. So `VITE_API_URL=https://<render>.onrender.com/api/v1` correctly derives the socket connection to `https://<render>.onrender.com`. If tracking fails but login works, check:
   - Socket CORS uses the same `ALLOWED_ORIGINS` list (yes, already configured)
   - Render supports WebSockets on the paid plan (Starter+ — WebSockets on free plan are unreliable)

---

## 🔒 Security

```
✅ JWT stateless auth with refresh tokens
✅ Email OTP on every login (Gmail SMTP via Nodemailer)
✅ Forgot password / reset via OTP
✅ Bcrypt password hashing — work factor 12
✅ Account lockout after 5 failed attempts
✅ Role-based access — server + client enforced
✅ Rate limiting on auth, booking, payment endpoints
✅ Helmet.js HTTP security headers
✅ CORS — strict origin allowlist + Vercel preview wildcard
✅ Parameterised SQL — no injection risk
✅ Immutable audit log for all sensitive actions
✅ Redis seat locking — prevents double-booking
✅ Mandatory email + phone on registration
```

---

## 🗄️ Database Schema

Key tables in the PostgreSQL v3.1 schema:

| Table | Purpose |
|---|---|
| `users` | Accounts, roles, lockout tracking |
| `otp_codes` | Hashed OTP audit trail |
| `trips` | Full lifecycle with status machine |
| `bookings` | State machine: reserved → confirmed |
| `payments` | Webhook-verified payment records |
| `posts` / `comments` | Community feed |
| `post_likes` / `comment_likes` | DB-persisted likes |
| `services` | Garages, fuel stations, hotels |
| `audit_logs` | Immutable action trail |
| `notifications` | Event-driven notification delivery |

---

## 🔮 Future Improvements

- [ ] Real payment gateway (Chapa / Stripe)
- [ ] Interactive map (Leaflet/Google Maps) for live tracking
- [ ] Push notifications (FCM)
- [ ] Multi-language support (i18n)
- [ ] Driver earnings dashboard
- [ ] Route optimization with traffic data
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Automated testing (Jest + Playwright)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

<div align="center">

**Alemu Chamada**
*Computer Science & Engineering · ASTU*

[![Email](https://img.shields.io/badge/📧-alemuchamada@gmail.com-FF4103?style=flat-square)](mailto:alemuchamada@gmail.com)
[![GitHub](https://img.shields.io/badge/🐙-Alemu--chamada-181717?style=flat-square&logo=github)](https://github.com/Alemu-chamada)
[![LinkedIn](https://img.shields.io/badge/💼-Alemu%20Chamada-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/alemu-chamada)
[![Phone](https://img.shields.io/badge/📞-+251%2095%20604%207594-001621?style=flat-square)](tel:+251956047594)

*System contact: [smarttransportserv@gmail.com](mailto:smarttransportserv@gmail.com)*

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**🚌 Connecting people. Simplifying journeys. Building smarter transportation every day.**

*Made with ❤️ by Alemu Chamada · ASTU · 2026*

⭐ **Star this repo if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/Alemu-chamada/smartTransport?style=social)](https://github.com/Alemu-chamada/smartTransport)

</div>
