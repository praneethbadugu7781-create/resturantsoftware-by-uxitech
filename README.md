# UXITECH Restaurant Management System

A production-style monorepo for a cloud restaurant management system focused on dine-in restaurant operations in India.

## Apps

- `apps/web`: Next.js 14 App Router frontend with public website, staff login, dashboard modules, KDS, and QR self-ordering.
- `apps/api`: Express REST API with Socket.io, Prisma, PostgreSQL, Redis, JWT auth, QR generation, PDF billing helpers, queues, and AI/report endpoints.
- `packages/shared`: Shared roles, statuses, permissions, and socket event constants.

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

3. Install dependencies and prepare the database:

```bash
npm install
npm run prisma:migrate
npm run seed
```

4. Run both services:

```bash
npm run dev
```

## URLs

- Public website: http://localhost:3000
- Staff login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard
- QR ordering: http://localhost:3000/order/[tableToken]
- API: http://localhost:4000/api/v1

## Demo Logins

- `owner@spicegarden.com` / `Admin@123`
- `manager@spicegarden.com` / `Admin@123`
- `cashier@spicegarden.com` / `Admin@123`
- `waiter@spicegarden.com` / `Admin@123`
- `kitchen@spicegarden.com` / `Admin@123`

## Implemented Modules

- Public restaurant website with menu, about, gallery, reservation, and contact pages
- JWT auth and role-aware dashboard structure
- Table management with visual floor plan and QR code generation
- Reservation, order, KDS, billing, inventory, staff, customer, reports, settings, and AI insights modules
- QR self-ordering mobile experience with cart state
- Socket.io rooms and events for restaurant, kitchen, cashier, and table sessions
- Prisma schema and seed data covering all requested demo entities
- Docker Compose for PostgreSQL, Redis, API, and web services

This is intentionally structured as a complete foundation: every requested route and module exists, core workflows are represented end to end, and the API/database contracts are ready for deeper production hardening such as exhaustive tests, payroll privacy rules, Cloudinary upload flows, and SMS provider integration.
