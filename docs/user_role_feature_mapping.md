# User Role & Feature Mapping Specification — KINEMA AI

This document details the Role-Based Access Control (RBAC), user authentication, feature permissions, API endpoint access, field-level restrictions, and database mappings for the **KINEMA AI — Sports Injury Risk Detection Platform**.

---

## 1. Role-Based Feature Permission Matrix

| Feature / Action | `Athlete` | `Coach` | `Physiotherapist` | `Sports Scientist` | `Admin` |
|---|:---:|:---:|:---:|:---:|:---:|
| **Sign In & JWT Verification** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **GET `/api/athletes/me`** (own record, all fields) | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **GET `/api/athletes`** (full roster) | ❌ (403) | ✅ Read-only | ✅ Read-only | ✅ Read-only | ✅ Read-only |
| **PUT `/api/athletes/{id}`** (Profile fields) | ✅ Own profile | ⚠️ Whitelisted fields only | ❌ (403) | ❌ (403) | ❌ (403) |
| **PUT `/api/athletes/{id}`** (`training_load`, `coach_notes`) | ✅ | ✅ `training_load` & `coach_notes` | ❌ (403) | ❌ (403) | ❌ (403) |
| **POST/PUT `/api/athletes/{id}/injuries`** | ❌ (403) | ❌ (403) | ✅ Full CRUD | ❌ (403) | ❌ (403) |
| **GET `/api/athletes/{id}/injuries`** | ✅ Own record | ✅ Restricted (No `remarks`) | ✅ Full fields + `remarks` | ✅ Restricted (No `remarks`) | ❌ (403) |
| **POST `/api/videos/upload`** | ✅ Own `athlete_id` | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **GET `/api/videos/me`** | ✅ Own videos | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) |
| **GET `/api/videos` & GET `/api/videos/{id}`** | ✅ Own video | ✅ Squad videos | ✅ Flagged review | ✅ Model review | ❌ (403) |
| **CRUD `/api/users`** (Account Mgmt) | ❌ (403) | ❌ (403) | ❌ (403) | ❌ (403) | ✅ Full CRUD |
| **MongoDB `pose_data` & `ai_logs` Access** | ❌ | ❌ | ❌ | ✅ Read-only | ✅ Read-only |

---

## 2. Role Rules & Field-Level Restriction Audits

### 1. `Athlete` Role
- **Functionality**: Manage own profile, upload own videos, view own results.
- **Allowed Actions**:
  - `GET /api/athletes/me` & `PUT /api/athletes/{id}` (own record only, all fields).
  - `POST /api/videos/upload` (own `athlete_id` only).
  - `GET /api/videos/me` (returns list of own videos).
  - `GET /api/videos/{id}` (only if `video.athlete_id == self`).
  - `GET /api/athletes/{id}/injuries` (own record only, read-only).
- **Restrictions**: Cannot view or modify any other athlete's profile or video, cannot access `GET /api/athletes` (full roster) under any circumstance (`403 Forbidden`).

### 2. `Coach` Role
- **Functionality**: Monitor squad, adjust training load.
- **Allowed Actions**:
  - `GET /api/athletes` (full roster, read-only).
  - `PUT /api/athletes/{id}` — **ONLY `training_load` and `coach_notes` fields allowed**. Extra fields in payload are rejected with `400 Bad Request`.
  - `GET /api/videos` (squad-wide, read-only).
  - `GET /api/athletes/{id}/injuries` (read-only, **`remarks` field stripped server-side**).
- **Restrictions**: Cannot write to `injury_history` (`403 Forbidden`), cannot modify athlete profile fields besides `training_load`/`coach_notes` (`400 Bad Request`).

### 3. `Physiotherapist` Role
- **Functionality**: Manage injury history and rehab protocols.
- **Allowed Actions**:
  - `GET /api/athletes` (full roster, read-only).
  - `POST /api/athletes/{id}/injuries` & `PUT /api/athletes/{id}/injuries/{injury_id}` (full CRUD).
  - `GET /api/athletes/{id}/injuries` (full fields including `remarks`).
  - `GET /api/videos` (read-only, reviewing flagged athletes).
- **Restrictions**: Cannot modify athlete profile fields (`sport`, `position`, `training_load`) (`403 Forbidden`) — `injury_history` is their only write scope.

### 4. `Sports Scientist` Role
- **Functionality**: Review model performance and biomechanical data.
- **Allowed Actions**:
  - `GET /api/athletes` (read-only).
  - `GET /api/videos` & `GET /api/videos/{id}` (read-only).
  - `GET /api/athletes/{id}/injuries` (read-only, **`remarks` field stripped server-side**).
  - Read-only access to MongoDB `pose_data` and `ai_logs`.
- **Restrictions**: No write access anywhere — analytics-only role.

### 5. `Admin` Role
- **Functionality**: Platform and account management only.
- **Allowed Actions**:
  - Full CRUD on `/api/users` (create/deactivate accounts, change roles).
  - `GET /api/athletes` (read-only for system health/roster visibility).
  - Read-only visibility into system health `/api/health`.
- **Restrictions**: Explicitly denied direct write access to athlete clinical or physical fields (`injury_history`, `training_load`, athlete profile fields) (`403 Forbidden`).

---

## 3. Current System Database Accounts Summary

| Name | Role | Email | Active Data |
|---|---|---|---|
| **Ramcharan** | `Athlete` | `ramcharan123@gmail.com` | Active Profile (`Football`), Uploaded Videos |
| **Konda Peddi** | `Athlete` | `peddi123@gmail.com` | Registered Account |
| **Ram** | `Athlete` | `ramcharan1234@gmail.com` | Registered Account |
