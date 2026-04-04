# LedgerFlow Backend

> Finance Data Processing and Access Control Backend — built with Node.js, Express, and PostgreSQL.

A production-grade REST API implementing role-based access control (RBAC), financial records management, dashboard analytics, audit logging, and soft-delete recovery for a finance data platform.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Relational database |
| **JWT** | Stateless authentication |
| **bcrypt** | Password hashing (salt rounds: 12) |
| **helmet** | HTTP security headers |
| **express-rate-limit** | Brute-force protection |
| **uuid** | UUID v4 primary keys |

---

## 📁 Project Structure

```
backend/
├── server.js                     # Entry point
├── .env.example                  # Environment template
├── package.json
└── src/
    ├── app.js                    # Express app + middleware pipeline
    ├── config/
    │   └── db.js                 # PostgreSQL connection pool
    ├── controllers/
    │   ├── auth.controller.js    # Login handler
    │   ├── user.controller.js    # User CRUD handlers
    │   ├── record.controller.js  # Financial record handlers
    │   ├── dashboard.controller.js  # Analytics handlers
    │   └── audit.controller.js   # Audit log handler
    ├── services/
    │   ├── auth.service.js       # Authentication logic
    │   ├── user.service.js       # User business logic
    │   ├── record.service.js     # Record business logic
    │   ├── dashboard.service.js  # Analytics queries
    │   └── audit.service.js      # Audit logging engine
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── record.routes.js
    │   ├── dashboard.routes.js
    │   └── audit.routes.js
    ├── middlewares/
    │   ├── authenticate.js       # JWT verification
    │   ├── authorize.js          # RBAC enforcement
    │   ├── errorHandler.js       # Global error handler
    │   ├── requestId.js          # X-Request-Id tracing
    │   └── rateLimiter.js        # Rate limiting
    ├── validators/
    │   ├── auth.validator.js     # Login input validation
    │   ├── user.validator.js     # User input validation
    │   └── record.validator.js   # Record input validation
    ├── utils/
    │   ├── AppError.js           # Custom error class
    │   ├── asyncHandler.js       # Async error wrapper
    │   └── roles.js              # Role constants
    ├── database/
    │   └── schema.sql            # Full DB schema + indexes
    └── scripts/
        └── seedAdmin.js          # Admin user seeder
```

---

## ⚡ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/LedgerFlow.git
cd LedgerFlow/backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a strong JWT_SECRET

# 4. Create the database
psql -U postgres -c "CREATE DATABASE ledgerFlow;"

# 5. Run the schema
psql -U postgres -d ledgerFlow -f src/database/schema.sql

# 6. Seed the admin user
node src/scripts/seedAdmin.js

# 7. Start the server
npm run dev
```

The server will start on `http://localhost:5000`.

### Default Admin Credentials
| Field | Value |
|---|---|
| Email | `admin@ledgerflow.com` |
| Password | `Admin@123` |

---

## 🔐 Role-Based Access Control (RBAC)

| Permission | ADMIN | ANALYST | VIEWER |
|---|---|---|---|
| Manage users (CRUD) | ✅ | ❌ | ❌ |
| Create/Update/Delete records | ✅ | ❌ | ❌ |
| View records | ✅ | ✅ | ❌ |
| Export records (CSV) | ✅ | ✅ | ❌ |
| View dashboard analytics | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ❌ | ❌ |
| Restore deleted records | ✅ | ❌ | ❌ |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth | Rate Limit |
|---|---|---|---|---|
| `POST` | `/auth/login` | User login | ❌ | 10/15min |

**Request Body:**
```json
{
  "email": "admin@ledgerflow.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@ledgerflow.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

---

### User Management (ADMIN only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users (paginated) |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create new user |
| `PATCH` | `/users/:id/role` | Update user role |
| `PATCH` | `/users/:id/status` | Activate/deactivate user |

**Query Parameters for `GET /users`:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `role` — filter by role (`ADMIN`, `ANALYST`, `VIEWER`)
- `status` — filter by status (`ACTIVE`, `INACTIVE`)

**Create User — Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Secure@123",
  "role": "ANALYST"
}
```

**Password Requirements:** min 8 chars, 1 uppercase, 1 number.

---

### Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/records` | ADMIN, ANALYST | List records (paginated) |
| `POST` | `/records` | ADMIN | Create record |
| `PATCH` | `/records/:id` | ADMIN | Update record |
| `DELETE` | `/records/:id` | ADMIN | Soft-delete record |
| `POST` | `/records/:id/restore` | ADMIN | Restore deleted record |
| `GET` | `/records/trash` | ADMIN | List deleted records |
| `GET` | `/records/export` | ADMIN, ANALYST | Export as CSV |

**Query Parameters for `GET /records`:**
- `page`, `limit` — pagination
- `type` — `income` or `expense`
- `category` — case-insensitive match
- `startDate`, `endDate` — date range (YYYY-MM-DD)

**Create Record — Request Body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2025-01-15",
  "notes": "January salary"
}
```

**Validation:**
- `amount` — must be positive, max 9,999,999,999.99
- `type` — must be `income` or `expense`
- `date` — must be valid `YYYY-MM-DD`
- `category` — max 50 characters

---

### Dashboard Analytics (All Roles)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Income, expense, balance, record count |
| `GET` | `/dashboard/categories` | Category-wise breakdown |
| `GET` | `/dashboard/trends/monthly` | Monthly income/expense trends |
| `GET` | `/dashboard/trends/weekly` | Weekly trends (last 12 weeks) |

All dashboard endpoints accept optional `?userId=<uuid>` to scope data.

---

### Audit Logs (ADMIN only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audit` | Paginated audit trail |

**Query Parameters:**
- `page`, `limit` — pagination
- `targetType` — `user` or `record`
- `targetId` — specific entity UUID
- `action` — e.g., `CREATE_RECORD`, `UPDATE_ROLE`

**Tracked Actions:**
`CREATE_USER`, `UPDATE_ROLE`, `ACTIVATE_USER`, `DEACTIVATE_USER`, `CREATE_RECORD`, `UPDATE_RECORD`, `DELETE_RECORD`, `RESTORE_RECORD`

---

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check (uptime, status) |

---

## 🗄️ Database Design

### Tables

**`users`** — User accounts with role and status management
- UUID primary key
- Email uniqueness constraint
- Role CHECK (`ADMIN`, `ANALYST`, `VIEWER`)
- Status CHECK (`ACTIVE`, `INACTIVE`)
- Auto-updating `updated_at` trigger

**`records`** — Financial transactions with soft-delete
- UUID primary key
- Amount CHECK (> 0), precision DECIMAL(12,2)
- Type CHECK (`income`, `expense`)
- Soft delete via `deleted_at` timestamp
- Foreign key to `users` with `ON DELETE SET NULL`
- Auto-updating `updated_at` trigger

**`audit_logs`** — Immutable compliance trail
- JSONB columns for before/after state
- Tracks user, action, target, and IP address
- Referenced via foreign key to `users`

### Indexes
- `idx_records_user_id` — fast lookup by creator
- `idx_records_date` — date range queries
- `idx_records_type` — type filtering
- `idx_records_category` — category filtering
- `idx_records_deleted_at` — soft delete filtering
- `idx_audit_logs_user_id` — audit by user
- `idx_audit_logs_target` — audit by entity
- `idx_users_email` — login lookups
- `idx_users_status` — active user filtering

---

## 🛡️ Security Features

- **Helmet** — sets security HTTP headers (XSS, HSTS, etc.)
- **Rate Limiting** — 100 req/15min general, 10 req/15min for auth
- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Expiry** — tokens expire after 1 hour
- **Input Validation** — email format, password strength, amount bounds, date format, UUID format
- **Request Body Limit** — 10KB max payload
- **Parameterized Queries** — SQL injection prevention
- **Request Tracing** — X-Request-Id for debugging

---

## 🏗️ Architecture Decisions

| Decision | Rationale |
|---|---|
| **Layered Architecture** | Clean separation: routes → validators → controllers → services → DB |
| **Soft Delete** | Financial records have compliance implications; data is never lost |
| **Audit Logging** | Every mutation is tracked with before/after JSONB for traceability |
| **asyncHandler Pattern** | Eliminates try/catch boilerplate; errors auto-forwarded to global handler |
| **COALESCE Updates** | Partial updates without overwriting unchanged fields |
| **UUID v4 Keys** | Non-sequential IDs prevent enumeration attacks |
| **Global Error Handler** | Centralized error formatting; consistent API response structure |
| **CSV Export** | Finance teams need data export; built into the records endpoint |

---

## 🔮 Future Enhancements

- [ ] Refresh token rotation
- [ ] Budget alerts / threshold system
- [ ] PDF export with charts
- [ ] WebSocket real-time dashboard updates
- [ ] Dockerized deployment
- [ ] Integration tests with supertest
- [ ] Swagger/OpenAPI documentation

---

