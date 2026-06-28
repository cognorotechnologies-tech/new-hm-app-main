# Production-Ready Build Plan
## Multi-tenant Healthcare SaaS (Hospital / Clinic / Individual)

## 1. Short Answer
**Yes — this can be built production-ready.**

To do that safely and scalably, we should implement it in **phases with strict release gates**, not as one giant launch. This document converts your product idea into an execution-grade plan.

---

## 2. Production-Ready Definition (What “ready” means)
A release is production-ready only if these are satisfied:
1. **Security baseline** complete (auth hardening, encryption, audit, secrets management).
2. **Tenant isolation** validated (no cross-tenant read/write leaks).
3. **Availability target** met (99.5%+ MVP, 99.9% growth stage).
4. **Observability** in place (logs, metrics, tracing, alerting, on-call runbooks).
5. **Data safety** (automated backups + restore drill tested).
6. **Performance SLOs** met under expected load.
7. **Billing/subscription controls** enforce feature access and downgrades correctly.
8. **Operational readiness** (SOPs for incidents, deploy rollback, support workflows).

---

## 3. Target Architecture (Production Baseline)

## 3.1 Service Topology (Phase 1)
- **Web App**: Next.js (tenant + role-aware UI)
- **API App**: NestJS modular monolith
- **Worker**: BullMQ consumers (notifications, reports, campaigns)
- **PostgreSQL**: primary DB
- **Redis**: cache + queues + rate limit counters
- **MinIO**: documents/reports/images
- **Nginx**: reverse proxy + TLS termination
- **Monitoring stack**: Prometheus + Grafana + Loki + Alertmanager

## 3.2 Why modular monolith first
- Faster development and lower coordination overhead.
- Still enforce module boundaries internally:
  - auth
  - tenant
  - users/roles
  - appointments
  - prescriptions
  - pharmacy
  - labs
  - billing/subscription
  - notifications

## 3.3 Cloud migration compatibility
Keep all external contracts compatible:
- S3-compatible storage API (MinIO now, S3 later)
- Redis protocol unchanged
- Postgres-compatible SQL + migrations
- Docker images + IaC structure ready for cloud move

---

## 4. Tenant Isolation Strategy (Critical)

## 4.1 Multi-tenancy model
- Shared database + shared schema + strict `tenant_id` on all tenant-owned tables.
- Mandatory scoped queries in repository layer.
- Composite indexes with `tenant_id` first for every hot query.

## 4.2 Isolation safeguards
1. `tenant_id` required in write DTOs (server-side derived, never trust client).
2. Middleware injects tenant context from domain/subdomain/JWT claims.
3. Repository guard rejects unscoped queries.
4. Automated tests include cross-tenant leak test suites.
5. Optional Postgres Row Level Security (RLS) for high-risk tables.

---

## 5. Role & Permission Model (RBAC + Policy)

## 5.1 Roles
- Super Admin
- Tenant Admin
- Doctor
- Receptionist
- Pharmacist
- Lab Manager / Lab Tech
- HR Manager
- Finance/Billing
- Patient

## 5.2 Permission design
- Resource-action matrix (e.g., `appointment.read`, `appointment.bulk_update`).
- Feature flags tied to subscription entitlement.
- Policy constraints:
  - doctor can only access own appointments unless delegated
  - receptionist can manage booking but not prescription edits
  - pharmacy only if module enabled

---

## 6. Data Model Blueprint (Core Entities)

## 6.1 Platform entities
- `tenants`
- `plans`
- `tenant_subscriptions`
- `tenant_feature_entitlements`
- `tenant_branding`
- `audit_logs`

## 6.2 Access entities
- `users`
- `roles`
- `permissions`
- `user_roles`
- `sessions`

## 6.3 Clinical & operations entities
- `departments`
- `doctor_profiles`
- `doctor_schedules`
- `patients`
- `patient_family_members`
- `appointments`
- `encounters`
- `prescriptions`
- `lab_orders`
- `lab_reports`

## 6.4 Commerce entities
- `pharmacy_items`
- `stock_batches`
- `purchase_invoices`
- `sale_invoices`
- `billing_invoices`
- `payment_transactions`

## 6.5 Support entities
- `notifications`
- `file_assets`
- `campaigns`
- `surveys`
- `survey_responses`

---

## 7. Production Security Controls

## 7.1 Authentication and session security
- JWT access + rotating refresh tokens.
- Device/session inventory and forced logout.
- MFA for Super Admin and Tenant Admin.
- Password policies + login attempt throttling.

## 7.2 API and data protection
- TLS everywhere.
- Field-level encryption for sensitive values where needed.
- Signed URLs for reports/files with expiry.
- Input validation + output encoding.
- Rate limits per IP/user/tenant.

## 7.3 Auditability
- Immutable audit trail for:
  - patient data edits
  - prescriptions
  - billing actions
  - role/permission changes
  - subscription feature toggles

## 7.4 Compliance readiness (India-first)
- Consent and data-access logs.
- Data retention policy per module.
- Breach response SOP.
- DPDP-oriented privacy controls and policy docs.

---

## 8. Billing, Subscription & Downgrade Engine

## 8.1 Plan model
- Trial/Pilot with expiry date and quotas.
- Paid plans (Starter/Growth/Enterprise).
- Add-ons (doctors/users/storage/communication credits).

## 8.2 Entitlement enforcement
- Feature flags evaluated per request.
- Quota counters (appointments/month, users, storage).
- Hard/soft limit behavior configurable.

## 8.3 Non-payment workflow
1. Invoice overdue detected.
2. Grace period starts + reminders (T+1, T+3, T+7).
3. Soft restriction (new creations blocked) at threshold.
4. Hard downgrade/suspension after grace.
5. Reactivation on payment with data intact.

---

## 9. Performance & Scale Targets

## 9.1 Initial SLOs
- p95 API latency: < 300ms (read), < 600ms (write) under normal load.
- Appointment booking success rate: > 99.5%.
- Notification queue delay: < 60 seconds (p95).
- Uptime: 99.5% MVP.

## 9.2 Load assumptions for launch
- 50 tenants
- 10,000 patients
- 2,000 appointments/day
- 100 concurrent active staff users

## 9.3 Scale strategy
- Partition high-volume tables (appointments/audit logs) by month.
- Read replicas as soon as reporting load rises.
- Aggressive indexing + query plans monitored.
- Async heavy tasks via workers.

---

## 10. CI/CD and DevSecOps

## 10.1 Branching and environments
- `main` (production), `staging`, feature branches.
- Environments: dev -> staging -> prod.

## 10.2 Pipeline gates
1. Lint + unit tests
2. Integration tests (DB + queue)
3. Security checks (dependency scan, secret scan)
4. Migration validation
5. Build + artifact signing
6. Staging deploy + smoke tests
7. Manual approval for production

## 10.3 Deployment strategy
- Blue/green or rolling with health checks.
- Zero-downtime DB migration pattern (expand/contract).
- Automatic rollback trigger on error budget breach.

---

## 11. Testing Strategy

## 11.1 Test pyramid
- Unit tests: domain logic, entitlement checks.
- Integration tests: repositories, queue handlers, payment adapters.
- E2E tests: signup, tenant provisioning, appointment booking, prescription flow, invoice payment.

## 11.2 Critical test suites (must-have)
1. Cross-tenant access denial tests.
2. Role matrix authorization tests.
3. Subscription downgrade enforcement tests.
4. Appointment concurrency tests (double-book prevention).
5. File access signed URL expiry tests.
6. Backup restore verification tests.

---

## 12. Execution Roadmap (Production-focused)

## Phase A (Weeks 1-4): Core platform hardening
- Auth, tenant middleware, RBAC, audit framework.
- Super Admin tenant CRUD + branding + entitlement CRUD.
- Base CI/CD and observability.

## Phase B (Weeks 5-10): Clinical MVP
- Patient + family profile
- Appointment booking/reschedule/doctor proposals
- Doctor workflow + prescription + print templates
- Tenant admin user management

## Phase C (Weeks 11-16): Revenue modules
- Pharmacy inventory + billing
- Lab module + reports + payment
- Subscription billing + downgrade automation

## Phase D (Weeks 17-20): Public site and growth
- Branded tenant public pages
- Campaign + survey module
- HR module basics
- Advanced dashboards

## Phase E (Weeks 21-24): Production certification
- Load testing
- Security testing
- DR drill
- Pilot go-live with 3-5 clients

---

## 13. Team Plan and Build Cost (India)

## 13.1 Recommended team
- 1 Engineering Manager / Tech Lead
- 3 Full-stack engineers
- 1 QA automation engineer
- 1 DevOps engineer (shared or part-time)
- 1 Product designer
- 1 Product manager / founder-led

## 13.2 Build budget estimate
- 6 months strong MVP-production path:
  - **₹45L to ₹1.2Cr** (team composition dependent)
- 12 months to mature multi-module platform:
  - **₹1Cr to ₹2.5Cr+**

## 13.3 Infra/ops cost (local first)
- On-prem recurring + services (SMS/WhatsApp/email/domain/backup):
  - **₹25,000 to ₹1.5L per month** early stage

---

## 14. India Market Entry Model (Conversion Optimized)

## 14.1 Packaging
- Pilot (30-60 days)
- Starter (clinic)
- Growth (multi-doctor/mini-hospital)
- Enterprise (large hospital chain)

## 14.2 India launch pricing (recommended range)
- Pilot: ₹0, quota limited
- Starter: ₹5,000-₹12,000/month
- Growth: ₹18,000-₹50,000/month
- Enterprise: ₹75,000+/month

## 14.3 Upsell logic
- Trigger upsell at utilization thresholds:
  - appointments/month
  - active users
  - storage and messaging usage

---

## 15. Global Expansion Readiness
Before global scale, add:
1. Region-aware data hosting strategy.
2. Advanced compliance packs (country specific).
3. Multi-currency + tax handling.
4. Marketplace integrations (labs/pharmacy/insurance as region requires).

---

## 16. Go-Live Checklist (Hard Gate)
- [ ] Security tests passed (including tenant isolation)
- [ ] Backup restore tested in staging
- [ ] Observability dashboards live with alerts
- [ ] Incident runbooks documented
- [ ] SLO dashboards reviewed weekly
- [ ] Billing + downgrade simulation tested
- [ ] Pilot client UAT sign-off complete

---

## 17. Final Recommendation
Yes, this can be built production-ready and commercially viable.

The key is **scope discipline + phased execution + platform controls**:
- launch with strong core operations,
- enforce subscription entitlements reliably,
- prove ROI in pilot cohorts,
- then scale modules and pricing.

If you want next, I can convert this into:
1. detailed DB schema,
2. API contract list,
3. 12-sprint Jira-ready backlog.
