# LedgerFlow Backend

Finance Data Processing and Access Control Backend

## Features Implemented

- User and Role Management (ADMIN, ANALYST, VIEWER)
- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Financial Records CRUD
- Record Filtering (type, category, date)
- Dashboard APIs:
  - Summary (income, expense, balance)
  - Category breakdown
  - Monthly trends

## Role Permissions

- ADMIN:
  - Manage users
  - Full access to records and dashboard

- ANALYST:
  - View records
  - Access dashboard analytics

- VIEWER:
  - Read-only access to dashboard
  - No access to raw records

## Setup
1. Install dependencies
2. Setup PostgreSQL
3. Run schema.sql
4. Run seed script
5. Start server