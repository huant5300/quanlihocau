# AI_RULES.md

```md
# AI ENGINEERING RULES

IMPORTANT:
Before generating or modifying code,
you MUST read:
- PRD.md
- README.md
- AI_RULES.md

This project is:
Production-grade Fishing Pond SaaS System.

Business:
Fishing pond management SaaS platform.
Each fishing pond is an independent tenant.
SUPER_ADMIN can access all tenant data.
OWNER can access own tenant data.
STAFF only accesses assigned tenant data.

Tech stack:

Frontend:
- React
- TypeScript
- Vite
- TailwindCSS
- React Query
- Zustand
- Axios

Backend:
- Django 5
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Multi-tenant architecture

IMPORTANT RULES:

1. NEVER generate fake placeholder code.

2. NEVER generate disconnected UI.

3. EVERY button must work with REAL backend APIs.

4. EVERY form must save REAL PostgreSQL data.

5. EVERY modal must have working submit logic.

6. ALWAYS follow:
Tenant → Customer → Ticket → Payment relationship.

7. NEVER break existing architecture.

8. NEVER rewrite working authentication unless necessary.

9. NEVER duplicate business logic.

10. ALWAYS use:
- TypeScript strict typing
- UUID primary keys
- production-grade patterns

11. ALWAYS separate:
- api/
- services/
- components/
- modules/
- hooks/
- store/
- types/

12. ALWAYS create:
- loading states
- error handling
- validation
- empty states
- toast notifications

13. ALWAYS maintain:
- mobile responsive UI
- desktop responsive UI

14. ALWAYS follow PRD.md business flows.

15. Backend architecture rules:

Each Django app must contain:
- models.py
- serializers.py
- views.py
- urls.py
- services.py
- permissions.py
- admin.py
- tests.py

16. Frontend architecture rules:

frontend/src/
- api/
- components/
- modules/
- pages/
- layouts/
- hooks/
- store/
- routes/
- types/
- utils/

17. ALWAYS type all props correctly.
No implicit any.

18. ALWAYS ensure:
Frontend:
- npm run dev
- npm run build

Backend:
- python manage.py makemigrations
- python manage.py migrate
- python manage.py runserver

work without errors.

19. NEVER modify unrelated files unnecessarily.

20. ALWAYS explain:
- modified files
- created files
- architecture decisions

21. PRIORITY:
Clean architecture > fast generation.

22. This is a REAL commercial SaaS application,
not a demo project.

23. Important business workflow:

START SESSION:
- create fishing ticket
- select customer
- select fishing package
- receive temporary payment
- optional print bill
- start countdown timer

ACTIVE SESSION:
- realtime countdown
- warning at 15 minutes
- add products
- add fish buyback
- extend fishing time
- edit session

CHECKOUT:
- calculate final bill
- subtract temporary payment
- subtract fish buyback
- print final bill
- save transaction history

24. Currency:
- Vietnam timezone
- Asia/Ho_Chi_Minh
- VND formatting with thousand separators

25. Security:
- secure JWT authentication
- secure environment variables
- secure API handling
- tenant data isolation
- PostgreSQL production-safe queries

26. Deployment targets:
Frontend:
- Vercel

Backend:
- Railway or Render

Database:
- PostgreSQL / Neon

27. NEVER disable TypeScript checking.

28. NEVER use:
- ts-ignore
- massive any typing
- fake APIs
- fake database logic

29. ALWAYS create scalable SaaS architecture.

30. IMPORTANT:
When building modules,
ONLY build ONE module at a time.
Do not rewrite the entire project.
```

---

# README_AI_WORKFLOW.md

```md
# CURSOR + AI WORKFLOW GUIDE

## PROJECT STRUCTURE

FishingPondSaaS/
│
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── users/
│   ├── tenants/
│   ├── customers/
│   ├── tickets/
│   ├── products/
│   └── common/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── PRD.md
├── AI_RULES.md
└── README_AI_WORKFLOW.md

---

# HOW TO USE CURSOR AI CORRECTLY

## STEP 1
Open project folder:
FishingPondSaaS

---

## STEP 2
Open Cursor AI.

---

## STEP 3
Before every prompt,
ALWAYS tell AI:

Read:
- PRD.md
- AI_RULES.md

---

## STEP 4
Then ask AI to build ONLY ONE MODULE.

GOOD EXAMPLE:

Read:
- PRD.md
- AI_RULES.md

Build Customer module with:
- CRUD APIs
- pagination
- tenant permissions
- PostgreSQL integration
- React frontend integration

---

BAD EXAMPLE:

Build entire app.

This causes messy architecture.

---

# CORRECT DEVELOPMENT FLOW

## Backend terminal:

cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

---

## Frontend terminal:

cd frontend
npm install
npm run dev

---

# IMPORTANT RULES

## ALWAYS TEST AFTER AI CHANGES

1. Backend runs?
2. Frontend runs?
3. Buttons work?
4. APIs work?
5. PostgreSQL stores real data?

---

# TOOLS

## Cursor
Main AI coding tool.

## DBeaver
Database viewer.
Used to:
- view tables
- inspect data
- debug PostgreSQL

## Postman
API testing tool.
Used to:
- test login
- test CRUD APIs
- test JWT

---

# MODULE BUILD ORDER

1. Users/Auth
2. Tenants
3. Customers
4. Fishing Tickets
5. Products
6. Fish Buyback
7. Payments
8. Reports
9. Dashboard
10. Notifications

---

# IMPORTANT

DO NOT BUILD TOO MANY MODULES AT ONCE.

Correct way:

Build module
→ Fix errors
→ Test backend
→ Test frontend
→ Test database
→ Build next module

---

# HOW TO FIX ERRORS

## Backend errors:
Check terminal.
Fix:
- migrations
- imports
- serializers
- urls
- settings.py

## Frontend errors:
Check:
- TypeScript types
- React props
- API responses
- Zustand store typing
- React Query typing

---

# DEPLOYMENT

Frontend:
Vercel

Backend:
Django

Database:
Neon PostgreSQL

---

# IMPORTANT MINDSET

This is NOT a demo app.

This is:
Production-grade Fishing Pond SaaS.

Every:
- button
- popup
- form
- ticket
- payment
- dashboard

must work with REAL database logic.
```

---