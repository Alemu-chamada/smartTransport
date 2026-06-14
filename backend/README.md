# TMS Backend Foundation Layer

Production-ready Node.js foundation for a Transportation Management System.

Implemented scope only:

- Auth with OTP, JWT, logout, and current user.
- User model with unique email and phone.
- RBAC for `passenger`, `driver`, and `system_admin`.
- Profile status gate for incomplete profiles.
- Admin role assignment for `driver` and `system_admin`.
- Append-only audit logging for login and role changes.
- Trip creation and public trip discovery.
- Seat reservation and booking lifecycle.

Payment, WebSocket tracking, notifications, and admin analytics are intentionally excluded.

## Setup

```bash
cp .env.example .env
npm install
docker compose up -d
npm run dev
```

The backend now uses PostgreSQL on `localhost:5000` and Redis on `localhost:6379`.

The relational schema is defined in `src/config/schema.sql` and initializes automatically when the PostgreSQL container starts.

Base URL:

```text
http://localhost:5000/api/v1
```

## Auth Examples

### Send OTP

```http
POST /api/v1/auth/send-otp
Content-Type: application/json
```

```json
{
  "email": "passenger@example.com"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresAt": "2026-06-03T10:10:00.000Z",
    "code": "123456"
  }
}
```

The `code` field is returned only outside production for development/testing.

### Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json
```

```json
{
  "email": "passenger@example.com",
  "otp": "123456",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "user_id",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "passenger@example.com",
      "role": "passenger"
    },
    "profile": {
      "id": "profile_id",
      "user": "user_id",
      "status": "INCOMPLETE"
    }
  }
}
```

Auth never accepts client-selected roles. First registration always creates `role: "passenger"`.

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer jwt-access-token
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer jwt-access-token
```

## Admin Role Assignment

Only a `system_admin` can call this route.

```http
PATCH /api/v1/admin/users/:id/role
Authorization: Bearer system-admin-jwt
Content-Type: application/json
```

```json
{
  "role": "driver"
}
```

Valid role inputs:

- `driver`
- `system_admin`

Users cannot update their own role. Every successful role change writes an append-only audit log.

## Profile Gate

Use `profileGate.middleware.js` on protected routes that require a verified profile. When a user profile is incomplete or unverified it returns:

```json
{
  "success": false,
  "message": "Profile must be verified before accessing this resource.",
  "code": "PROFILE_INCOMPLETE"
}
```

HTTP status: `403`.

## Error Codes

- `401`: unauthenticated or invalid token/OTP.
- `403`: forbidden by RBAC or profile gate.
- `422`: validation error.

## Trip Examples

### Create Trip

Only `system_admin` users can create trips.

```http
POST /api/v1/trips
Authorization: Bearer system-admin-jwt
Content-Type: application/json
```

```json
{
  "route": {
    "origin": {
      "name": "Nairobi",
      "coordinates": { "lat": -1.286389, "lng": 36.817223 }
    },
    "destination": {
      "name": "Mombasa",
      "coordinates": { "lat": -4.043477, "lng": 39.668206 }
    }
  },
  "departure_time": "2026-06-04T08:00:00.000Z",
  "price": 2500,
  "capacity": 45
}
```

Response:

```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "trip": {
      "id": "trip_id",
      "departure_time": "2026-06-04T08:00:00.000Z",
      "price": 2500,
      "capacity": 45,
      "status": "SCHEDULED"
    },
    "seats_generated": 45
  }
}
```

### Scheduled Trips

```http
GET /api/v1/trips/scheduled
```

### Nearby Trips

```http
GET /api/v1/trips/nearby?origin=Nairobi&destination=Mombasa
```

## Booking Examples

Bookings require authentication and a verified profile. New bookings always start as `RESERVED`; this layer does not confirm bookings because payment is not implemented here.

### Create Booking

```http
POST /api/v1/bookings
Authorization: Bearer passenger-jwt
Content-Type: application/json
```

```json
{
  "trip_id": "trip_id",
  "seat_number": "01"
}
```

Response:

```json
{
  "success": true,
  "message": "Booking reserved successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "user_id": "user_id",
      "trip_id": "trip_id",
      "seat_id": "seat_id",
      "status": "RESERVED",
      "expires_at": "2026-06-03T10:15:00.000Z"
    }
  }
}
```

### My Bookings

```http
GET /api/v1/bookings/my
Authorization: Bearer passenger-jwt
```

### Cancel Booking

```http
PATCH /api/v1/bookings/:id/cancel
Authorization: Bearer passenger-jwt
```

Cancellation releases the reserved seat and moves the booking to `FAILED` with `cancel_reason: "USER_CANCELED"`, because `CANCELED` is not part of the required strict state list.

## Booking Concurrency

Seat reservation uses Redis locking plus an atomic PostgreSQL seat update:

- Redis lock key: `seat:{trip_id}:{seat_number}`.
- Seat must atomically transition from `AVAILABLE` to `RESERVED`.
- Active bookings have a partial unique index on `seat_id`.
- Expired bookings are released before booking reads, creates, and cancellations.

Database relationships:

- `trip -> seats`: one-to-many through `seats.trip_id`.
- `user -> bookings`: one-to-many through `bookings.user_id`.
- `booking -> seat`: through `bookings.seat_id`.
- Unique seat index: `(trip_id, seat_number)`.

## Payment Examples

### Create Payment Session

Only the booking owner can create a payment session. The booking must still be `RESERVED` and not expired. This endpoint moves the booking to `PAYMENT_PENDING`; it never confirms the booking.

```http
POST /api/v1/payment/create
Authorization: Bearer passenger-jwt
Content-Type: application/json
```

```json
{
  "booking_id": "booking_id"
}
```

Response:

```json
{
  "success": true,
  "message": "Payment session created successfully",
  "data": {
    "payment": {
      "id": "payment_id",
      "booking_id": "booking_id",
      "amount": 2500,
      "status": "PENDING",
      "provider_reference": "mock_reference",
      "created_at": "2026-06-03T10:00:00.000Z"
    },
    "payment_url": "https://payments.example.test/checkout/mock_reference",
    "provider_reference": "mock_reference"
  }
}
```

### Payment Webhook

The frontend is never trusted for confirmation. Booking confirmation only happens through this webhook.

```http
POST /api/v1/payment/webhook
X-Payment-Signature: hmac-sha256-signature
Content-Type: application/json
```

```json
{
  "event": "payment.updated",
  "provider_reference": "mock_reference",
  "status": "SUCCESS"
}
```

The mock signature is:

```text
HMAC_SHA256("{provider_reference}.{event}.{status}", PAYMENT_WEBHOOK_SECRET)
```

Success flow:

- payment `PENDING -> SUCCESS`
- booking `PAYMENT_PENDING -> CONFIRMED`
- seat `RESERVED -> BOOKED`
- audit action `PAYMENT_SUCCESS`

Failure flow:

- payment `PENDING -> FAILED`
- booking `PAYMENT_PENDING -> FAILED`
- seat `RESERVED -> AVAILABLE`
- audit action `PAYMENT_FAILURE`

Webhook handling is idempotent by provider reference. Repeated success or failure events do not duplicate confirmation or payment processing.

## Jobs

`src/jobs/bookingExpiration.job.js` expires stale `RESERVED` or `PAYMENT_PENDING` bookings and releases their seats.

`src/jobs/paymentRetry.job.js` records retry attempts for pending mock-provider verifications. Real providers can be integrated by replacing the mock verification in `payment.service.js`.

## Real-Time Tracking

Socket.IO runs on the same HTTP server. Clients must authenticate with a JWT using either `handshake.auth.token` or an `Authorization: Bearer <token>` header.

Driver event:

```text
location:update
```

```json
{
  "trip_id": "trip_id",
  "latitude": -1.286389,
  "longitude": 36.817223
}
```

Only the trip's assigned `driver_id` can send updates. Passenger/admin subscription event:

```text
track:subscribe
```

```json
{
  "trip_id": "trip_id"
}
```

Subscribers receive:

```text
location:updated
```

REST fallback:

```http
POST /api/v1/location
Authorization: Bearer driver-jwt
Content-Type: application/json
```

```json
{
  "trip_id": "trip_id",
  "latitude": -1.286389,
  "longitude": 36.817223
}
```

Trips can include an optional `driver_id` at creation time so tracking authorization can be enforced.

## Admin Control

All admin endpoints require `system_admin`.

```http
GET /api/v1/admin/metrics
GET /api/v1/admin/audit-logs?page=1&limit=25&action=PAYMENT_SUCCESS
GET /api/v1/admin/health
PATCH /api/v1/admin/users/:id/role
```

Health includes PostgreSQL status, Redis status, uptime, and memory usage.

## Notifications

The notification module is a mock provider that writes structured logs for:

- booking confirmation
- payment success
- payment failure
- trip reminders

Trip reminder mock endpoint:

```http
POST /api/v1/notifications/trip-reminder
Authorization: Bearer system-admin-jwt
Content-Type: application/json
```

## Rate Limiting And Errors

Rate limiting protects auth, booking, and payment endpoints. Error responses use:

```json
{
  "error": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "details": []
}
```
