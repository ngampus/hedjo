# Security Specification: Carbon Ledger Zero-Trust Shield

This specification defines the formal safety criteria, validation benchmarks, and defensive guardrails guarding the Hedjo Carbon Accounting enterprise datastore.

## 1. Core Data Invariants

1. **Relational Anchoring (Master Gate):** No carbon activity or filing period can exist unless its parent organization exists and the performing operator is logged as a verified member of that exact organization.
2. **Access Isolation:** Data access is containerized at the tenant organization boundary. All lists, additions, changes, or removals require explicit tenant membership verification.
3. **Role-Based Clearance (RBAC):**
   - **Admin:** Can manage organization parameters, filing periods (lock/unlock), and memberships.
   - **Contributor:** Can read metadata and log/edit carbon activity records. Cannot lock periods or alter memberships.
   - **Viewer:** Read-only access to emissions records. Cannot add/update/delete.
4. **Filing Lock Invariant:** Once a `ReportingPeriod` status is set to `locked`, its historical activities ledger becomes read-only and immutable for audit purposes (unless unlocked by an Admin).
5. **Operator Authentication:** A user must have a verified, active Firebase account with `email_verified == true`. Anonymous and unverified sessions are blocked from standard read/write operations.

---

## 2. The "Dirty Dozen" Hostile Payloads

Below are the 12 specific hostile payloads designed to compromise Identity, Integrity, or Tenant Isolation. They must return `PERMISSION_DENIED`.

### Payload 1: Identity Spoofing (Org Creation)
An attacker tries to create an organization profile setting `ownerUserId` to another user's UID to claim their workspace.
```json
{
  "path": "/organizations/hacked_org",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "hacked_org",
    "name": "Tampered Steel Corp",
    "country": "Indonesia",
    "industry": "Manufacturing",
    "baseCurrency": "IDR",
    "baselineYear": 2025,
    "ownerUserId": "victim_user_abc",
    "createdAt": "2026-05-28T05:00:00Z"
  }
}
```

### Payload 2: Identity Spoofing (Activity Creation)
An attacker logs a carbon activity but sets the `createdBy` property to a reputable manager's UID.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/activities/act_1",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "act_1",
    "orgId": "org_123",
    "reportingPeriodId": "period_2025",
    "scope": 1,
    "categoryId": "stationary_combustions",
    "location": "Jakarta Depot",
    "activityAmount": 500,
    "activityUnit": "Liters",
    "emissionFactorId": "gasoline_id",
    "calculatedCO2e": 1.15,
    "notes": "Legitimate Fuel Logs",
    "createdBy": "chief_sustainability_officer_999",
    "createdAt": "2026-05-28T05:00:00Z",
    "date": "2025-05"
  }
}
```

### Payload 3: Tenant Isolation Breakthrough (Cross-Tenant Read)
An authenticated agent in `org_A` attempts to fetch emissions data belonging to `org_B`.
```json
{
  "path": "/organizations/org_B/reportingPeriods/period_2025/activities/victim_activity",
  "auth": { "uid": "user_org_A", "token": { "email_verified": true } },
  "operation": "get"
}
```

### Payload 4: Unverified Auth Bypass
An attacker with an unverified email (`email_verified: false`) attempts to list reporting activities.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/activities",
  "auth": { "uid": "attacker_123", "token": { "email_verified": false } },
  "operation": "list"
}
```

### Payload 5: Lock Bypass / Historical Ledger Tampering
A compromised account tries to inject activity data into a period that has already been locked for ESG compliance.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_locked_2025/activities/malicious_act",
  "auth": { "uid": "contributor_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "malicious_act",
    "orgId": "org_123",
    "reportingPeriodId": "period_locked_2025",
    "scope": 2,
    "categoryId": "electricity",
    "location": "Bali Branch",
    "activityAmount": 1000000,
    "activityUnit": "kWh",
    "emissionFactorId": "grid_java_bali",
    "calculatedCO2e": 850.0,
    "notes": "Hacked historical value",
    "createdBy": "contributor_123",
    "createdAt": "2026-05-28T05:00:00Z",
    "date": "2025-01"
  }
}
```

### Payload 6: Field Alteration (Immutability Violation)
A user tries to redirect an activity log to another organization by updating its `orgId` or `reportingPeriodId`.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/activities/act_1",
  "auth": { "uid": "contributor_123", "token": { "email_verified": true } },
  "operation": "update",
  "data": {
    "id": "act_1",
    "orgId": "stolen_target_org_xyz",
    "reportingPeriodId": "period_2025",
    "scope": 1,
    "categoryId": "stationary_combustions",
    "location": "Jakarta Depot",
    "activityAmount": 500,
    "activityUnit": "Liters",
    "emissionFactorId": "gasoline_id",
    "calculatedCO2e": 1.15,
    "notes": "Altered parent linkage",
    "createdBy": "contributor_123",
    "createdAt": "2026-05-28T05:00:00Z",
    "date": "2025-05"
  }
}
```

### Payload 7: Denial of Wallet ID Poisoning (Resource Exhaustion)
An attacker tries to create a document with a massive string ID to inflate resource usage and storage bills.
```json
{
  "path": "/organizations/org123/reportingPeriods/period2025/activities/act_very_long_repeated_character_string_exhaustion_vector_that_extends_beyond_established_character_limit_boundaries_abcdefghijklmnopqrstuvwxyz",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "operation": "create"
}
```

### Payload 8: Privilege Escalation (Self-Assigned Admin Role)
A Standard Contributor attempts to create a high-clearance admin membership for themselves.
```json
{
  "path": "/organizations/org_123/memberships/user_123",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "user_123",
    "orgId": "org_123",
    "userId": "user_123",
    "role": "admin",
    "userEmail": "attacker@gmail.com"
  }
}
```

### Payload 9: Client-Side Timestamp Inject (Temporal Spoofing)
An attacker injects a custom historical date into `createdAt` instead of using the mandatory `request.time` server checkpoint.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/activities/act_1",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "act_1",
    "orgId": "org_123",
    "reportingPeriodId": "period_2025",
    "scope": 1,
    "categoryId": "stationary_combustions",
    "location": "Jakarta Depot",
    "activityAmount": 500,
    "activityUnit": "Liters",
    "emissionFactorId": "gasoline_id",
    "calculatedCO2e": 1.15,
    "notes": "False creation stamp",
    "createdBy": "user_123",
    "createdAt": "2010-01-01T00:00:00Z",
    "date": "2025-05"
  }
}
```

### Payload 10: Value Poisoning (Malformed Scope Metric)
An attacker attempts to write an invalid Scope integer (Scope 4) to confuse calculations.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/activities/act_1",
  "auth": { "uid": "user_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "act_1",
    "orgId": "org_123",
    "reportingPeriodId": "period_2025",
    "scope": 4,
    "categoryId": "stationary_combustions",
    "location": "Jakarta Depot",
    "activityAmount": 500,
    "activityUnit": "Liters",
    "emissionFactorId": "gasoline_id",
    "calculatedCO2e": 1.15,
    "notes": "Scope 4 does not exist under GHG Protocol",
    "createdBy": "user_123",
    "createdAt": "2026-05-28T05:00:00Z",
    "date": "2025-05"
  }
}
```

### Payload 11: Tampering system-generated AI Insights
An operator attempts to manually overwrite/edit AI Insights recommendations stored in the ledger.
```json
{
  "path": "/organizations/org_123/reportingPeriods/period_2025/insights/insight_abc",
  "auth": { "uid": "contributor_123", "token": { "email_verified": true } },
  "operation": "update",
  "data": {
    "id": "insight_abc",
    "orgId": "org_123",
    "reportingPeriodId": "period_2025",
    "summaryText": "Malicious text injected.",
    "createdAt": "2026-05-28T05:00:00Z",
    "modelName": "Hacked Model"
  }
}
```

### Payload 12: Orphaned Activity Setup
An attacker attempts to associate an activity with an organization without verifying the related organization's existence.
```json
{
  "path": "/organizations/non_existent_org/reportingPeriods/period_2025/activities/act_1",
  "auth": { "uid": "attacker_123", "token": { "email_verified": true } },
  "operation": "create",
  "data": {
    "id": "act_1",
    "orgId": "non_existent_org",
    "reportingPeriodId": "period_2025",
    "scope": 1,
    "categoryId": "stationary_combustions",
    "location": "Jakarta Depot",
    "activityAmount": 500,
    "activityUnit": "Liters",
    "emissionFactorId": "gasoline_id",
    "calculatedCO2e": 1.15,
    "notes": "Orphaned creation",
    "createdBy": "attacker_123",
    "createdAt": "2026-05-28T05:00:00Z",
    "date": "2025-05"
  }
}
```
