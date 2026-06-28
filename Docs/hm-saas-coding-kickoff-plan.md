# Coding Kickoff Plan
## Based on:
- `docs/hm-saas-prd.md`
- `docs/hm-saas-production-ready-plan.md`
- `docs/hm-saas-user-flows-build-spec.md`

This is the actionable engineering plan to start coding the platform with tenant isolation, module entitlements, and production-readiness from day one.

---

## 1) Build Strategy Summary

## 1.1 Delivery method
- Use a **modular monolith** architecture first (faster build, easier control).
- Ship in vertical slices by business value:
  1. platform core (tenant/auth/RBAC)
  2. appointment + clinical flow
  3. subscription + entitlement
  4. revenue modules (lab/pharmacy)
  5. growth modules (campaign/HR)

## 1.2 Engineering principles
1. Tenant context required in all server-side operations.
2. Feature flags and quotas enforced in API, not just UI.
3. Every sensitive action emits auditable event.
4. Async for all non-critical workflows (notifications, reports, exports).
5. No “module done” without isolation + authorization test coverage.

---

## 2) Proposed Repo Structure (Start Here)

```txt
/apps
  /web                 # Next.js app (tenant + role aware UI)
  /api                 # NestJS backend modular monolith
  /worker              # queue consumers (notifications/reports/jobs)
/packages
  /config              # shared ts config/eslint/prettier/env typing
  /ui                  # shared component library/tokens
  /types               # shared contracts/types
  /events              # event names/payload schemas
  /auth                # auth utilities/jwt/guards helpers
  /tenant              # tenant context and isolation helpers
/infrastructure
  /docker              # compose files and service images
  /nginx               # reverse proxy configs
  /monitoring          # grafana/prometheus/loki
/docs
  hm-saas-prd.md
  hm-saas-production-ready-plan.md
  hm-saas-user-flows-build-spec.md
  hm-saas-coding-kickoff-plan.md
```

---

## 3) Architecture Decisions to Finalize Before First PR
1. Backend stack lock: **NestJS + Prisma + PostgreSQL**.
2. Auth model: JWT access + rotating refresh tokens.
3. Queue stack: Redis + BullMQ.
4. File storage: MinIO (S3-compatible key format).
5. Tenant resolution priority:
   - domain/subdomain
   - token claim match validation
6. API standard:
   - `/api/v1`
   - cursor pagination
   - idempotency keys for critical create/payment endpoints.

---

## 4) Sprint 0 (Week 1-2): Foundation Setup

## 4.1 Infra and dev setup
- Monorepo bootstrap.
- Docker compose for: postgres, redis, minio, api, web, worker.
- Migration pipeline + seed pipeline.
- Centralized env management and secret handling.

## 4.2 Base quality gates
- Lint, typecheck, unit test commands.
- Pre-commit hooks for formatting and lint checks.
- CI skeleton for PR validation.

## 4.3 Observability bootstrap
- Request ID middleware.
- Structured logs (json).
- Basic metrics endpoint.

### Exit criteria
- One command spin-up works locally.
- Empty health endpoint reachable for web/api/worker.

---

## 5) Sprint 1 (Week 3-4): Tenant Core + Auth + RBAC

## 5.1 Data model (initial)
Create tables:
- `tenants`
- `tenant_branding`
- `users`
- `roles`
- `permissions`
- `user_roles`
- `sessions`
- `audit_logs`

All tenant-owned entities include:
- `tenant_id`
- `created_at`
- `updated_at`

## 5.2 Core services
- Tenant resolver middleware.
- Auth service (login/refresh/logout).
- Role/permission guard.
- Audit logger interceptor.

## 5.3 Super admin essentials
- Tenant CRUD APIs.
- Tenant branding CRUD APIs.
- Initial tenant admin invitation endpoint.

### Exit criteria
- Super Admin can create a tenant and initial admin.
- Tenant admin can login only under correct tenant context.
- Cross-tenant access tests pass.

---

## 6) Sprint 2 (Week 5-6): Subscription + Entitlement Engine

## 6.1 Data model
- `plans`
- `tenant_subscriptions`
- `tenant_feature_entitlements`
- `billing_invoices`
- `payment_transactions`

## 6.2 Core logic
- Plan assignment flow (trial/paid).
- Feature check middleware/guard.
- Quota counters (users, doctors, appointments, storage).
- Overdue -> grace -> restricted state machine.

## 6.3 UI requirements
- Super Admin: plan/feature assignment UI.
- Tenant Admin: entitlement visibility and billing status banner.

### Exit criteria
- Disabled feature blocked in API and hidden in UI.
- Downgrade simulation works without data deletion.

---

## 7) Sprint 3 (Week 7-8): Departments + Doctors + Scheduling

## 7.1 Data model
- `departments`
- `doctor_profiles`
- `doctor_schedules`
- `doctor_schedule_exceptions`

## 7.2 APIs
- Department CRUD.
- Doctor onboarding CRUD.
- Availability publishing.
- Slot generation endpoint.

## 7.3 Rules
- Slot conflict protection.
- Department-doctor consistency checks.
- Per-tenant timezone handling.

### Exit criteria
- Doctor appears in public booking search with valid slots.
- Conflicting schedules rejected.

---

## 8) Sprint 4 (Week 9-10): Patient + Family + Public Booking

## 8.1 Data model
- `patients`
- `patient_family_members`
- `patient_consents`
- `appointments`

## 8.2 APIs and flow
- Public registration/login.
- Family member create/link.
- Appointment booking with atomic slot locking.
- Appointment timeline endpoints.

## 8.3 Notifications
- Appointment confirmed/rescheduled/cancelled events.
- In-app + SMS/email dispatch via worker.

### Exit criteria
- End-to-end booking flow live.
- No double-book under concurrency test.

---

## 9) Sprint 5 (Week 11-12): Reception + OPD + Bulk Actions

## 9.1 Features
- Walk-in registration.
- Queue token assignment.
- `checked_in` and queue state transitions.
- Bulk appointment status operations.

## 9.2 Controls
- Bulk action permission gate (`appointment.bulk_update`).
- Action-level audit trails.

### Exit criteria
- Reception can process walk-ins and bulk updates with role controls.

---

## 10) Sprint 6 (Week 13-14): Doctor Encounter + Prescription + Lab Orders

## 10.1 Data model
- `encounters`
- `prescriptions`
- `prescription_items`
- `lab_orders`

## 10.2 Features
- Encounter editor.
- Rx composer with templates/letterhead branding.
- Lab order creation from encounter.
- Printable/exportable prescription document.

### Exit criteria
- Complete clinical flow: appointment -> encounter -> Rx -> lab order.

---

## 11) Sprint 7 (Week 15-16): Laboratory Module

## 11.1 Data model
- `lab_tests`
- `lab_samples`
- `lab_results`
- `lab_reports`

## 11.2 Features
- Lab worklist.
- Sample lifecycle tracking.
- Result entry and validation.
- Report release and patient/doctor notification.

### Exit criteria
- Only authorized lab roles can release reports.
- Released reports visible in patient portal.

---

## 12) Sprint 8 (Week 17-18): Pharmacy Module

## 12.1 Data model
- `pharmacy_items`
- `stock_batches`
- `purchase_invoices`
- `sale_invoices`
- `sale_invoice_items`

## 12.2 Features
- Stock inward/outward.
- FIFO deduction with expiry awareness.
- Billing and payment capture.
- Low-stock and near-expiry alert jobs.

### Exit criteria
- Stock balances accurate after sale flows.
- Margin and sales snapshots available in dashboard.

---

## 13) Sprint 9 (Week 19-20): Campaign + Survey + HR Basics

## 13.1 Campaign/survey
- Campaign creation.
- Survey builder + response capture.
- Entitlement checks.

## 13.2 HR basics
- Employee profiles.
- Attendance/leave records.
- Role-scoped access boundaries.

### Exit criteria
- Modules available only when entitlement enabled.

---

## 14) Sprint 10 (Week 21-22): Hardening & Production Readiness

## 14.1 Security hardening
- MFA for privileged roles.
- Rate limiting and lockout.
- Signed URL expiry and verification.
- Secret scanning and dependency scanning in CI.

## 14.2 Reliability
- Backup automation and restore drill.
- Queue DLQ + retry tooling.
- Runbooks for incidents and rollback.

## 14.3 Performance
- Query profiling and index tuning.
- p95 latency checks.
- appointment concurrency load test.

### Exit criteria
- Production readiness checklist completed.

---

## 15) Detailed Tenant Isolation Implementation Checklist

## 15.1 API layer
- Tenant context middleware required globally.
- Request denied if tenant context missing.
- Token tenant mismatch -> 403.

## 15.2 Service/repository layer
- Repository functions accept `tenantId` as mandatory arg.
- No unscoped list/read methods for tenant entities.
- Guard rails: lint/static rule to block repo methods without tenant parameter.

## 15.3 DB layer
- Add `tenant_id` index to every tenant table.
- Composite unique constraints include `tenant_id`.
- Optional RLS for high-risk tables.

## 15.4 Cache layer
- Prefix keys: `tenant:{id}:...`.
- Explicit eviction by tenant scope on branding/entitlement changes.

## 15.5 File layer
- Path isolation: `tenant/{id}/...`.
- DB metadata and signed URL ownership check.

## 15.6 Test layer
Must-have automated tests:
1. Cross-tenant API denial.
2. IDOR checks on guessed IDs.
3. File URL cross-tenant rejection.
4. Cache pollution checks.

---

## 16) API-first Development Plan

## 16.1 Contract process
1. Define OpenAPI schemas before coding handlers.
2. Generate typed clients for web app.
3. Use contract tests to prevent drift.

## 16.2 Initial endpoint packs
1. `/auth/*`
2. `/super-admin/tenants/*`
3. `/tenant/users/*`
4. `/tenant/departments/*`
5. `/tenant/doctors/*`
6. `/public/booking/*`
7. `/appointments/*`
8. `/encounters/*`
9. `/prescriptions/*`
10. `/lab/*`
11. `/pharmacy/*`
12. `/billing/*`

---

## 17) QA Plan to Start in Parallel (Not at End)

## 17.1 Early automation
- Auth tests from sprint 1.
- Tenant isolation regression suite from sprint 1.
- Booking concurrency suite from sprint 4.

## 17.2 UAT cadence
- End of every sprint:
  - Super Admin validation
  - Tenant Admin validation
  - one role-specific persona validation

## 17.3 Release gates
- No production deploy if:
  - critical security issue open
  - tenant isolation suite failing
  - restore drill outdated

---

## 18) Dashboard Build Plan

## 18.1 Phase 1 dashboards
- Super Admin: tenant count, trial conversion, overdue invoices.
- Tenant Admin: appointments/day, queue status, active doctors.
- Doctor: daily appointments, pending follow-ups.

## 18.2 Phase 2 dashboards
- Pharmacy: margin and stock risk.
- Lab: TAT and backlog.
- Finance: collections and overdue.

---

## 19) Operational Plan (Local Server -> Cloud)

## 19.1 Local deployment now
- Run via Docker Compose on local server.
- Nightly DB backup + off-server copy.
- Reverse proxy TLS + domain routing.

## 19.2 Cloud migration readiness
- Keep infra in version control.
- Keep object storage API S3 compatible.
- Avoid vendor-locked primitives in core domain logic.

---

## 20) Team Execution Matrix

## 20.1 Suggested role split
- Engineer A: tenant/auth/RBAC/billing core
- Engineer B: appointments/doctor/patient/public booking
- Engineer C: pharmacy/lab + analytics feeds
- QA: automation and regression packs
- DevOps: CI/CD, observability, backup/DR

## 20.2 Weekly governance
- Monday: sprint planning + risk review
- Wednesday: architecture + security checkpoint
- Friday: demo + UAT + release decision

---

## 21) Immediate Next 14-Day Action List
1. Freeze tech stack and repo structure.
2. Setup monorepo and dockerized local environment.
3. Implement tenant resolver middleware and auth skeleton.
4. Implement base data models (`tenants`, `users`, `roles`, `audit_logs`).
5. Add first Super Admin flows (tenant create + branding + admin invite).
6. Build isolation tests before adding business modules.
7. Stand up CI checks and minimum monitoring.

---

## 22) Definition of Ready for Development Tickets
Each ticket must include:
1. User persona and user story.
2. Data model impact.
3. API changes.
4. Authorization and tenant isolation rule.
5. Audit log requirements.
6. Acceptance test cases.

---

## 23) Definition of Done for First Production Launch
Launch only when all are true:
1. Core flows complete:
   - tenant onboarding
   - user roles
   - appointment booking
   - encounter + prescription
   - basic billing/subscription
2. Isolation suite green in CI.
3. Security baseline complete.
4. Backup/restore proven in staging.
5. Observability and alerting active.
6. Pilot tenant UAT sign-off complete.

---

## 24) Final Recommendation
Start coding with a **platform-core-first sequence** and treat tenant isolation and entitlement enforcement as non-negotiable platform infrastructure.

If you want, next I can generate:
1. Sprint-by-sprint Jira ticket list,
2. detailed SQL schema v1,
3. OpenAPI endpoint skeletons,
4. role-permission matrix table for all modules.
