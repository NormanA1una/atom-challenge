# Atom Todo List — Fullstack Challenge

A fullstack todo list application built for the **ATOM technical challenge**. Users can sign in with their email, manage their personal tasks (create, edit, complete, delete), and see everything persisted in real time.

**Live demo → https://atom-todo-normanlunadev.web.app**

---

## Features

- Email-only sign-in — existing users log in directly; new users confirm account creation via dialog
- Personal task list ordered by creation date
- Create tasks with title and description via an expandable inline form
- Edit title and description through a modal dialog
- Toggle tasks between pending and completed (checkbox with strikethrough)
- Delete tasks with a confirmation dialog
- Persistent data per user in Cloud Firestore
- Fully responsive layout — tested down to 320px viewports
- Protected route (`/tasks`) — redirects to `/login` if no active session

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Angular Material (azure-blue theme), SCSS, RxJS 7, Signals |
| Backend | Express 4, TypeScript, Firebase Functions v2 |
| Database | Cloud Firestore (Admin SDK v13, singleton pattern) |
| Hosting | Firebase Hosting |
| Security | CORS, `X-API-Key` header, Firebase Secret Manager |
| Testing — Frontend | Vitest 4 via `@angular/build:unit-test`, Angular TestBed — **47 tests** |
| Testing — Backend | Jest 29 + ts-jest + Supertest — **32 tests** |
| CI/CD | GitHub Actions → Firebase deploy on every push to `main` |

---

## Architecture

### Backend — Hexagonal (Clean) Architecture

Four explicit layers with strict dependency direction: domain ← application ← infrastructure, presentation.

```
atom-todo-list-backend/functions/src/
├── domain/
│   ├── entities/        → User, Task (pure TypeScript interfaces, no framework deps)
│   ├── repositories/    → UserRepository, TaskRepository (ports — define what, not how)
│   ├── factories/       → UserFactory, TaskFactory (uuid + sensible defaults)
│   └── errors/          → NotFoundError, ValidationError
├── application/
│   └── use-cases/
│       ├── users/       → FindUserByEmail, CreateUser
│       └── tasks/       → GetTasksByUser, CreateTask, UpdateTask, DeleteTask
├── infrastructure/
│   └── firestore/       → Singleton Firestore client + repository implementations (adapters)
└── presentation/
    ├── app.ts           → Express factory: cors → apiKey → routes → error handler
    ├── middleware/      → apiKeyMiddleware, corsMiddleware, errorHandlerMiddleware
    └── routes/          → user.routes.ts, task.routes.ts
```

### Frontend — Angular 21 (Standalone Components)

```
atom-todo-list/src/app/
├── core/
│   ├── guards/          → authGuard (CanActivateFn — reads sessionStorage)
│   ├── interceptors/    → apiKeyInterceptor (HttpInterceptorFn — injects X-API-Key)
│   ├── services/        → UserService, TaskService (HttpClient wrappers)
│   └── models/          → User, Task (TypeScript interfaces)
├── features/
│   ├── login/           → LoginComponent (lazy loaded)
│   └── tasks/           → TasksComponent (lazy loaded, smart/container component)
│       └── components/  → TaskFormComponent, TaskItemComponent, TaskEditDialogComponent
└── shared/
    ├── components/      → ConfirmDialogComponent (reusable MatDialog)
    └── environments/    → environment.ts (dev — apiKey from repo-root local-dev.firebase.json), environment.prod.ts (CI-injected)
```

### Request flow

```
Browser → Angular (HttpInterceptor adds X-API-Key)
       → Cloud Function (Express)
       → apiKeyMiddleware (validates header)
       → Route handler
       → Use Case
       → Repository interface (domain)
       → Firestore implementation (infrastructure)
       → Cloud Firestore
```

---

## API Endpoints

All endpoints require the `X-API-Key: <secret>` header — returns `401 Unauthorized` otherwise.

| Method | Path | Body / Params | Response |
|--------|------|---------------|----------|
| `GET` | `/api/users?email=` | query: `email` | `200 User` or `404` |
| `POST` | `/api/users` | `{ email }` | `201 User` |
| `GET` | `/api/tasks?userId=` | query: `userId` | `200 Task[]` ordered by `createdAt ASC` |
| `POST` | `/api/tasks` | `{ userId, title, description }` | `201 Task` |
| `PUT` | `/api/tasks/:id` | `{ title?, description?, completed? }` | `200 Task` |
| `DELETE` | `/api/tasks/:id` | — | `204 No Content` |

---

## Running locally

### Requirements

- **Node.js 22+**
- **Java 21+** — required by the Firestore emulator (JVM process)
  - macOS: `brew install --cask temurin@21`
- **Angular CLI** — `npm install -g @angular/cli`
- **Firebase CLI** — `npm install -g firebase-tools` then `firebase login`

### 1 — Install dependencies

```bash
cd atom-todo-list && npm install
cd ../atom-todo-list-backend/functions && npm install
```

### 2 — Local dev config (single source of truth)

Local values for the API key and CORS origin live in **`local-dev.firebase.json`** at the monorepo root (committed). Example:

```json
{
  "API_SECRET_KEY": "atom-todo-secret-2026",
  "ALLOWED_ORIGIN": "http://localhost:4200"
}
```

**Why this file exists**

- The Angular app must send the same `X-API-Key` that Express validates (`API_SECRET_KEY`). Those strings used to be duplicated in `environment.ts` and `functions/.env`, which drifted easily and caused confusing `401` errors.
- Cloud Functions use `defineSecret()` for production; the emulator still resolves secret parameters and may talk to Secret Manager. Writing **both** `functions/.env` and `functions/.secret.local` from one JSON keeps emulator behavior aligned with what the frontend sends.
- **`atom-todo-list-backend/scripts/sync-local-dev-env.js`** reads `local-dev.firebase.json` and regenerates those two files before emulators start (`start-emulators.sh` and `npm run serve` in `functions` run it automatically).

The dev Angular `environment.ts` imports that JSON via the TypeScript path alias `@local-dev`, so there is only one place to edit the local key and origin.

> Production is unchanged: `environment.prod.ts` still uses `REPLACE_AT_BUILD_TIME`, and real secrets stay in Firebase Secret Manager + GitHub Actions.

### 3 — Start emulators + build functions

```bash
# Build Cloud Functions first
cd atom-todo-list-backend/functions && npm run build

# Start Firebase Emulators (Firestore + Functions)
cd .. && ./scripts/start-emulators.sh
```

- Emulator UI: http://127.0.0.1:4000
- Functions: http://127.0.0.1:5001

> **macOS note:** The script auto-selects Java 21+ via `/usr/libexec/java_home`. On Linux/WSL, export `JAVA_HOME` pointing to a JDK 21+ install first.

### 4 — Start the Angular dev server

```bash
cd atom-todo-list && ng serve
```

App: http://localhost:4200

---

## Running tests

### Backend — Jest + Supertest (32 tests)

```bash
cd atom-todo-list-backend/functions
npm test
```

```
PASS  src/domain/factories/user.factory.spec.ts
PASS  src/domain/factories/task.factory.spec.ts
PASS  src/application/use-cases/users/create-user.use-case.spec.ts
PASS  src/presentation/middleware/api-key.middleware.spec.ts
PASS  src/presentation/routes/user.routes.spec.ts    ← integration (supertest)
PASS  src/presentation/routes/task.routes.spec.ts    ← integration (supertest)

Tests: 32 passed
```

The integration tests mock Firestore at the repository class level using `jest.mock()` factories — no emulator required.

### Frontend — Vitest (47 tests)

```bash
cd atom-todo-list
npm test
```

```
PASS  src/app/core/guards/auth.guard.spec.ts
PASS  src/app/core/interceptors/api-key.interceptor.spec.ts
PASS  src/app/features/login/login.component.spec.ts
PASS  src/app/features/tasks/tasks.component.spec.ts
PASS  src/app/features/tasks/components/task-form/task-form.component.spec.ts
PASS  src/app/features/tasks/components/task-item/task-item.component.spec.ts

Tests: 47 passed
```

Services, `MatDialog`, `Router`, and `MatSnackBar` are all mocked via `vi.fn()`. No HTTP requests are made during tests.

---

## Key design decisions

### 1. Hexagonal architecture without over-engineering

The project uses a clear domain → application → infrastructure → presentation separation. However, separate mapper and DTO files were omitted intentionally — with 2 entities of 5 fields each, they would add ceremony without value. The domain entity is simple enough to serve directly as the API response.

### 2. Lazy `config` getters on the backend

```typescript
export const config = {
  get apiSecretKey() { return process.env['API_SECRET_KEY'] ?? ''; },
};
```

`process.env` is read lazily at request time, not at import time. This allows unit tests to set `process.env['API_SECRET_KEY'] = 'test-key'` before making requests, without needing to mock the `config` object itself.

### 3. `sessionStorage` for auth state

There is no password — authentication is email-only. `sessionStorage` (not `localStorage`) makes the session expire when the tab closes, which is the appropriate tradeoff for this authentication model. The `userId` stored here is the Firestore document ID.

### 4. `catchError → null` in `findByEmail`

A `404` from `GET /api/users?email=` means "user does not exist" — a valid application state, not an error. Mapping it to `null` in the Angular service keeps the Observable in the happy path and lets `switchMap` branch into the "create user" flow naturally.

### 5. Signals for state, Observables for I/O

```typescript
readonly tasks = signal<Task[]>([]);  // local reactive state
```

Signals manage synchronous, derived, local state (the task list, loading flag). Observables remain where they make sense: HTTP streams (`HttpClient`), dialog lifecycle (`MatDialog.afterClosed()`), and RxJS operator chains. They are not mixed arbitrarily.

### 6. Secret injected at build time via CI

`environment.prod.ts` ships with `apiKey: 'REPLACE_AT_BUILD_TIME'`. The GitHub Actions workflow substitutes it with the real GitHub Secret via `sed` before running `ng build --configuration production`. The actual value never lives in the repository.

### 7. Monorepo with `firebase.json` at the root

A single `firebase deploy` from the monorepo root orchestrates Angular Hosting, Cloud Functions, and Firestore rules in one operation. GitHub Actions builds both projects and deploys them in a single pipeline — no coordination between separate repos required.

### 8. `local-dev.firebase.json` — one file for local API key + CORS origin

Local development spans two runtimes (Angular on port 4200 and the Functions emulator) that must agree on **`API_SECRET_KEY`** (middleware vs `X-API-Key` header) and on **`ALLOWED_ORIGIN`** (browser `Origin` vs CORS). Keeping those values in two separate, hand-edited files caused silent mismatches.

The repo therefore centralizes them in **`local-dev.firebase.json`**. The Angular dev environment imports that JSON so the client always sends the key the server expects. **`atom-todo-list-backend/scripts/sync-local-dev-env.js`** copies the same fields into `functions/.env` and `functions/.secret.local` whenever you start emulators (so `defineSecret`-backed functions and the emulator stay consistent without relying on production Secret Manager for day-to-day work). Production secrets are still not stored in the repo — only this **non-production** placeholder file is committed.

---

## Deploying to Firebase

### Prerequisites

- Firebase project on **Blaze (pay-as-you-go) plan** (required for Cloud Functions)
- Secrets in Firebase Secret Manager:

```bash
# From the monorepo root (Atom/)
firebase functions:secrets:set API_SECRET_KEY   # strong random value
firebase functions:secrets:set ALLOWED_ORIGIN   # e.g. https://your-app.web.app
```

### Manual deploy

```bash
# 1. Build Angular (set real key in environment.prod.ts first)
cd atom-todo-list && ng build --configuration production

# 2. Build Functions
cd ../atom-todo-list-backend/functions && npm run build

# 3. Deploy everything
cd ../.. && firebase deploy
```

### Automated deploy via GitHub Actions

See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Required GitHub repository secrets:

| Secret | How to obtain |
|--------|---------------|
| `FIREBASE_TOKEN` | Run `firebase login:ci` locally; copy the printed token |
| `API_SECRET_KEY` | The same value set in `firebase functions:secrets:set API_SECRET_KEY` |

Every push to `main` triggers: install → build Angular (with secret injection) → build Functions → `firebase deploy`.
