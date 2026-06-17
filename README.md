# Smart Transportation Management System

A full-stack, role-based web application for managing transportation operations — from trip scheduling and passenger booking through real-time vehicle tracking and payment processing.

**Live Demo:** [smart-transport-19ii-sage.vercel.app](https://smart-transport-19ii-sage.vercel.app)  
**Backend API:** [smarttransport-production.up.railway.app](https://smarttransport-production.up.railway.app)

---

## Overview

The Smart Transportation Management System (TMS) digitalises and streamlines public and private transportation workflows. It supports six distinct user roles, each with precisely scoped access, and covers the complete journey lifecycle — booking, payment, tracking, notifications, and post-trip reporting.

---

## Features

| Feature | Description |
|---|---|
| **OTP Authentication** | Email-based two-factor login via Brevo API. Account lockout after failed attempts. |
| **Role-Based Access Control** | Six roles with server-enforced and client-enforced permissions. |
| **Trip Booking** | Real-time seat selection, booking state machine, 15-minute reservation hold. |
| **Secure Payments** | Payment gateway integration with webhook verification and audit trail. |
| **Live Vehicle Tracking** | Socket.IO GPS updates visible to passengers and admins. |
| **Community Posts** | Traffic authorities publish announcements; users comment. |
| **Nearby Services** | Integrated locator for garages and fuel stations. |
| **Admin Dashboard** | User management, role assignment, audit logs, system health. |
| **Notifications** | Event-driven alerts for bookings, payments, profile updates, and system events. |
| **Driver & Fleet Management** | Driver onboarding, profile verification workflow, vehicle assignment. |

---

## User Roles

| Role | Description |
|---|---|
| `passenger` | Default role. Books trips, makes payments, tracks journeys. |
| `driver` | Drives trips, updates live location. Requires admin verification. |
| `traffic_authority` | Publishes traffic posts and announcements. |
| `garage_manager` | Manages garage service listings. |
| `fuel_station_manager` | Manages fuel station service listings. |
| `system_admin` | Full platform access — users, trips, bookings, payments, audit logs. |

All new registrations default to `passenger`. Admins promote users to other roles.

---

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** — build tool
- **Tailwind CSS** + shadcn/ui — styling and components
- **Framer Motion** — animations
- **React Router v6** — routing with role-based guards
- **Socket.IO Client** — live tracking

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (Neon serverless) — primary database
- **Redis** (Upstash) — session caching, rate limiting
- **Socket.IO** — real-time WebSocket server
- **JWT** — stateless authentication
- **Brevo API** — transactional email (OTP delivery)
- **Bull** — background job queues (booking expiry, payment retry)

### Infrastructure
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Neon PostgreSQL
- **Redis:** Upstash

---

## Project Structure

```
Transportation-Management-System/
├── frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── features/          # Feature modules (auth, trip, booking, etc.)
│   │   ├── pages/             # Route-level page components
│   │   │   └── admin/         # Admin-only pages
│   │   ├── providers/         # AuthProvider — global auth state
│   │   ├── routes/            # Layouts, ProtectedRoute, Navbar
│   │   └── shared/            # Reusable UI components and services
│   ├── index.html
│   └── vite.config.ts
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── modules/           # Feature modules (auth, trip, booking, admin, etc.)
│   │   │   ├── auth/
│   │   │   ├── trip/
│   │   │   ├── booking/
│   │   │   ├── payment/
│   │   │   ├── tracking/
│   │   │   ├── post/
│   │   │   ├── notification/
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   ├── profile/
│   │   │   ├── service/
│   │   │   └── audit/
│   │   ├── infrastructure/    # Database, Redis, Socket.IO
│   │   ├── shared/            # Middleware, utilities, error handling
│   │   ├── jobs/              # Background jobs (booking expiry, payment retry)
│   │   ├── config/            # Environment config
│   │   └── app.js / server.js
│   └── package.json
│
├── deployment/                # Production config templates and scripts
│   ├── .env.backend.production.template
│   ├── .env.frontend.production.template
│   ├── vercel.json
│   ├── neon-database-setup.sql
│   ├── database-validation.sql
│   ├── generate-secrets.js
│   ├── health-check.js
│   └── backup-database.sh
│
└── TMSDB.sql                  # Full PostgreSQL schema (v3.1)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or a Neon account)
- Redis (or an Upstash account)

### 1. Clone the repository

```bash
git clone https://github.com/Alemu-chamada/Transportation-Management-System.git
cd Transportation-Management-System
```

### 2. Set up the database

```bash
psql -U postgres -d your_database -f TMSDB.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials, JWT secret, and Brevo API key
```

Required variables:

```env
NODE_ENV=development
PORT=5002
PGHOST=localhost
PGPORT=5432
PGDATABASE=your_db
PGUSER=your_user
PGPASSWORD=your_password
JWT_SECRET=your_jwt_secret
OTP_EXPIRES_IN_MINUTES=10
BREVO_API_KEY=your_brevo_api_key
```

### 4. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 5. Configure and start the frontend

```bash
cd frontend
npm install
# Create .env with:
# VITE_API_URL=http://localhost:5002/api/v1
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

The application is deployed across three platforms:

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | [smart-transport-19ii-sage.vercel.app](https://smart-transport-19ii-sage.vercel.app) |
| Backend API | Railway | [smarttransport-production.up.railway.app](https://smarttransport-production.up.railway.app) |
| Database | Neon PostgreSQL | `ep-royal-voice-ad02cekj-pooler.c-2.us-east-1.aws.neon.tech` |
| Redis | Upstash | Configured via `REDIS_URL` |

Production environment templates are in `deployment/`.

---

## API Overview

Base URL: `/api/v1`

| Prefix | Description |
|---|---|
| `/auth` | Register, login, OTP verify, resend OTP, logout |
| `/trips` | List, create, and fetch trips |
| `/bookings` | Create and manage bookings |
| `/payment` | Payment sessions and webhooks |
| `/tracking` | Live location updates |
| `/posts` | Community posts and comments |
| `/notifications` | User notifications |
| `/services` | Nearby garages and fuel stations |
| `/profile` | User profile management |
| `/admin` | Admin-only — users, buses, drivers, metrics, audit logs |

---

## Database Schema

The full PostgreSQL schema is in `TMSDB.sql` (v3.1). Key tables:

- `users` — all accounts with role, lockout, and audit fields
- `otp_codes` — permanent OTP audit trail
- `trips` — full trip lifecycle with status machine
- `bookings` — booking state machine with 15-min reservation hold
- `payments` — payment records with webhook verification
- `posts` / `comments` — community feed
- `notifications` — event-driven notification delivery tracking
- `role_profiles` — per-role profile completion wizard
- `services` — garage and fuel station locations
- `audit_logs` — immutable action audit trail

---

## Author

**Alemu Chamada**  
Email: [alemuchamada@gmail.com](mailto:alemuchamada@gmail.com)  
Phone: +251 95 604 7594  
GitHub: [github.com/Alemu-chamada](https://github.com/Alemu-chamada)  
System Email: [smarttransportserv@gmail.com](mailto:smarttransportserv@gmail.com)

---

## License

This project is licensed under the terms of the [LICENSE](./LICENSE) file.
