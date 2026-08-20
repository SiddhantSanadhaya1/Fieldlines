# Idea Refine: FIEL-18 Job Ingestion REST API

## Problem Statement
**How Might We** construct a robust, rate-limited REST API endpoint (`POST /api/v1/jobs/ingest`) that enables external scheduling systems to programmatically create field jobs with full input validation, OpenAPI documentation, and initial state tracking?

---

## 3–5 Sharpening Questions & Context

1. **Who is this for?**
   External dispatch software (e.g. Salesforce Field Service, ServiceNow, SAP) and dispatchers needing programmatically ingested jobs.
2. **What does success look like?**
   - Endpoint: `POST /api/v1/jobs/ingest`
   - Required Fields: `jobType`, `siteAddress`, `appointmentWindow` (`start`, `end`), `customerContact` (`name`, `phone`, `email`), `assignedTechnicianId`.
   - Returns: `201 Created` with `{ id: "JOB-xxx", status: "CREATED", createdAt: "..." }`.
   - Input Validation: Rejects malformed payload (400 Bad Request with field errors).
   - Rate Limiting: Protects against burst spam (e.g., max 100 requests / minute per client token).
   - OpenAPI Spec: Exported Swagger / OpenAPI 3.0 YAML/JSON specification.
3. **Why now?**
   Prerequisite for external dispatchers to populate the job queue before technicians sync their devices.

---

## 5–8 Variations & Lenses

1. **Synchronous Validation & Ingest (Lens: Direct Spec)**
   Validate payload schema synchronously, insert job into database, return 201 Created with initial state.
2. **Rate-Limited API Key Authentication (Lens: Security & Hardening)**
   Require `X-API-Key` or `Bearer token` header with middleware rate limiting (Token Bucket / Fixed Window).
3. **OpenAPI Schema-First Generator (Lens: Developer Experience)**
   Generate OpenAPI 3.0 JSON specification directly from TypeScript interfaces or Zod schemas.

---

## Strategic Directions

### Direction 1: Express REST Ingest Endpoint with Schema Validation & OpenAPI (Recommended MVP)
- `POST /api/v1/jobs/ingest` handler.
- Input validation module for payload structure & appointment window validity.
- Rate-limiting middleware simulation.
- OpenAPI 3.0 specification file export (`docs/openapi/job-ingest-api.yaml`).

---

## One-Pager Recommendation & MVP Scope

- **Recommended Direction:** Direction 1 (Express REST Ingest Endpoint with Schema Validation & OpenAPI).
- **MVP Scope:**
  - TypeScript interfaces: `IngestJobPayload`, `IngestJobResponse`, `IngestErrorResponse`.
  - Validator function: `validateIngestPayload(payload)`.
  - Ingest service/controller: `handleJobIngest(payload, options)`.
  - OpenAPI 3.0 Spec document.
  - Unit test suite covering 201 Created, 400 Bad Request, and 429 Rate Limit.
