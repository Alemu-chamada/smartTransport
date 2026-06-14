# 🚐 Transport Management System (TMS)

A full-featured transport management system with real-time tracking, booking, payment, and community features.

---

## ✨ Features

### 🎯 Core Features
- **Trip Discovery & Booking**: Search for trips, select seats, book seats with real-time availability
- **Payment Integration**: Secure payment processing with webhook support
- **Real-time Tracking**: Live trip tracking via WebSockets
- **Community Platform**: Posts and comments for announcements and updates
- **Profile Management**: User profiles with role-based data
- **Notifications**: Real-time notifications for bookings, trips, and payments
- **Audit Logs**: Full audit trail of all system actions

### 👥 User Roles
- **Passenger**: Book trips, manage bookings, view tracking
- **Driver**: Manage assigned trips, update trip status
- **Traffic Authority**: Create posts and announcements
- **Garage Manager**: Manage buses and garages
- **Fuel Station Manager**: Manage fuel stations
- **System Admin**: Full access to all features and management

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**
- **PostgreSQL** (Database)
- **Redis** (Caching & Session Management)
- **Socket.IO** (Real-time tracking)

### Frontend
- **React 18** with **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling)
- **React Router** (Navigation)
- **Shadcn UI** (Components)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- Redis (v7 or later)

---

### Installation

#### 1. Clone the repository
```bash
git clone (https://github.com/Alemu-chamada/Transportation-Management-System)
cd tms
```

#### 2. Backend Setup
```bash
cd backend

# Copy environment file and update with your credentials
cp .env.example .env

# Install dependencies
npm install

# Run the application
npm run start
```

Backend will run on http://localhost:5002

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend will run on http://localhost:5173 (or next available port)

---

## 🗄️ Database Setup

### Import Database Schema
Run the `TMSDB.sql` file in your PostgreSQL database to create all tables, enums, triggers, and functions.

### Apply Admin User Fix
Use the `apply-database-fixes.js` script to ensure the system admin user has correct permissions:
```bash
cd backend
node apply-database-fixes.js
```

---

## 📁 Project Structure

```
tms/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & configuration
│   │   ├── infrastructure/  # Database, Redis, Socket.io
│   │   ├── modules/         # Feature modules
│   │   ├── jobs/            # Background jobs
│   │   └── shared/          # Middleware, utils, errors
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/        # Feature modules (api services)
│   │   ├── pages/           # Page components
│   │   ├── providers/       # React providers
│   │   ├── shared/          # Reusable UI components, services
│   │   └── styles/          # Global styles & themes
│   └── package.json
├── TMSDB.sql                # Database schema
└── TMS project plan.pdf     # Project documentation
```

---

## 📋 API Endpoints

| Feature          | Base Route          |
|------------------|---------------------|
| Authentication   | `/api/v1/auth`      |
| Users            | `/api/v1/users`     |
| Profiles         | `/api/v1/profile`   |
| Trips            | `/api/v1/trips`     |
| Bookings         | `/api/v1/bookings`  |
| Payments         | `/api/v1/payments`  |
| Notifications    | `/api/v1/notifications` |
| Posts            | `/api/v1/posts`     |
| Tracking         | `/api/v1/tracking`  |
| Admin            | `/api/v1/admin`     |

---

## 🎨 Customization

### Theme Customization
The theme is defined in `frontend/src/styles/theme.css`. You can customize:
- Colors (light/dark modes)
- Border radius
- Font sizes
- Spacing

### Environment Variables
Check `backend/.env.example` for all backend environment configuration.

---

## 📝 Notes

### Database
The project uses PostgreSQL with custom enums, triggers, and functions. All database schema is defined in `TMSDB.sql`.

### Audit Logging
All important actions are logged to the `audit_logs` table for full traceability.

---

## 📄 License(MIT)

This project is licensed under the MIT License.
 
---

## 👨‍💻 Author

Prepared by Alemu Chamada

Computer Science and Engineering (ASTU)
