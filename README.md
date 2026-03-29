# Real Estate Buyer Portal

This repository contains two apps:
- Backend: Node.js + Express + PostgreSQL
- Frontend: React + TypeScript + Vite

## Current Project Status

Backend is functional and provides authentication, users, favourites, and admin-only property management.

Frontend currently contains starter/template files and is not yet wired to backend APIs.

## Tech Stack

- Backend: Express, pg, JWT, bcrypt/bcryptjs
- Frontend: React 19, TypeScript, Vite
- Database: PostgreSQL

## Prerequisites

- Node.js 18+
- PostgreSQL 12+

## Run Locally

## 1. Backend

```bash
cd Backend
npm install
copy .env.example .env
createdb real_estate
npm run dev
```

If your database name in .env is different from realestate, create that name instead:

```bash
createdb <your_db_name>
```

Backend default URL:
- http://localhost:5000

Notes:
- Create the PostgreSQL database manually before starting the backend.
- Backend creates tables if they do not exist.
- Admin user is seeded/upserted from env values.
- Properties are not auto-seeded.

## 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend default URL:
- http://localhost:5173

## Implemented API Routes

### Health
- GET /api/health

### Auth
- POST /auth/register
- POST /auth/login

### Properties
- GET /properties (public)
- POST /properties (admin only)
- DELETE /properties/:propertyId (admin only)

### Favourites
- GET /favourites (auth required)
- POST /favourites/:propertyId (auth required)
- DELETE /favourites/:propertyId (auth required)

## Database Tables

The backend initializes these tables:
- users
- properties
- favourites

## Behavior Summary

- Passwords are hashed before storing users.
- Registration password policy: minimum 8 characters, with uppercase, lowercase, number, and special character.
- Email validation during registration and login ensures the format contains an @ symbol and a valid domain extension (dot notation).
- JWT includes id, email, name, and role.
- Non-admin users cannot add/remove properties.
- Favourites are scoped to the authenticated user.


