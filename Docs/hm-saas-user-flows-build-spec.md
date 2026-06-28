# User Flows & Build Specification
## Multi-tenant Healthcare SaaS (Detailed Functional + Technical Blueprint)

This document expands the PRD into implementation-ready user flows, system behaviors, acceptance criteria, and tenant data isolation standards.

---

## 1) Scope of this Document
This spec provides:
1. End-to-end user flows for all personas.
2. Required screens and actions per module.
3. API/event behavior expectations.
4. Tenant data isolation model and enforcement patterns.
5. Build-level details needed by product, engineering, QA, and DevOps.

It is intended to be used with:
- `docs/hm-saas-prd.md`
- `docs/hm-saas-production-ready-plan.md`

---

## 2) Shared Product Principles
1. **Tenant-first design**: every object belongs to exactly one tenant unless explicitly platform-scoped.
2. **Feature entitlement enforcement**: module visibility and API access must follow subscription plan.
3. **Role-based least privilege**: users only see functions needed for role.
4. **Auditability by default**: sensitive actions logged immutably.
5. **Operational clarity**: each flow must produce visible status transitions.

---

## 3) Persona Map
- Platform Owner / Super Admin
- Tenant Admin
- Doctor
- Receptionist
- Pharmacist
- Lab Manager / Technician
- HR Manager
- Finance/Billing
- Patient / Family Account Manager

---

## 4) Global State Model

## 4.1 Tenant states
- `draft` -> `active_trial` -> `active_paid` -> `grace_overdue` -> `restricted` -> `suspended` -> `closed`

## 4.2 Subscription states
- `trial_active`, `trial_expired`, `paid_active`, `payment_due`, `grace`, `downgraded`, `cancelled`

## 4.3 Appointment states
- `requested`, `confirmed`, `reschedule_proposed_by_doctor`, `reschedule_proposed_by_patient`, `reschedule_confirmed`, `checked_in`, `in_consultation`, `completed`, `cancelled`, `no_show`

## 4.4 Lab order states
- `ordered`, `sample_collected`, `processing`, `report_ready`, `delivered`, `cancelled`

## 4.5 Pharmacy invoice states
- `draft`, `finalized`, `paid`, `partially_paid`, `void`

---

## 5) End-to-End User Flows

## 5.1 Flow A: Super Admin creates tenant
### Trigger
New customer (hospital/clinic/individual) signs up via sales onboarding.

### Steps
1. Super Admin opens **Tenants > Create Tenant**.
2. Enters tenant profile:
   - legal name
   - category (hospital/clinic/individual)
   - address and tax IDs (optional by region)
   - default timezone/currency
3. Selects plan (`pilot`/`starter`/etc.) and trial period.
4. Selects modules/features (appointments, pharmacy, labs, HR, campaigns, public website).
5. Configures branding (logo, primary/secondary colors, font, favicon, letterhead template).
6. Generates tenant URL/subdomain.
7. Creates initial Tenant Admin user.
8. Saves and activates tenant.

### System behavior
- `tenant` created with state `active_trial` or `active_paid`.
- `tenant_feature_entitlements` inserted per selected modules.
- Initial admin invitation issued.
- Audit event emitted: `tenant.created`.

### Acceptance criteria
- Tenant appears in Super Admin list with plan and status.
- Tenant Admin receives invite email/SMS.
- Tenant can access only enabled modules.

---

## 5.2 Flow B: Super Admin edits branding/theme
### Steps
1. Super Admin opens tenant profile.
2. Updates logo, color palette, font, Rx/letterhead template.
3. Clicks publish.

### System behavior
- Branding version incremented.
- UI theme cache invalidated.
- Public pages and printable templates re-render from latest branding.

### Acceptance criteria
- Tenant web app and public site reflect updated branding within cache TTL.
- New prescriptions print with updated template.

---

## 5.3 Flow C: Super Admin manages subscription and downgrade
### Steps
1. Payment overdue detected from billing service.
2. System enters grace state and sends reminders.
3. If payment not completed by grace end, system downgrades/restricts features.

### System behavior
- Non-critical modules locked first (e.g., campaigns).
- Hard restrictions apply after deadline (new record creation blocked in selected modules).
- Data remains preserved and read-only access may remain per policy.

### Acceptance criteria
- Tenant sees clear in-app banner and outstanding invoice details.
- Restricted modules are hidden/blocked consistently in UI and API.
- Reactivation restores entitlements without data loss.

---

## 5.4 Flow D: Tenant Admin sets up organization
### Steps
1. Tenant Admin logs in first time.
2. Completes setup wizard:
   - departments
   - services
   - working hours
   - location details
3. Creates staff users (receptionist/pharmacist/lab/HR).
4. Assigns roles + permissions.
5. Configures OPD settings, token/queue format, appointment buffers.

### Acceptance criteria
- Department and user setup completed in <30 min for typical clinic.
- Users can login and only view role-allowed sections.

---

## 5.5 Flow E: Tenant Admin onboards doctor
### Steps
1. Open **Doctors > Add Doctor**.
2. Enter doctor credentials:
   - specialization
   - department
   - consultation fees
   - schedule template (days + slots)
3. Assign assistant/reception desk mapping if needed.
4. Publish availability.

### Acceptance criteria
- Doctor appears in department directory.
- Booking engine exposes only published slots.

---

## 5.6 Flow F: Patient books appointment from public website
### Steps
1. Patient opens tenant public URL.
2. Selects department.
3. Selects doctor.
4. Views available slots from doctor schedule.
5. Chooses time and enters patient details (or signs in).
6. Confirms booking.

### System behavior
- Appointment created as `requested` or `confirmed` based on tenant rule.
- Confirmation notification sent.
- Calendar slot reserved atomically.

### Acceptance criteria
- No double booking for same doctor slot.
- Patient sees booking in portal timeline.

---

## 5.7 Flow G: Doctor confirms or proposes new time
### Steps
1. Doctor views requested appointments.
2. Either confirms current time or proposes alternative slot.
3. Patient receives notification and responds.

### State transitions
- `requested` -> `confirmed`
- `requested` -> `reschedule_proposed_by_doctor`
- `reschedule_proposed_by_doctor` -> `reschedule_confirmed` (if patient accepts)

### Acceptance criteria
- Both sides see identical latest schedule state.
- Notification timeline includes all proposals and decisions.

---

## 5.8 Flow H: Receptionist handles OPD walk-in and queue
### Steps
1. Register walk-in patient or search existing patient.
2. Assign department/doctor and queue token.
3. Mark patient `checked_in`.
4. Batch update statuses for multiple appointments if needed.

### Acceptance criteria
- Queue view updates in near real-time.
- Bulk action operation logs actor and affected records.

---

## 5.9 Flow I: Doctor consultation + prescription + lab order
### Steps
1. Doctor opens encounter from appointment.
2. Adds complaints, findings, diagnosis notes.
3. Adds medicines and dosage instructions.
4. Orders lab tests if needed.
5. Finalizes encounter.
6. Generates printable Rx on tenant letterhead.

### Acceptance criteria
- Prescription immutable version stored after sign-off (with amendment flow if required).
- Lab order automatically appears in lab worklist.

---

## 5.10 Flow J: Laboratory processing and report release
### Steps
1. Lab receives test order.
2. Collects sample and marks status.
3. Processes and enters results.
4. Supervisor validates report.
5. Releases report to patient portal and clinician.

### Acceptance criteria
- Only authorized lab roles can validate/release reports.
- Patient and doctor notified on report release.

---

## 5.11 Flow K: Pharmacy inventory and billing
### Steps
1. Pharmacist records purchases and stock batches.
2. Dispenses medicines against prescription or OTC sale.
3. Creates invoice and collects payment.
4. Stock deducted FIFO by batch/expiry policy.

### Acceptance criteria
- Low stock and near-expiry alerts generated daily.
- Sales dashboard updates with revenue and margin metrics.

---

## 5.12 Flow L: HR operations
### Steps
1. HR creates employee profile.
2. Assigns role, department, and reporting manager.
3. Tracks attendance/leave records.

### Acceptance criteria
- HR can only access staff data, not clinical data unless explicitly granted.

---

## 5.13 Flow M: Patient family account management
### Steps
1. Primary patient creates family member profiles.
2. Links dependent relationships.
3. Books appointments for dependents.
4. Views dependent history and reports based on consent policy.

### Acceptance criteria
- Family access follows explicit consent flags.
- Audit logs record access to dependent records.

---

## 5.14 Flow N: Campaign + Survey
### Steps
1. Tenant user creates campaign objective.
2. Builds survey form.
3. Targets segment (e.g., diabetic follow-up patients).
4. Sends campaign and tracks responses.

### Acceptance criteria
- Module accessible only if entitlement enabled.
- Response analytics available in campaign dashboard.

---

## 6) Module-wise Screen Inventory

## 6.1 Super Admin screens
- Tenant list/detail/create/edit
- Plan and entitlement manager
- Tenant branding editor
- Audit viewer
- Subscription and invoice monitor
- Global usage dashboard

## 6.2 Tenant Admin screens
- Dashboard
- Department/service manager
- Doctor manager and schedule settings
- Staff user/role management
- OPD settings
- Branding preview (read/edit as policy allows)

## 6.3 Doctor screens
- Daily calendar
- Appointment queue
- Encounter editor
- Prescription composer
- Lab order panel
- Follow-up planner

## 6.4 Reception screens
- Appointment desk
- Walk-in registration
- Queue monitor
- Bulk operations panel

## 6.5 Pharmacy screens
- Inventory ledger
- Batch/expiry tracker
- Sales billing desk
- Purchase management
- Profit and stock analytics

## 6.6 Lab screens
- Order worklist
- Sample tracking
- Result entry
- Report validation/release

## 6.7 Patient/public screens
- Public website (services/doctors/booking)
- Patient account dashboard
- Family profile manager
- Appointment history
- Reports/prescriptions/invoices

---

## 7) Tenant Data Isolation - Implementation Requirements

## 7.1 Isolation fundamentals
1. Every tenant-owned table must include:
   - `id`
   - `tenant_id`
   - timestamps
2. Every query path must include tenant scoping.
3. Cross-tenant joins are forbidden unless platform-scoped and read-only with explicit service account.

## 7.2 Request context enforcement
- Tenant context sources:
  1. Subdomain/domain mapping
  2. JWT claim (`tenant_id`)
- Server resolves and validates both.
- Mismatch between resolved tenant and token claim -> request denied.

## 7.3 Database safeguards
- Composite unique keys include `tenant_id` for tenant-specific natural keys.
- Foreign keys for tenant tables include tenant consistency checks.
- Optional RLS policies for high-risk entities (`patients`, `prescriptions`, `billing_invoices`).

## 7.4 Caching safeguards
- Cache keys prefixed with `tenant:{tenant_id}:...`.
- Never cache unscoped query results.

## 7.5 File storage safeguards
- Object path prefix: `tenant/{tenant_id}/...`.
- Signed URL generation verifies tenant ownership of file metadata.

## 7.6 Logging safeguards
- Security and access logs always include `tenant_id`, `user_id`, `role`, `action`, `resource`, `resource_id`.

## 7.7 Isolation testing requirements
Mandatory automated tests:
1. User from Tenant A cannot list/read/update Tenant B records.
2. IDOR attempts with guessed UUIDs fail with 403/404.
3. File URLs for another tenant rejected.
4. Cache contamination tests verify tenant key boundaries.

---

## 8) API Contract Requirements (High-level)

## 8.1 API standards
- Versioned endpoints (`/api/v1/...`).
- Idempotency keys for create/payment endpoints.
- Cursor pagination for list APIs.
- Consistent error envelope.

## 8.2 Core API groups
1. Auth/session
2. Tenant and branding
3. Roles/permissions/users
4. Departments/doctors/schedules
5. Patients/family/consent
6. Appointments/encounters/prescriptions
7. Labs
8. Pharmacy
9. Billing/subscriptions/payments
10. Notifications/campaigns/surveys

## 8.3 Event model
Suggested events:
- `tenant.created`
- `subscription.state_changed`
- `appointment.created`
- `appointment.rescheduled`
- `prescription.finalized`
- `lab.report_released`
- `invoice.overdue`
- `entitlement.updated`

---

## 9) Notification Requirements

## 9.1 Channels
- In-app
- Email
- SMS/WhatsApp

## 9.2 Trigger examples
- Appointment confirmation/reschedule/cancel
- Lab report ready
- Invoice generated/overdue
- Trial expiry and downgrade warnings

## 9.3 Reliability
- Outbox pattern for delivery guarantees.
- Retries with exponential backoff.
- Dead-letter queue and admin retry tools.

---

## 10) Reporting & Dashboards - Metrics Required

## 10.1 Super Admin
- Active tenants
- MRR and overdue invoices
- Feature adoption by module
- Churn risk signals

## 10.2 Tenant Admin
- Appointments by status/day
- Doctor utilization
- Revenue snapshot
- Pending reports/orders

## 10.3 Doctor
- Daily schedule load
- Follow-up due list
- Prescription volume

## 10.4 Pharmacy/Lab/HR
- Pharmacy: sales/margin/stock alerts
- Lab: TAT, backlog, test volume
- HR: attendance/leave trends

---

## 11) Non-Functional Requirements

## 11.1 Reliability
- Target uptime:
  - MVP: 99.5%
  - Growth: 99.9%

## 11.2 Performance
- p95 read latency < 300ms
- p95 write latency < 600ms
- Booking concurrency controls to prevent slot collisions

## 11.3 Security
- MFA for privileged roles
- Encryption in transit and at rest
- Periodic vulnerability scans

## 11.4 Backup and DR
- Daily full backups + PITR logs
- Quarterly restore drills
- Documented RPO/RTO per tier

---

## 12) QA/UAT Acceptance Matrix

## 12.1 Security test checklist
- Auth bypass attempts blocked
- Privilege escalation tests
- Tenant isolation tests

## 12.2 Workflow test checklist
- Appointment lifecycle including reschedule proposals
- Encounter + Rx + lab order flow
- Pharmacy inventory and billing consistency
- Subscription downgrade and restoration flow

## 12.3 UAT checklist by persona
- Super Admin UAT
- Tenant Admin UAT
- Doctor UAT
- Reception UAT
- Patient UAT

---

## 13) Engineering Backlog Structure (Suggested)

## 13.1 Epic list
1. Tenant core + auth
2. User/role/permission engine
3. Appointment and scheduling
4. Clinical documentation and prescriptions
5. Lab management
6. Pharmacy management
7. Billing/subscription entitlements
8. Patient/public website
9. Campaign/survey
10. HR
11. Observability + platform ops

## 13.2 Story template
- User story
- Preconditions
- API changes
- DB migration
- Event outputs
- Audit requirements
- Acceptance criteria
- Test cases

---

## 14) Implementation Order (Fastest Safe Path)
1. Tenant/auth/RBAC + isolation middleware
2. Appointment booking + schedule service
3. Encounter + prescription
4. Public booking + patient portal basics
5. Billing/subscription/entitlement engine
6. Lab + pharmacy
7. Campaign/survey + HR
8. Advanced analytics and optimization

---

## 15) Definition of Done (Module-level)
A module is done only when:
1. Functional stories complete.
2. Tenant isolation tests pass.
3. Role authorization tests pass.
4. Audit events implemented.
5. Dashboards updated where relevant.
6. Runbook and alerts configured.

---

## 16) Open Decisions to Finalize Before Build Sprint 1
1. Exact compliance scope per launch geography.
2. Payment provider primary/secondary.
3. SMS/WhatsApp vendor and expected monthly volume.
4. Hard vs soft restriction policy per module on overdue payment.
5. Data retention period by data class.
6. Custom domain policy (which plans support it).

---

## 17) Final Note
This specification is intended to remove ambiguity and let teams directly begin:
- wireframing,
- schema design,
- API contracts,
- sprint planning,
- and QA automation.

If required, next deliverables can be:
1. endpoint-by-endpoint API spec,
2. DB schema with keys/indexes,
3. role-permission matrix table,
4. detailed sprint plan (12-16 sprints).
