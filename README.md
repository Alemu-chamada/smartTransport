<div align="center">

# 🚌 Smart Transportation Management System

**A modern, full-stack platform for managing transportation operations — from booking to real-time tracking.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://smart-transport-19ii-sage.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️_Backend_API-Railway-blueviolet?style=for-the-badge)](https://smarttransport-production.up.railway.app)
[![License](https://img.shields.io/badge/📄_License-MIT-green?style=for-the-badge)](./LICENSE)

<br/>

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚌  →  🗺️  →  💳  →  📍  →  ✅                        ║
║                                                           ║
║   Book Trip   Route   Pay   Track   Arrive                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

</div>

---

## 📖 Overview

The **Smart Transportation Management System (TMS)** digitalises and streamlines public and private transportation workflows. It supports **six distinct user roles**, each with precisely scoped access, and covers the complete journey lifecycle — booking, payment, real-time tracking, notifications, and reporting.

> Built as a final-year academic project demonstrating full-stack software engineering, role-based security, real-time systems, and cloud deployment.

---

## ✨ Features

```
┌─────────────────────────────────────────────────────────────┐
│  🔐 Auth    │  📍 Tracking  │  🎫 Booking  │  💳 Payments  │
│  🧑‍💼 Roles  │  📢 Posts     │  🔔 Alerts   │  📊 Analytics │
└─────────────────────────────────────────────────────────────┘
```

| # | Feature | Description |
|---|---|---|
| 🔐 | **OTP Authentication** | Email-based two-factor login via Brevo API. Account lockout after failed attempts. JWT sessions. |
| 👥 | **Role-Based Access Control** | Six roles with server-enforced and client-enforced permissions throughout. |
| 🎫 | **Trip Booking** | Real-time seat selection, booking state machine, 15-minute reservation hold. |
| 💳 | **Secure Payments** | Payment gateway integration with webhook verification and full audit trail. |
| 📍 | **Live Vehicle Tracking** | Socket.IO GPS updates visible to passengers and admins in real time. |
| 📢 | **Community Posts** | Traffic authorities publish announcements; all users can comment. |
| 🗺️ | **Nearby Services** | Integrated locator for garages and fuel stations. |
| 🛠️ | **Admin Dashboard** | User management, role assignment, bus/driver management, audit logs, system health. |
| 🔔 | **Smart Notifications** | Event-driven alerts for bookings, payments, profile updates, and system events. |
| 🚗 | **Driver & Fleet Management** | Driver onboarding, profile verification workflow, vehicle assignment. |

---

## 👤 User Roles

```
                      ┌─────────────────┐
                      │  system_admin   │  ← Full access
                      └────────┬────────┘
           ┌──────────────────┼──────────────────┐
    ┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼──────────────┐
    │   driver    │   │  traffic_    │   │  garage_manager /   │
    │             │   │  authority   │   │  fuel_station_mgr   │
    └──────┬──────┘   └───────┬──────┘   └──────┬──────────────┘
           └──────────────────┼──────────────────┘
                      ┌───────▼──────┐
                      │  passenger  │  ← Default on signup
                      └─────────────┘
```

| Role | Description |
|---|---|
| `🧑‍✈️ passenger` | Default role. Books trips, pays, tracks journeys. |
| `🚌 driver` | Drives trips, updates live GPS location. Requires admin verification. |
| `🚦 traffic_authority` | Publishes traffic posts and announcements. |
| `🔧 garage_manager` | Manages garage service listings. |
| `⛽ fuel_station_manager` | Manages fuel station service listings. |
| `👑 system_admin` | Full platform access — users, trips, bookings, payments, audit logs. |

> All new registrations default to `passenger`. Admins promote users to specialised roles.

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)

### Cloud
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)
![Neon](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=flat&logo=postgresql&logoColor=black)

</div>

---

## 🗂️ Project Structure

```
📦 Transportation-Management-System/
│
├── 🎨 frontend/                    React + TypeScript SPA
│   └── src/
│       ├── features/               Feature modules (auth, trip, booking…)
│       ├── pages/                  Route-level pages
│       │   └── admin/              Admin-only pages
│       ├── providers/              AuthProvider — global auth state
│       ├── routes/                 Layouts, ProtectedRoute, Navbar
│       └── shared/                 Reusable UI + API services
│
├── ⚙️  backend/                    Node.js + Express REST API
│   └── src/
│       ├── modules/                Feature modules
│       │   ├── 🔐 auth/
│       │   ├── 🚌 trip/
│       │   ├── 🎫 booking/
│       │   ├── 💳 payment/
│       │   ├── 📍 tracking/
│       │   ├── 📢 post/
│       │   ├── 🔔 notification/
│       │   ├── 👑 admin/
│       │   ├── 👤 user/
│       │   ├── 🧾 profile/
│       │   ├── 🗺️  service/
│       │   └── 📋 audit/
│       ├── infrastructure/         DB, Redis, Socket.IO
│       ├── shared/                 Middleware, utilities, error handling
│       ├── jobs/                   Background jobs (booking expiry, payment retry)
│       └── config/                 Environment configuration
│
├── 🚀 deployment/                  Production config templates
│   ├── .env.backend.production.template
│   ├── .env.frontend.production.template
│   ├── vercel.json
│   ├── neon-database-setup.sql
│   └── generate-secrets.js
│
└── 🗄️  TMSDB.sql                   Full PostgreSQL schema v3.1
```

---

## 🚀 Getting Started

### Prerequisites

```
✅ Node.js 18+
✅ PostgreSQL 15+  (or a Neon account)
✅ Redis           (or an Upstash account)
✅ Brevo account   (free — 300 emails/day)
```

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Alemu-chamada/Transportation-Management-System.git
cd Transportation-Management-System
```

### 2️⃣ Set up the database

```bash
psql -U postgres -d your_database -f TMSDB.sql
```

### 3️⃣ Configure the backend

```bash
cd backend
cp .env.example .env
# Fill in your values — see .env.example for all required fields
```

Key variables:

```env
NODE_ENV=development
PORT=5002

PGHOST=localhost
PGDATABASE=your_db
PGUSER=your_user
PGPASSWORD=your_password

JWT_SECRET=your_64_char_random_secret

BREVO_API_KEY=your_brevo_api_key
OTP_EXPIRES_IN_MINUTES=10
```

### 4️⃣ Start the backend

```bash
cd backend
npm install
npm run dev
# ✅ API running at http://localhost:5002
```

### 5️⃣ Configure and start the frontend

```bash
cd frontend
npm install
# Create frontend/.env:
# VITE_API_URL=http://localhost:5002/api/v1
npm run dev
# ✅ App running at http://localhost:5173
```

---

## ☁️ Deployment

```
┌─────────────┐     HTTPS      ┌─────────────────┐     SQL      ┌────────────────┐
│   Vercel    │ ─────────────► │    Railway      │ ────────────► │  Neon Postgres │
│  Frontend   │                │  Node.js API    │              │   Database     │
└─────────────┘                └────────┬────────┘              └────────────────┘
                                        │ Redis
                                        ▼
                                ┌───────────────┐
                                │   Upstash     │
                                │    Redis      │
                                └───────────────┘
```

| Service | Platform | URL |
|---|---|---|
| 🎨 Frontend | Vercel | [smart-transport-19ii-sage.vercel.app](https://smart-transport-19ii-sage.vercel.app) |
| ⚙️ Backend API | Railway | [smarttransport-production.up.railway.app](https://smarttransport-production.up.railway.app) |
| 🗄️ Database | Neon PostgreSQL | Serverless PostgreSQL with SSL |
| 🔴 Cache | Upstash Redis | TLS Redis via `REDIS_URL` |

Production templates are in `deployment/`.

---

## 📡 API Overview

Base URL: `/api/v1`

| Prefix | 🔒 Auth Required | Description |
|---|---|---|
| `/auth` | Partial | Register, login, OTP verify/resend, logout |
| `/trips` | Partial | List scheduled trips (public), create (admin only) |
| `/bookings` | ✅ | Create and manage seat bookings |
| `/payment` | ✅ | Payment sessions and webhook handler |
| `/tracking` | ✅ | Live GPS location via Socket.IO |
| `/posts` | ✅ | Community posts and comments |
| `/notifications` | ✅ | User notification feed |
| `/services` | ✅ | Nearby garages and fuel stations |
| `/profile` | ✅ | User profile completion wizard |
| `/admin` | ✅ 👑 | Admin only — users, buses, drivers, metrics, audit |

---

## 🗄️ Database Schema

The full PostgreSQL schema is in `TMSDB.sql` (v3.1). Key tables:

```
👤 users              — accounts, roles, lockout, audit fields
🔑 otp_codes          — permanent OTP audit trail
🚌 trips              — full lifecycle with status machine
🎫 bookings           — state machine with 15-min reservation hold
💳 payments           — records with webhook verification
📢 posts / comments   — community feed with nested replies
🔔 notifications      — event-driven delivery tracking
🧾 role_profiles      — per-role profile completion wizard
🗺️  services           — garage and fuel station locations
📋 audit_logs         — immutable action audit trail
🚍 buses              — fleet registry
```

---

## 🔐 Security Highlights

```
✅ JWT stateless auth — no server-side sessions
✅ OTP 2FA on every login — email via Brevo
✅ Bcrypt password hashing (work factor 12)
✅ Account lockout after 5 failed attempts
✅ Role-based access — server + client enforced
✅ Rate limiting on all auth endpoints
✅ Helmet.js HTTP security headers
✅ CORS — strict origin allowlist + *.vercel.app
✅ Parameterised SQL queries — no injection risk
✅ Immutable audit log for all sensitive actions
```

---

## 👨‍💻 Author

<div align="center">

### Alemu Chamada

🎓 Software Engineer | Full-Stack Developer

[![Email](https://img.shields.io/badge/📧_Email-alemuchamada@gmail.com-red?style=flat)](mailto:alemuchamada@gmail.com)
[![GitHub](https://img.shields.io/badge/🐙_GitHub-Alemu--chamada-black?style=flat)](https://github.com/Alemu-chamada)
[![Phone](https://img.shields.io/badge/📞_Phone-+251_95_604_7594-blue?style=flat)](tel:+251956047594)

**System contact:** [smarttransportserv@gmail.com](mailto:smarttransportserv@gmail.com)

</div>

---

## 📄 License

This project is licensed under the terms of the [LICENSE](./LICENSE) file.

---

<div align="center">

*Built with ❤️ by Alemu Chamada — Connecting people, simplifying journeys.*

🚌 🗺️ 💳 📍 ✅

</div>
