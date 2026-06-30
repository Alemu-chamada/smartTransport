<div align="center">

<br/>

<img src="https://img.shields.io/badge/🚌-SmartTransport-FF4103?style=for-the-badge&labelColor=001621&color=FF4103" alt="SmartTransport"/>

# SmartTransport Management System

### *Digitalising public & private transportation — end to end.*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-smart--transport.cyan.vercel.app-FF4103?style=flat-square&logo=vercel&logoColor=white)](https://smart-transport.cyan.vercel.app)
[![API](https://img.shields.io/badge/⚙️%20Backend%20API-Railway-7B2FBE?style=flat-square&logo=railway&logoColor=white)](https://smarttransport-production.up.railway.app/api/v1/health)
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
| ⚙️ Backend API | [smarttransport-production.up.railway.app](https://smarttransport-production.up.railway.app/api/v1/health) | ![Railway](https://img.shields.io/badge/deployed-brightgreen?style=flat-square) |
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
│  Vercel (Frontend)   │  HTTPS   │  Railway (Backend API) │
│  React + TypeScript  │─────────►│  Node.js + Express     │
│  Tailwind + Shadcn   │          │  Socket.IO             │
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
| **DevOps** | Railway | Backend hosting |
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

### 4. Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5002/api/v1" > .env
npm run dev      # http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=5002

# Database (Neon)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
PGHOST=your-neon-host.neon.tech
PGPORT=5432
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=your-neon-password

# Redis (Upstash)
REDIS_URL=rediss://default:token@host.upstash.io:6379

# Auth
JWT_SECRET=long-random-string-min-32-chars
JWT_REFRESH_SECRET=another-long-random-string
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=session-random-string

# Email OTP (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# CORS
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app

# Misc
OTP_EXPIRES_IN_MINUTES=5
BOOKING_RESERVATION_MINUTES=15
PAYMENT_WEBHOOK_SECRET=webhook-secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

---

## ☁️ Deployment

```bash
# Backend → Railway
# Set all env vars in Railway dashboard > Variables
# Build: npm install   Start: npm start

# Frontend → Vercel
# Root: frontend/   Framework: Vite
# Env var: VITE_API_URL=https://your-railway-url/api/v1

# Database → Neon
psql "postgresql://..." -f TMSDB.sql
psql "postgresql://..." -f deployment/fix-trips-nullable-columns.sql
psql "postgresql://..." -f deployment/add-likes-and-services-columns.sql
```

See [`deployment/DEPLOYMENT_GUIDE.md`](deployment/DEPLOYMENT_GUIDE.md) for full step-by-step instructions.

---

## 📡 API Reference

**Base URL:** `https://smarttransport-production.up.railway.app/api/v1`

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
✅ CORS — strict origin allowlist
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
