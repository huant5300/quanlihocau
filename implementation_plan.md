# Fishing Lake Management SaaS — Revised Production Architecture Plan

## Overview

This project is a production-oriented Fishing Lake Management SaaS platform.

The architecture has been revised to remove legacy Supabase dependencies and standardize the stack around:

* Frontend: Next.js + TypeScript
* Backend: Django REST Framework
* Database: PostgreSQL
* Authentication: JWT (SimpleJWT)
* State Management: Zustand
* Data Fetching: React Query
* Styling: TailwindCSS + Shadcn/UI

---

# Final Target Architecture

```text
Next.js Frontend
↓
Axios API Client
↓
Django REST Framework API
↓
PostgreSQL Database
```

---

# IMPORTANT ARCHITECTURE RULES

## We are NO LONGER using:

* Supabase Auth
* Supabase Database
* Supabase Realtime
* Supabase Storage
* Supabase Client SDK

All business logic must go through Django REST APIs.

---

# Frontend Stack

## Core

* Next.js 15
* React 19
* TypeScript Strict Mode
* TailwindCSS
* Shadcn/UI
* Framer Motion

## State + Data

* Zustand
* Tanstack React Query
* Axios

## Validation + Forms

* Zod
* React Hook Form

---

# Backend Stack

## Core

* Django
* Django REST Framework
* SimpleJWT
* PostgreSQL
* drf-yasg Swagger
* django-filter
* django-cors-headers

---

# Production Folder Structure

```text
project-root/
│
├── backend/
│   ├── config/
│   ├── users/
│   ├── customers/
│   ├── sessions/
│   ├── products/
│   ├── payments/
│   ├── reports/
│   ├── fish_buyback/
│   ├── common/
│   ├── manage.py
│   └── requirements.txt
│
├── app/
├── components/
├── modules/
├── services/
├── stores/
├── hooks/
├── types/
├── utils/
├── providers/
├── public/
├── package.json
└── tsconfig.json
```

---

# Frontend Architecture

## app/

Contains:

* layouts
* pages
* route groups
* dashboard pages
* auth pages

## components/

Reusable shared UI:

* buttons
* modals
* cards
* tables
* forms
* loading states

## modules/

Feature-based domain modules:

```text
modules/
├── crm/
├── sessions/
├── products/
├── reports/
├── payments/
├── fish-buyback/
└── dashboard/
```

Each module should contain:

```text
components/
hooks/
services/
types/
utils/
```

---

# API Architecture

## Centralized Axios Client

```text
services/api/client.ts
```

Responsibilities:

* baseURL
* JWT token injection
* refresh token flow
* error interceptors
* auth redirect handling

---

# Authentication Flow

## JWT Endpoints

```text
POST /api/token/
POST /api/token/refresh/
```

## Auth Responsibilities

* login
* logout
* token persistence
* refresh handling
* protected routes
* session restoration

## Storage

Use secure browser storage strategy.

---

# Shared Types Architecture

```text
types/
├── api.types.ts
├── auth.types.ts
├── customer.types.ts
├── session.types.ts
├── payment.types.ts
└── report.types.ts
```

Rules:

* No duplicate interfaces
* No inline anonymous API types
* Types must match Django serializers exactly
* Shared entities must be centralized

---

# State Management Rules

## Zustand

Use ONLY for:

* auth state
* UI state
* sidebar state
* modal state
* persistent lightweight state

## React Query

Use for:

* server state
* API caching
* CRUD requests
* background refetching

---

# Database Rules

## Development

SQLite allowed temporarily.

## Production

PostgreSQL only.

---

# Core Business Modules

## 1. Customer Management

Features:

* customer list
* create customer
* update customer
* delete customer
* search customer

---

## 2. Fishing Session Workflow

Features:

* ticket creation
* active sessions
* fish tracking
* fish buyback
* checkout
* revenue tracking

---

## 3. Revenue Dashboard

Features:

* daily revenue
* active sessions
* customer analytics
* inventory analytics
* transaction history

---

# UI/UX Standards

Requirements:

* responsive layout
* mobile navigation
* stable rendering
* loading skeletons
* empty states
* proper spacing
* accessible forms
* dashboard consistency

---

# Stability Requirements

The app must:

* avoid runtime crashes
* avoid hydration mismatch
* avoid infinite loading
* avoid undefined state access
* avoid stale schemas
* avoid circular dependencies
* avoid duplicated business logic

---

# TypeScript Rules

Strict mode is mandatory.

Fix:

* implicit any
* never types
* invalid nullable types
* stale interfaces
* duplicate exports
* invalid imports

---

# API Rules

Frontend must NEVER:

* use fake data
* use mock arrays in production modules
* bypass backend validation
* directly manipulate database state

All persistence must go through Django REST APIs.

---

# Production Readiness Checklist

## Backend

* Django server stable
* JWT works
* Swagger works
* migrations stable
* PostgreSQL stable

## Frontend

* no black screen
* no runtime crash
* no major TypeScript errors
* stable auth flow
* stable CRUD

## Integration

* frontend calls real APIs
* database persistence verified
* DBeaver shows real records

---

# Deployment Targets

## Frontend

* Vercel

## Backend

* Railway or Render

## Database

* Neon PostgreSQL

---

# Final Goal

Transform the project from:

```text
prototype / mixed architecture
```

into:

```text
stable production-ready SaaS foundation
```

with:

* clean architecture
* scalable modules
* stable APIs
* centralized types
* strong authenti
