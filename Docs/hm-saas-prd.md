# Product Requirements Document (PRD)
## Multi-tenant Healthcare SaaS for Hospitals / Clinics / Individual Practices

## 1) Executive Summary
Build a **multi-tenant healthcare operations platform** where one product owner (you) controls all tenants via a **Super Admin** console, and each tenant (hospital, clinic, individual doctor practice) gets isolated branding, feature access, users, and data.

The platform should support the full care journey:
- Tenant setup + branding + feature provisioning
- Staff onboarding + role-based access (Admin, Doctor, Receptionist, Pharmacist, HR, Lab, Finance)
- Appointment lifecycle (book, confirm, reschedule, OPD flow)
- E-prescriptions, lab tests, pharmacy inventory and billing
- Public website + patient registration + family profiles + records access
- Subscription/paywall logic (trial, pilot, downgrade on non-payment)

This PRD includes product scope, architecture, scalability strategy, India/world market analysis, pricing guidance, implementation phases, and cost estimates.

---

## 2) Goals & Non-goals
### Goals
1. Create a scalable and configurable platform for multiple healthcare business types.
2. Ensure strict tenant isolation and role-based data access.
3. Allow Super Admin to enable/disable modules per subscription.
4. Improve operational efficiency (appointments, billing, inventory, labs, HR).
5. Provide conversion-friendly commercial model (free/pilot to paid upsell).

### Non-goals (Phase 1)
1. Full insurance claim adjudication workflow.
2. Telemedicine hardware integrations (can be Phase 2+).
3. AI diagnostics as a regulated medical decision system.

---

## 3) User Types & Core Personas
1. **Platform Owner / Super Admin**: manages tenants, subscriptions, features, themes, audit visibility.
2. **Tenant Admin**: manages departments, doctors, staff users, local settings.
3. **Doctor**: scheduler/calendar, OPD visits, prescriptions, lab orders, follow-ups.
4. **Receptionist**: patient registration, booking/rescheduling, queue management.
5. **Pharmacist**: inventory, dispensing, purchase/sales analytics.
6. **Lab Manager/Technician**: test catalog, sample workflow, reports, payments.
7. **HR Manager**: employee records, attendance/leaves, payroll input (optional integration).
8. **Patient**: self/family profiles, appointment booking, lab report access, history.

---

## 4) Functional Scope (Must Capture All Requested Points)

## 4.1 Super Admin (Platform-level)
- Tenant CRUD (Hospital / Organization / Individual).
- Global audits and activity logs.
- Tenant branding management:
  - Logo, color palette, typography, themes, letterhead/Rx templates.
- Domain and URL management:
  - Subdomain routing (`tenant.yourdomain.com`) and optional custom domains.
- Tenant-level user seeding:
  - Create first Admin + optional staff accounts.
- Feature entitlement management:
  - Enable/disable modules (Campaign, Survey Builder, Pharmacy, Lab, Public Site, HR, etc.).
- Subscription engine:
  - Trial/pilot plans, active plans, add-ons, billing cycle, overdue states.
  - Auto downgrade/suspend feature access on non-payment.
- Plan and quota controls:
  - Max users, doctors, appointments/month, storage, SMS/WhatsApp credits.

## 4.2 Tenant Admin
- Manage departments and services.
- Onboard doctors and staff.
- Role and permission assignment (RBAC).
- Configure OPD workflows, prescription templates, letterheads.
- Configure appointment slots, buffer times, and overbooking rules.
- Manage patient operations and bulk appointment actions.
- User management within assigned modules only.

## 4.3 Doctor Portal
- Personal scheduler/calendar and availability settings.
- Appointment management:
  - Accept, reschedule, or propose new slot.
  - OPD queue and visit state transitions.
- Clinical workflow:
  - Diagnoses notes, e-prescriptions, lab test orders.
  - Follow-up scheduling.
- Print/export:
  - Rx and letterhead from tenant branding settings.

## 4.4 Patient Portal + Public Website
- Public pages per tenant (branded).
- Registration/login and profile management.
- Family account management:
  - Link dependents, view family reports/history with consent controls.
- Appointment booking by:
  - Department -> Doctor -> Available timeslot.
- Appointment status notifications:
  - Confirmed / Proposed New Time / Completed / Cancelled.
- Access to prescriptions, invoices, lab reports.

## 4.5 Pharmacy Module
- Product catalog and batch tracking.
- Purchase orders, stock inward/outward, low-stock alerts.
- Billing and invoice management.
- Sales analytics:
  - Revenue, top products, margin estimates, fast/slow-moving stock.

## 4.6 Laboratory Module
- Test catalog and pricing.
- Order management and sample workflow.
- Result entry/validation/report publishing.
- Lab billing and payments as separate module.

## 4.7 Campaign + Survey Builder (Optional Module)
- Campaign creation (health drives, follow-up reminders, promotions).
- Survey forms and response analytics.
- Per-tenant enablement based on subscriptions.

## 4.8 HR Module
- Employee records and role histories.
- Attendance/leave (basic in Phase 1).
- Shift planning (Phase 2).

## 4.9 Billing & Subscription Operations
- Tenant invoices and payment records.
- Plan changes, prorations, add-ons.
- Grace period workflows.
- Automatic module lock/downgrade for unpaid subscriptions.

---

## 5) Access Control & Security Model
- **Multi-tenant isolation** (strict tenant_id scoping at DB + API layer).
- **RBAC + optional ABAC**:
  - Role permissions plus policy constraints (department-scoped data, own-patient scope).
- **Audit logs** for sensitive operations (patient data, billing, prescription edits).
- **Data privacy**:
  - Encryption in transit (TLS) and at rest.
  - Document/file access via signed URLs.
- **Compliance baseline**:
  - India: DPDP Act readiness and health data consent considerations.
  - Global: GDPR-like controls (export/delete requests, consent tracking).

---

## 6) Recommended Technical Architecture (Scalable + Local-first)

## 6.1 Stack Recommendation
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + component library.
- **Backend**: NestJS (modular monolith first) or FastAPI (if Python preference).
- **Database**: PostgreSQL (single cluster, tenant-scoped tables initially).
- **ORM**: Prisma or TypeORM (Nest) / SQLModel (FastAPI).
- **Cache/Queue**: Redis (sessions, caching, queue jobs).
- **Background Jobs**: BullMQ / Celery for notifications, report generation, reminders.
- **File Storage**:
  - Local MinIO on-prem initially (S3-compatible), easy future migration to AWS S3.
- **Search/Analytics**: Postgres + materialized views first; add ClickHouse later if scale demands.
- **Auth**: Keycloak/Auth.js/Custom JWT + refresh tokens + MFA for admins.

## 6.2 Deployment (Now vs Future)
### Local/on-prem now
- Docker Compose or lightweight Kubernetes (k3s) on your server.
- Core services:
  - Nginx reverse proxy
  - App API
  - Web frontend
  - PostgreSQL
  - Redis
  - MinIO
  - Worker service
  - Monitoring (Prometheus + Grafana + Loki)

### Cloud migration later
- Keep infra portable via Docker images and IaC (Terraform).
- Swap components incrementally:
  - Local Postgres -> Managed Postgres (RDS/Cloud SQL)
  - MinIO -> S3
  - Local Redis -> ElastiCache/Managed Redis

## 6.3 Multitenancy Approach
Use **single database + shared schema + tenant_id column** in Phase 1 for speed and cost.
- Add row-level security patterns where possible.
- For larger clients (enterprise tier), support dedicated DB in Phase 3.

---

## 7) Core Data Domains (High-level)
1. Tenant, SubscriptionPlan, TenantFeatureEntitlement
2. User, Role, Permission, UserRoleAssignment
3. Department, DoctorProfile, ScheduleSlot
4. Patient, FamilyMember, ConsentRecord
5. Appointment, Encounter, Prescription, LabOrder
6. PharmacyItem, StockBatch, SaleInvoice, PurchaseInvoice
7. LabTest, Sample, LabReport
8. Campaign, Survey, SurveyResponse
9. BillingInvoice, PaymentTransaction, CreditLedger
10. AuditLog, Notification, FileAsset

---

## 8) APIs & Integration Strategy
- REST + OpenAPI first (GraphQL optional later).
- Webhook events for booking, payment, lab report ready, subscription expiry.
- Communication gateways:
  - Email (SMTP)
  - SMS/WhatsApp (Indian providers like MSG91/Gupshup/Twilio)
- Payment providers:
  - India: Razorpay, Cashfree, PayU.
  - Global: Stripe.

---

## 9) Dashboards (Role-specific)
1. **Super Admin Dashboard**: active tenants, MRR, churn risk, overdue accounts, feature adoption.
2. **Tenant Admin Dashboard**: appointments/day, doctor utilization, revenue snapshot, pending labs.
3. **Doctor Dashboard**: day schedule, pending follow-ups, active OPD queue.
4. **Pharmacy Dashboard**: low stock, daily sales, margins, top SKUs.
5. **Lab Dashboard**: pending samples, TAT metrics, report backlog.
6. **HR Dashboard**: attendance trend, leave load, staffing gaps.

---

## 10) Scalability, Reliability, and Performance Strategy
1. **Modular monolith first** (faster shipping), then split high-load modules (appointments, notifications, billing) into services.
2. **Database scaling**:
   - Proper indexing (tenant_id + common filters).
   - Read replicas after growth.
   - Partition high-volume tables (appointments, audit logs) by date/tenant.
3. **Queue everything async**:
   - Notifications, report PDFs, campaign sends, analytics refresh.
4. **Caching**:
   - Doctor availability, department lists, static tenant config.
5. **Observability**:
   - Metrics, traces, error tracking, audit trails.
6. **Backups/DR**:
   - Daily snapshots + transaction log backups.
   - RPO/RTO targets documented per tier.

---

## 11) Subscription & Commercial Model (Conversion-oriented)

## 11.1 Suggested Plan Ladder
1. **Pilot / Free Plan (30-60 days)**
   - Limited users/doctors/features
   - Branded public page + basic bookings
   - Strong onboarding and success support
2. **Starter (Clinic)**
   - Core appointments, patient records, basic Rx, basic billing
3. **Growth (Hospital/large clinic)**
   - Pharmacy, lab, HR, advanced analytics, campaigns/surveys
4. **Enterprise**
   - Custom domain, SSO, advanced compliance, dedicated DB option, SLA

## 11.2 Suggested Pricing (India-focused launch)
- Pilot: ₹0 for limited period + capped usage.
- Starter: ₹4,999-₹9,999 / month per tenant.
- Growth: ₹15,000-₹40,000 / month (size and modules).
- Enterprise: ₹60,000+ / month (custom).
- Add-ons:
  - Extra doctors/users
  - WhatsApp/SMS pack
  - Extra storage
  - Advanced campaign credits

## 11.3 Global Pricing (for later expansion)
- Starter: $99-$199/month.
- Growth: $300-$900/month.
- Enterprise: $1,500+/month.

Note: Healthcare SaaS pricing is value-sensitive to clinic throughput, digital maturity, and region-specific compliance burden.

---

## 12) India vs Global Market Analysis (High-level)

## 12.1 India Opportunity
- Large volume of small/mid clinics and fragmented operational tooling.
- Strong need for affordable, integrated systems (appointments + billing + pharmacy + lab).
- High growth of digital payments and WhatsApp-driven communication.
- Opportunity: **Modular pricing and local workflows** can drive faster adoption than enterprise-heavy products.

## 12.2 India Challenges
- Price sensitivity and long sales cycles for some hospitals.
- Change management for staff used to manual workflows.
- Variable internet quality in smaller cities.

## 12.3 Global Opportunity
- Higher ARPU potential in developed markets.
- Demand for compliance-grade workflows and integrations.
- Better upsell potential for analytics + patient engagement.

## 12.4 Global Challenges
- Heavier compliance/regulatory requirements.
- Strong incumbents in mature markets.

---

## 13) Cost Estimate to Build (Product + Engineering)

## 13.1 MVP (4-6 months)
Team (lean):
- 1 Product/Founder (you)
- 1 Tech Lead/Architect
- 2 Full-stack engineers
- 1 QA engineer (shared/part-time early)
- 1 UI/UX designer (part-time/contract)

Estimated India monthly burn:
- Lean team: ₹6L-₹15L/month (depends on in-house vs agency/senior mix).
- 6-month MVP estimate: **₹36L-₹90L**.

## 13.2 Initial Infrastructure Cost (On-prem, local server)
- Existing server: sunk cost if already owned.
- Software stack can be mostly open-source.
- Monthly recurring (domain, SMS/WhatsApp, email, backups, power, internet):
  - **₹15,000-₹1,00,000+** depending on notification volume and ops setup.

## 13.3 Cloud Cost After Migration (indicative)
Early stage (up to ~50 tenants):
- ₹50,000-₹2,00,000/month (or $600-$2,500/month), depending on usage/storage/traffic.

Growth stage (50-300 tenants):
- ₹2L-₹10L/month+ based on HA architecture and messaging volumes.

---

## 14) Go-to-Market & Conversion Strategy
1. Start with 5-10 pilot clients (mix of clinic + hospital + individual).
2. Offer white-glove onboarding and data migration support.
3. Track value metrics during pilot:
   - Reduced no-show rate
   - Improved appointment throughput
   - Faster billing cycles
4. Use success metrics to convert pilot -> paid.
5. Introduce annual pricing discounts to reduce churn.

---

## 15) Delivery Roadmap

## Phase 0 (2-4 weeks): Foundation
- Tenant model, auth, RBAC, branding, core audit logs.
- Super Admin panel baseline.

## Phase 1 (8-12 weeks): Core Ops MVP
- Appointments, patient management, doctor workflow, prescriptions.
- Tenant admin/user management.
- Public booking flow with branding.

## Phase 2 (6-10 weeks): Revenue Modules
- Pharmacy, lab, billing, subscription/paywall, notifications.

## Phase 3 (6-10 weeks): Growth Features
- Campaign/survey builder, HR module, advanced dashboards.
- Performance tuning, enterprise controls, cloud-ready migration.

---

## 16) Risks & Mitigations
1. **Scope overload** -> strict phased releases and module flags.
2. **Data privacy incidents** -> encryption, audits, least privilege, incident SOP.
3. **Adoption friction** -> in-app guided onboarding + local language support later.
4. **Payment failures/churn** -> grace windows + retry + assisted renewal process.

---

## 17) KPIs to Track
- MRR, ARPU, churn, CAC payback.
- Activation rate (tenant live within 7 days).
- Daily appointments processed per tenant.
- Rx and lab order completion rate.
- No-show rate reduction.
- Support tickets per active tenant.

---

## 18) Recommended Immediate Next Steps (Action Plan)
1. Finalize MVP feature contract (Phase 1 only).
2. Freeze RBAC matrix and tenant data model.
3. Build clickable UX prototype for Super Admin + Tenant Admin + Booking flow.
4. Implement modular monolith skeleton with tenant middleware.
5. Onboard 2 design partners before full build.
6. Set pilot pricing and explicit conversion criteria.

---

## 19) Final Recommendation
Your idea has strong market fit potential, especially in India if you execute with:
- modular subscriptions,
- strong operations workflows,
- fast onboarding,
- and measurable business value for clinics/hospitals.

Start narrow (appointments + doctors + Rx + basic billing + branding + subscriptions), then expand into pharmacy/lab/HR/campaigns as paid add-ons.
