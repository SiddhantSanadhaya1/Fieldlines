# Jira Tasks
_Fetched: 2026-08-14. 100 tickets total._

## [FIEL-23] As a technician, I want to see my ordered job list with appointment windows so I know the day's plan
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-23
**Labels:** None

### What to build
Display assigned jobs sorted by appointment window start time. Show job type, customer name, address, appointment window, travel time estimate. Visual indicator for overdue or urgent jobs. Tap job to see full detail. Refresh on pull-down when online.

### Acceptance Criteria
- [ ] Implement work described in FIEL-23: As a technician, I want to see my ordered job list with appointment windows so I know the day's plan

## [FIEL-28] As a dispatcher, I want to see which jobs have synced and which are held on devices so I know the system state
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-28
**Labels:** None

### What to build
Web console view showing all jobs with sync status (synced, pending on device, conflict). Real-time update when device syncs. Filterable by technician, job type, sync state. Drill into specific job to see what is pending (state, evidence, measurements).

### Acceptance Criteria
- [ ] Implement work described in FIEL-28: As a dispatcher, I want to see which jobs have synced and which are held on devices so I know the system state

## [FIEL-18] As a dispatcher, I want a job ingest API so external scheduling systems can create jobs in Fieldline
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-18
**Labels:** None

### What to build
REST API endpoint accepting job type, site address, appointment window, customer contact, assigned technician. Validates input, creates job, returns job ID and initial state. Documented with OpenAPI spec. Rate-limited to prevent abuse. External scheduler calls this API; assigned technician sees job on next sync.

### Acceptance Criteria
- [x] Implement work described in FIEL-18: As a dispatcher, I want a job ingest API so external scheduling systems can create jobs in Fieldline

## [FIEL-26] As a product manager, I want reviewer verdicts paired with on-site findings so I can measure check accuracy
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-26
**Labels:** None

### What to build
When reviewer disagrees with on-site finding (e.g., on-device check said 'connector seated' but reviewer sees it is not), both findings are kept as a pair in job record. Generate accuracy report: precision = upheld findings / all findings, recall = upheld / all reviewer-found defects. Segment by job type, step, model version. This report measures whether the check itself is working.

### Acceptance Criteria
- [ ] Implement work described in FIEL-26: As a product manager, I want reviewer verdicts paired with on-site findings so I can measure check accuracy

## [FIEL-25] As a technician, I want immediate feedback on photo quality so I can retake before leaving the site
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-25
**Labels:** None

### What to build
After capturing photo, on-device model assesses focus (Laplacian variance), exposure (histogram analysis), framing (subject bounding box vs target region), and subject presence. Inference completes in <500ms on target device. If issue detected, advisory overlay shows specific problem (blurry, underexposed, subject not centered) with one-tap retake or accept-anyway. Override reason recorded.

### Acceptance Criteria
- [ ] Implement work described in FIEL-25: As a technician, I want immediate feedback on photo quality so I can retake before leaving the site

## [FIEL-21] As a technician, I want to record measurements with validation so I catch issues before leaving site
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-21
**Labels:** None

### What to build
Measurement step shows expected range inline. Enter numeric value with unit picker (V, A, dB, Ω). Out-of-range value blocks step completion unless override reason provided. Historical trend from previous visits shown if available.

### Acceptance Criteria
- [ ] Implement work described in FIEL-21: As a technician, I want to record measurements with validation so I catch issues before leaving site

## [FIEL-20] As a technician, I want to complete a mandatory risk assessment before starting work so safety is enforced
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-20
**Labels:** None

### What to build
Safety gate step shows hazard checklist (height, electrical, confined space, traffic, lone worker). Select applicable hazards, confirm controls in place. Gate blocks job progress (cannot move to next step) until complete. Assessment saved as structured data with job record.

### Acceptance Criteria
- [ ] Implement work described in FIEL-20: As a technician, I want to complete a mandatory risk assessment before starting work so safety is enforced

## [FIEL-22] As a technician, I want to transition jobs through Accept → Travelling → On site → In progress → Complete so the office knows my status
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-22
**Labels:** None

### What to build
Implement state machine with explicit transitions. Each transition captures timestamp and location (if available). Buttons enabled/disabled based on current state. State changes recorded locally and queued for sync. Abort flow available from any state with typed reason selection.

### Acceptance Criteria
- [ ] Implement work described in FIEL-22: As a technician, I want to transition jobs through Accept → Travelling → On site → In progress → Complete so the office knows my status

## [FIEL-13] As a dispatcher, I want to manually create and assign jobs so I can handle ad-hoc work
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-13
**Labels:** None

### What to build
Web console form to create job: select job type, enter site address, set appointment window, select technician. Job immediately appears in technician's app on next sync. Validation prevents overlapping appointments for same technician.

### Acceptance Criteria
- [ ] Implement work described in FIEL-13: As a dispatcher, I want to manually create and assign jobs so I can handle ad-hoc work

## [FIEL-12] As a supervisor, I want a review queue prioritizing jobs by risk so I focus on the most critical work
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-12
**Labels:** None

### What to build
Web dashboard showing completed jobs with priority ranking: findings overridden, out-of-range measurements carried forward, checks that did not run, first jobs on new procedures, jobs from probationary technicians. Each job row shows: technician, job type, completion time, finding count, override count. Tap to drill into full job detail with steps, evidence, findings, and timings on one screen.

### Acceptance Criteria
- [ ] Implement work described in FIEL-12: As a supervisor, I want a review queue prioritizing jobs by risk so I focus on the most critical work

## [FIEL-24] As a technician, I want steps requiring qualifications to check my certifications so I don't attempt work I'm not certified for
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-24
**Labels:** None

### What to build
Steps tagged with required qualification (e.g., 'High voltage cert', 'Confined space entry'). System checks technician profile. If cert missing or expired, step is locked and displays which qualification is needed. Technician cannot proceed; must escalate to supervisor for reassignment.

### Acceptance Criteria
- [ ] Implement work described in FIEL-24: As a technician, I want steps requiring qualifications to check my certifications so I don't attempt work I'm not certified for

## [FIEL-11] As a technician, I want a completion checklist before closing a job so I don't miss required steps
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-11
**Labels:** None

### What to build
When technician taps 'Complete', system scans all procedure steps and lists any unsatisfied required steps. Each item links directly to the incomplete step. Job cannot be marked complete until all blockers are resolved. Checklist shows count (e.g., '3 items remaining') and updates in real-time as steps are completed.

### Acceptance Criteria
- [ ] Implement work described in FIEL-11: As a technician, I want a completion checklist before closing a job so I don't miss required steps

## [FIEL-14] As a developer, I want to provision SQLite with CRDT primitives so job state can be modified offline and synced deterministically
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-14
**Labels:** None

### What to build
Implement local SQLite store with CRDT structure for job state. Use proven library (Automerge, WatermelonDB, or Realm Sync) rather than custom CRDT. Support 5-day capacity for typical technician workload (20-30 jobs). Validate on target device (oldest in fleet per NFR-1).

### Acceptance Criteria
- [ ] Implement work described in FIEL-14: As a developer, I want to provision SQLite with CRDT primitives so job state can be modified offline and synced deterministically

## [FIEL-27] As a technician, I want to scan equipment labels and barcodes so serial numbers are captured accurately
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-27
**Labels:** None

### What to build
Camera-based OCR and 1D/2D barcode reader for equipment labels. Detected serial is displayed for confirmation before committing to part record. Manual entry always available as fallback. Uses Google ML Kit (Android) or Apple Vision (iOS) for on-device recognition. Works offline.

### Acceptance Criteria
- [ ] Implement work described in FIEL-27: As a technician, I want to scan equipment labels and barcodes so serial numbers are captured accurately

## [FIEL-19] As a technician, I want faces automatically blurred in photos so bystander privacy is protected
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-19
**Labels:** None

### What to build
On-device face detection (Google ML Kit / Apple Vision) runs on captured image before storage. Detected face regions are blurred with Gaussian filter. Blurred image replaces original in storage. Only blurred version leaves device. If no face detected, image stored unmodified. Works offline.

### Acceptance Criteria
- [ ] Implement work described in FIEL-19: As a technician, I want faces automatically blurred in photos so bystander privacy is protected

## [FIEL-16] As a technician, I want to follow a typed procedure with clear steps so I know what to do at each stage
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-16
**Labels:** None

### What to build
Render procedure as vertical step list with types: instruction, measurement, photo, part, test, safety gate, signature. Current step highlighted. Required vs advisory clearly indicated (bold vs regular). Tap step to expand detail. Mark step complete when done. Cannot mark later step complete until prior required step is done.

### Acceptance Criteria
- [ ] Implement work described in FIEL-16: As a technician, I want to follow a typed procedure with clear steps so I know what to do at each stage

## [FIEL-7] As a technician, I want my job state changes to sync to the server when connectivity returns so my work is never lost
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-7
**Labels:** None

### What to build
Background sync service that detects connectivity, queues local changes, and pushes to server. Device-authoritative for site actions, server-authoritative for assignment. Handles interruption (kill, reboot, low battery) and resumes without data loss. Sync status visible per job.

### Acceptance Criteria
- [ ] Implement work described in FIEL-7: As a technician, I want my job state changes to sync to the server when connectivity returns so my work is never lost

## [FIEL-15] As a technician, I want to record parts consumed during the job so inventory is accurate
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-15
**Labels:** None

### What to build
At completion, list all part-type steps. For each, confirm item fitted (yes/no), enter serial number if present, and optionally record item removed (with serial). Parts list synced with job record for inventory reconciliation.

### Acceptance Criteria
- [ ] Implement work described in FIEL-15: As a technician, I want to record parts consumed during the job so inventory is accurate

## [FIEL-10] As a technician, I want to capture customer sign-off with a readable summary so the customer knows what they're confirming
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-10
**Labels:** None

### What to build
Generate plain-language summary of work: 'Installed 1x ONT (serial: X), fitted 1x cable (type: Y), tested line (result: pass, 235V measured)'. Customer reads summary, signs on-screen with finger/stylus, or declines. If declined, technician selects typed reason (dispute quality, dispute charge, not authorized signatory, customer unavailable). PDF or text summary sent to customer email if provided.

### Acceptance Criteria
- [ ] Implement work described in FIEL-10: As a technician, I want to capture customer sign-off with a readable summary so the customer knows what they're confirming

## [FIEL-9] As a supervisor, I want to return a job for rework with specific evidence attached so the technician knows what to fix
**Project:** Fieldlines | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-9
**Labels:** None

### What to build
From job detail view, click 'Return for rework'. Select specific step and evidence that failed. Enter reason (connector not seated, label illegible, wrong component, insufficient testing). Returned job re-enters 'In progress' state in technician's app with original evidence and finding visible. Works even if different technician is reassigned.

### Acceptance Criteria
- [ ] Implement work described in FIEL-9: As a supervisor, I want to return a job for rework with specific evidence attached so the technician knows what to fix

## [FIEL-17] As a technician, I want to capture photos with metadata even offline so evidence is bound to the job step
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-17
**Labels:** None

### What to build
Camera integration capturing photo with timestamp, location (if available), device ID, and technician ID. Store locally in app sandbox, bind to job step, queue for background upload. Photo accessible immediately in job detail view even before upload completes.

### Acceptance Criteria
- [ ] Implement work described in FIEL-17: As a technician, I want to capture photos with metadata even offline so evidence is bound to the job step

## [FIEL-8] As a technician, I want to pre-fetch my day's job pack before leaving base so I have all details offline
**Project:** Fieldlines | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-8
**Labels:** None

### What to build
Automatic download of job details, site notes, access instructions, reference diagrams, and procedures when job is assigned. Triggered by manual sync button or scheduled overnight sync. Progress indicator shows what is downloaded. Works on WiFi to avoid metered data charges.

### Acceptance Criteria
- [ ] Implement work described in FIEL-8: As a technician, I want to pre-fetch my day's job pack before leaving base so I have all details offline

## [FIEL-42] Build summary generator from job steps (parts, tests, measurements)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-42
**Labels:** None

### What to build
Parse completed steps, extract parts fitted, tests run, measurements taken. Format as human-readable sentences.

### Acceptance Criteria
- [ ] Implement work described in FIEL-42: Build summary generator from job steps (parts, tests, measurements)

## [FIEL-51] Build completion checklist UI with navigation to incomplete steps
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-51
**Labels:** None

### What to build
Modal showing remaining items as clickable list. Tap item navigates to step in procedure. Real-time count update.

### Acceptance Criteria
- [ ] Implement work described in FIEL-51: Build completion checklist UI with navigation to incomplete steps

## [FIEL-39] Generate and send PDF or text summary to customer email
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-39
**Labels:** None

### What to build
Optional feature. Use PDFKit (iOS) or iTextG (Android) to render summary + signature. Email via backend service.

### Acceptance Criteria
- [ ] Implement work described in FIEL-39: Generate and send PDF or text summary to customer email

## [FIEL-84] Integrate WebSocket or polling for real-time sync status updates
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-84
**Labels:** None

### What to build
Push sync events to connected consoles. Fallback to 30-second poll if WebSocket unavailable.

### Acceptance Criteria
- [ ] Implement work described in FIEL-84: Integrate WebSocket or polling for real-time sync status updates

## [FIEL-91] Implement step-level certification check in procedure renderer
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-91
**Labels:** None

### What to build
Compare step.required_qualification to technician.certifications. If missing or expired, lock step and show reason.

### Acceptance Criteria
- [ ] Implement work described in FIEL-91: Implement step-level certification check in procedure renderer

## [FIEL-49] Implement completion validation logic scanning required steps
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-49
**Labels:** None

### What to build
Query all procedure steps where required=true. Check completion status. Return list of incomplete with step IDs and titles.

### Acceptance Criteria
- [ ] Implement work described in FIEL-49: Implement completion validation logic scanning required steps

## [FIEL-77] Implement override flow with typed reason selection
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-77
**Labels:** None

### What to build
Modal with reasons: faulty meter, non-standard site, customer request, manufacturer variance. Reason saved with measurement.

### Acceptance Criteria
- [ ] Implement work described in FIEL-77: Implement override flow with typed reason selection

## [FIEL-37] Implement signature capture UI with decline flow
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-37
**Labels:** None

### What to build
Canvas for signature, Save/Clear/Decline buttons. Decline opens reason modal. Signature saved as PNG with timestamp.

### Acceptance Criteria
- [ ] Implement work described in FIEL-37: Implement signature capture UI with decline flow

## [FIEL-89] Bind confirmed serial to part record and sync with job
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-89
**Labels:** None

### What to build
Store serial in part-consumed record. Mark as OCR-read vs manual-entry for quality tracking.

### Acceptance Criteria
- [ ] Implement work described in FIEL-89: Bind confirmed serial to part record and sync with job

## [FIEL-82] Write integration tests for API with valid, invalid, and rate-limit scenarios
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-82
**Labels:** None

### What to build
Test valid creation, invalid payload (400), unknown technician (404), rate limit (429). CI-integrated.

### Acceptance Criteria
- [ ] Implement work described in FIEL-82: Write integration tests for API with valid, invalid, and rate-limit scenarios

## [FIEL-74] Implement abort flow with typed reason selection
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-74
**Labels:** None

### What to build
Modal with reasons: no access, unsafe, missing part, out of scope, customer refused, site not ready. Reason persisted with job.

### Acceptance Criteria
- [ ] Implement work described in FIEL-74: Implement abort flow with typed reason selection

## [FIEL-85] Extend technician profile schema with certifications (type, issue date, expiry)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-85
**Labels:** None

### What to build
Add certifications array to technician entity. Synced to device with job pack.

### Acceptance Criteria
- [ ] Implement work described in FIEL-85: Extend technician profile schema with certifications (type, issue date, expiry)

## [FIEL-90] Build job list UI with sort by appointment window
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-90
**Labels:** None

### What to build
React Native FlatList. Show job type, address, window. Visual indicator for overdue (red), upcoming (amber).

### Acceptance Criteria
- [ ] Implement work described in FIEL-90: Build job list UI with sort by appointment window

## [FIEL-81] Implement job detail view showing pending elements
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-81
**Labels:** None

### What to build
State transition pending, evidence count pending upload, measurements pending. Human-readable descriptions.

### Acceptance Criteria
- [ ] Implement work described in FIEL-81: Implement job detail view showing pending elements

## [FIEL-69] Build accuracy report query: precision and recall by job type, step, model version
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-69
**Labels:** None

### What to build
SQL/aggregation query: precision = upheld / all findings, recall = upheld / (upheld + reviewer-found). Group by job type, step, model.

### Acceptance Criteria
- [ ] Implement work described in FIEL-69: Build accuracy report query: precision and recall by job type, step, model version

## [FIEL-76] Fetch and display historical measurement trend from previous visits
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-76
**Labels:** None

### What to build
API returns previous 3 measurements for this site + step. Display in UI with dates. Graceful if no history.

### Acceptance Criteria
- [ ] Implement work described in FIEL-76: Fetch and display historical measurement trend from previous visits

## [FIEL-73] Log check execution: input image ID, model version, finding, confidence, timestamp
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-73
**Labels:** None

### What to build
Store in local DB with image record. Synced with job. Enables later accuracy measurement per QCK-5.5.

### Acceptance Criteria
- [ ] Implement work described in FIEL-73: Log check execution: input image ID, model version, finding, confidence, timestamp

## [FIEL-58] Implement backend job creation API with overlap validation
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-58
**Labels:** None

### What to build
POST /jobs. Validate technician availability, no overlapping windows. Return 409 if conflict.

### Acceptance Criteria
- [ ] Implement work described in FIEL-58: Implement backend job creation API with overlap validation

## [FIEL-87] Integrate Google ML Kit (Android) or Apple Vision (iOS) for OCR and barcode
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-87
**Labels:** None

### What to build
Camera view with live detection overlay. Detect 1D, 2D barcodes, and OCR text. Return detected string.

### Acceptance Criteria
- [ ] Implement work described in FIEL-87: Integrate Google ML Kit (Android) or Apple Vision (iOS) for OCR and barcode

## [FIEL-79] Implement API endpoint with validation and rate limiting
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-79
**Labels:** None

### What to build
Express/FastAPI route. Validate payload, check technician exists, create job, return 201. Rate limit with redis/in-memory store.

### Acceptance Criteria
- [ ] Implement work described in FIEL-79: Implement API endpoint with validation and rate limiting

## [FIEL-71] Build job detail UI with state transition buttons
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-71
**Labels:** None

### What to build
Show current state, available transitions, disable invalid buttons. Confirmation dialog for Complete and Abort.

### Acceptance Criteria
- [ ] Implement work described in FIEL-71: Build job detail UI with state transition buttons

## [FIEL-68] Implement photo binding to job step with immutable record
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-68
**Labels:** None

### What to build
Foreign key to step, metadata JSON, capture timestamp. Prevent metadata edit per EVD-4.4.

### Acceptance Criteria
- [ ] Implement work described in FIEL-68: Implement photo binding to job step with immutable record

## [FIEL-57] Implement SQLite schema with CRDT structure for job entity
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-57
**Labels:** None

### What to build
Job state machine (Assigned → Complete), timestamps, location, technician, evidence references. Index for sync queries.

### Acceptance Criteria
- [ ] Implement work described in FIEL-57: Implement SQLite schema with CRDT structure for job entity

## [FIEL-60] Build review queue table with sortable columns and risk score indicator
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-60
**Labels:** None

### What to build
React table with columns: technician, job type, completion time, findings, overrides, risk score. Click to detail view.

### Acceptance Criteria
- [x] Implement work described in FIEL-60: Build review queue table with sortable columns and risk score indicator

## [FIEL-66] Extend job record schema to store finding pairs (on-site finding, reviewer verdict)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-66
**Labels:** None

### What to build
Add review_verdict object to finding record: verdict (upheld | rejected | missed), reviewer, timestamp.

### Acceptance Criteria
- [ ] Implement work described in FIEL-66: Extend job record schema to store finding pairs (on-site finding, reviewer verdict)

## [FIEL-88] Implement pull-to-refresh with server sync when online
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-88
**Labels:** None

### What to build
Detect pull gesture, trigger sync, display spinner, update list on completion. Graceful failure if offline.

### Acceptance Criteria
- [ ] Implement work described in FIEL-88: Implement pull-to-refresh with server sync when online

## [FIEL-54] Store assessment as structured JSON with job record
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-54
**Labels:** None

### What to build
Schema: selected hazards, controls confirmed, timestamp, technician. Synced with job state.

### Acceptance Criteria
- [ ] Implement work described in FIEL-54: Store assessment as structured JSON with job record

## [FIEL-80] Build web console job list with sync status column
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-80
**Labels:** None

### What to build
React table with filter by sync state, technician, job type. Real-time WebSocket update on sync events.

### Acceptance Criteria
- [ ] Implement work described in FIEL-80: Build web console job list with sync status column

## [FIEL-86] Log certification-block events for audit and supervisor notification
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-86
**Labels:** None

### What to build
Record: step ID, required cert, technician, timestamp. Optional: trigger notification to crew lead.

### Acceptance Criteria
- [ ] Implement work described in FIEL-86: Log certification-block events for audit and supervisor notification

## [FIEL-46] Implement Gaussian blur filter on detected face regions
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-46
**Labels:** None

### What to build
Apply blur to bounding box with padding. Replace original pixel data. Store blurred image only.

### Acceptance Criteria
- [ ] Implement work described in FIEL-46: Implement Gaussian blur filter on detected face regions

## [FIEL-83] Build serial confirmation UI with edit and manual entry fallback
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-83
**Labels:** None

### What to build
Dialog showing detected serial, Edit/Accept buttons. If no detection after 10s, show manual entry prompt.

### Acceptance Criteria
- [ ] Implement work described in FIEL-83: Build serial confirmation UI with edit and manual entry fallback

## [FIEL-43] Build mobile procedure renderer with step type components
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-43
**Labels:** None

### What to build
Vertical list, expand/collapse, type icons, bold for required. Disable skip logic. Current step highlight.

### Acceptance Criteria
- [ ] Implement work described in FIEL-43: Build mobile procedure renderer with step type components

## [FIEL-67] Integrate TensorFlow Lite or Core ML image quality model
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-67
**Labels:** None

### What to build
Prebuilt or custom model for focus (Laplacian), exposure (histogram), framing (bounding box). Model <5 MB. Runs on CPU.

### Acceptance Criteria
- [ ] Implement work described in FIEL-67: Integrate TensorFlow Lite or Core ML image quality model

## [FIEL-75] Build measurement input component with range validation
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-75
**Labels:** None

### What to build
Numeric keyboard, unit picker, expected range displayed inline. Compare input to range, show error if out-of-range.

### Acceptance Criteria
- [ ] Implement work described in FIEL-75: Build measurement input component with range validation

## [FIEL-56] Trigger push notification or sync signal to assigned technician
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-56
**Labels:** None

### What to build
Optional: push notification 'New job assigned'. Otherwise next scheduled sync picks it up.

### Acceptance Criteria
- [ ] Implement work described in FIEL-56: Trigger push notification or sync signal to assigned technician

## [FIEL-78] Design and document job ingest API contract (OpenAPI spec)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-78
**Labels:** None

### What to build
POST /api/v1/jobs. Request schema: job type, site, window, contact, technician. Response: job ID, state. Error codes.

### Acceptance Criteria
- [ ] Implement work described in FIEL-78: Design and document job ingest API contract (OpenAPI spec)

## [FIEL-64] Integrate native camera with metadata capture (time, location, device)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-64
**Labels:** None

### What to build
iOS UIImagePickerController / Android Camera2 API. Capture EXIF, location (if granted), timestamp. Store in app sandbox.

### Acceptance Criteria
- [ ] Implement work described in FIEL-64: Integrate native camera with metadata capture (time, location, device)

## [FIEL-72] Implement job state machine in domain layer
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-72
**Labels:** None

### What to build
Assigned → Accepted → Travelling → On site → In progress → Awaiting evidence → Complete. Validate transitions, record timestamp + location.

### Acceptance Criteria
- [ ] Implement work described in FIEL-72: Implement job state machine in domain layer

## [FIEL-70] Build parts consumed UI listing part steps with fitted toggle and serial input
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-70
**Labels:** None

### What to build
List all part-type steps. Toggle fitted yes/no, text input for serial (optional), toggle removed with serial input.

### Acceptance Criteria
- [ ] Implement work described in FIEL-70: Build parts consumed UI listing part steps with fitted toggle and serial input

## [FIEL-29] Build mobile download service with progress tracking
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-29
**Labels:** None

### What to build
Queue job packs, download in sequence, track per-job progress, store in SQLite, display progress in UI.

### Acceptance Criteria
- [ ] Implement work described in FIEL-29: Build mobile download service with progress tracking

## [FIEL-41] Implement background sync service with connectivity detection
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-41
**Labels:** None

### What to build
iOS WorkManager / Android WorkManager. Detect WiFi/cellular, defer on metered per OFF-2.6. Queue architecture for retry.

### Acceptance Criteria
- [ ] Implement work described in FIEL-41: Implement background sync service with connectivity detection

## [FIEL-52] Validate 5-day capacity and crash recovery on target device
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-52
**Labels:** None

### What to build
Synthetic load test with 30 jobs, forced kill, low storage scenario. Measure performance degradation.

### Acceptance Criteria
- [ ] Implement work described in FIEL-52: Validate 5-day capacity and crash recovery on target device

## [FIEL-59] Build job detail view showing steps, evidence, findings, measurements in single screen
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-59
**Labels:** None

### What to build
Tabbed or accordion layout. Evidence thumbnails with lightbox. Findings with confidence. Measurements with range. Timeline.

### Acceptance Criteria
- [x] Implement work described in FIEL-59: Build job detail view showing steps, evidence, findings, measurements in single screen

## [FIEL-65] Build web dashboard showing accuracy report with segmentation and trend
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-65
**Labels:** None

### What to build
Table or chart: precision/recall by segment. Trend over time. Export to CSV. Threshold alerts if precision <70%.

### Acceptance Criteria
- [ ] Implement work described in FIEL-65: Build web dashboard showing accuracy report with segmentation and trend

## [FIEL-63] Build post-capture advisory UI with retake and accept-anyway options
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-63
**Labels:** None

### What to build
Overlay showing issue name, one-tap retake button, accept-anyway with reason modal. Dismisses after 5 sec if no action.

### Acceptance Criteria
- [ ] Implement work described in FIEL-63: Build post-capture advisory UI with retake and accept-anyway options

## [FIEL-50] Implement blocking logic preventing job progress until gate complete
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-50
**Labels:** None

### What to build
Job state machine checks safety gate status. If incomplete, state transition to 'In progress' is blocked.

### Acceptance Criteria
- [ ] Implement work described in FIEL-50: Implement blocking logic preventing job progress until gate complete

## [FIEL-62] Store parts consumed record with job and sync to backend
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-62
**Labels:** None

### What to build
Schema: part type, fitted serial, removed serial, timestamp, technician. Foreign key to job. Synced with job close.

### Acceptance Criteria
- [ ] Implement work described in FIEL-62: Store parts consumed record with job and sync to backend

## [FIEL-45] Integrate face detection SDK (ML Kit / Vision) with confidence threshold
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-45
**Labels:** None

### What to build
Detect faces with bounding boxes. Blur if confidence >70%. Use conservative threshold to avoid false negatives.

### Acceptance Criteria
- [ ] Implement work described in FIEL-45: Integrate face detection SDK (ML Kit / Vision) with confidence threshold

## [FIEL-61] Build chunked resumable upload service for media
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-61
**Labels:** None

### What to build
Chunk size 1 MB, track uploaded chunks, retry failed chunks, connection-type awareness (defer on metered per OFF-2.6).

### Acceptance Criteria
- [ ] Implement work described in FIEL-61: Build chunked resumable upload service for media

## [FIEL-40] Define procedure step schema with type union (instruction | measurement | photo | part | test | safety | signature)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-40
**Labels:** None

### What to build
JSON schema with common fields (id, title, description, required) and type-specific fields (unit, range for measurement).

### Acceptance Criteria
- [ ] Implement work described in FIEL-40: Define procedure step schema with type union (instruction | measurement | photo | part | test | safety | signature)

## [FIEL-34] Implement backend rework return logic: state transition, notification, job history
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-34
**Labels:** None

### What to build
Change job state to 'In progress', record return event with reason + step + evidence, trigger sync to device. Log in job history.

### Acceptance Criteria
- [ ] Implement work described in FIEL-34: Implement backend rework return logic: state transition, notification, job history

## [FIEL-55] Build job creation form in web console
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-55
**Labels:** None

### What to build
React form with job type dropdown, site autocomplete, appointment window picker, technician selector. Validation.

### Acceptance Criteria
- [ ] Implement work described in FIEL-55: Build job creation form in web console

## [FIEL-36] Build sync status UI showing per-job sync state
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-36
**Labels:** None

### What to build
Pending, syncing, synced, conflict. Accessible from job list and job detail. Real-time update when sync completes.

### Acceptance Criteria
- [ ] Implement work described in FIEL-36: Build sync status UI showing per-job sync state

## [FIEL-31] Implement job pack download API endpoint (backend)
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-31
**Labels:** None

### What to build
Returns job metadata, site notes, access instructions, procedure steps, reference media URLs. Paginated if needed.

### Acceptance Criteria
- [ ] Implement work described in FIEL-31: Implement job pack download API endpoint (backend)

## [FIEL-47] Spike CRDT libraries (Automerge, WatermelonDB, Realm) on iOS and Android
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-47
**Labels:** None

### What to build
Evaluate performance, size, and offline behavior on target device. Deliver recommendation with proof-of-concept.

### Acceptance Criteria
- [ ] Implement work described in FIEL-47: Spike CRDT libraries (Automerge, WatermelonDB, Realm) on iOS and Android

## [FIEL-53] Implement risk scoring algorithm for job prioritization
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-53
**Labels:** None

### What to build
Score = (overrides \* 3) + (out-of-range \* 2) + (failed checks \* 2) + (new procedure \* 1). Sort DESC. Persist score with job.

### Acceptance Criteria
- [x] Implement work described in FIEL-53: Implement risk scoring algorithm for job prioritization

## [FIEL-48] Build safety gate UI with hazard checklist
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-48
**Labels:** None

### What to build
Multi-select hazards from typed list. For each selected, show control confirmation checkboxes. All must be checked to proceed.

### Acceptance Criteria
- [ ] Implement work described in FIEL-48: Build safety gate UI with hazard checklist

## [FIEL-33] Build rework return UI in web console: step selector, reason input, evidence attachment
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-33
**Labels:** None

### What to build
Modal with step dropdown, reason text area, evidence thumbnail selector. Confirm button triggers state change.

### Acceptance Criteria
- [ ] Implement work described in FIEL-33: Build rework return UI in web console: step selector, reason input, evidence attachment

## [FIEL-44] Log face blurring events: image ID, faces detected, confidence, processing time
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-44
**Labels:** None

### What to build
Audit log for privacy compliance. Include in check execution log. Synced with job.

### Acceptance Criteria
- [ ] Implement work described in FIEL-44: Log face blurring events: image ID, faces detected, confidence, processing time

## [FIEL-38] Implement step completion validation preventing skip
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-38
**Labels:** None

### What to build
Check prior required steps. If any incomplete, show error modal with step title and navigate to incomplete step.

### Acceptance Criteria
- [ ] Implement work described in FIEL-38: Implement step completion validation preventing skip

## [FIEL-35] Implement device-authoritative vs server-authoritative resolution logic
**Project:** Fieldlines | **Priority:** Medium | **Points:** 3 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-35
**Labels:** None

### What to build
Site actions (complete, evidence) device wins. Reassignment server wins. Explicit conflict surfacing per OFF-2.3.

### Acceptance Criteria
- [ ] Implement work described in FIEL-35: Implement device-authoritative vs server-authoritative resolution logic

## [FIEL-30] Implement connection-type awareness and WiFi-only defer for large media
**Project:** Fieldlines | **Priority:** Medium | **Points:** 1 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-30
**Labels:** None

### What to build
Check network type (WiFi, cellular, metered). Defer media >5 MB if not WiFi. User can override.

### Acceptance Criteria
- [ ] Implement work described in FIEL-30: Implement connection-type awareness and WiFi-only defer for large media

## [FIEL-32] Update mobile UI to surface rework jobs with original evidence and return reason
**Project:** Fieldlines | **Priority:** Medium | **Points:** 2 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-32
**Labels:** None

### What to build
Rework badge in job list. Detail view shows return reason banner, links to flagged step, displays original evidence inline.

### Acceptance Criteria
- [ ] Implement work described in FIEL-32: Update mobile UI to surface rework jobs with original evidence and return reason

## [FIEL-6] Epic: On-Device Quality Checks
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-6
**Labels:** None

### What to build
Implement real-time image quality assessment (focus, exposure, framing, subject presence) running on-device immediately after photo capture. Advise retakes while technician is still on-site. Add OCR and barcode reading for equipment serial numbers. Apply face blurring for bystander privacy. All checks work fully offline.

### Acceptance Criteria
- [ ] Implement work described in FIEL-6: Epic: On-Device Quality Checks

## [FIEL-4] Epic: Job Lifecycle & Day Plan
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-4
**Labels:** None

### What to build
Enable technicians to view assigned jobs, pre-fetch job packs before leaving base, execute the job state machine (Accept → Travelling → On site → In progress → Complete), and abort with typed reasons. Display ordered job list with appointment windows and travel sequence.

### Acceptance Criteria
- [ ] Implement work described in FIEL-4: Epic: Job Lifecycle & Day Plan

## [FIEL-5] Epic: Offline-First Foundation & Sync Engine
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-5
**Labels:** None

### What to build
Establish the core offline-first mobile architecture with SQLite storage, CRDT-based conflict resolution, and resumable sync engine. Enable technicians to work 5 days without connectivity and sync when network returns. This is the foundational layer for all field work.

### Acceptance Criteria
- [ ] Implement work described in FIEL-5: Epic: Offline-First Foundation & Sync Engine

## [FIEL-2] Epic: Customer Sign-Off & Completion Flow
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-2
**Labels:** None

### What to build
Implement pre-close validation checklist that blocks job completion until all required steps are satisfied. Capture customer sign-off with readable summary of work done, parts fitted, and tests performed. Record parts consumed with serial numbers. Support refusal-to-sign as valid outcome with typed reason.

### Acceptance Criteria
- [ ] Implement work described in FIEL-2: Epic: Customer Sign-Off & Completion Flow

## [FIEL-3] Epic: Procedure Engine & Safety Gates
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-3
**Labels:** None

### What to build
Render versioned procedures as sequences of typed steps (instruction, measurement, photo, part, test, safety gate, signature). Enforce blocking safety gates (risk assessment before work starts, certification checks), measurement validation, and skip-with-reason flow. Enable conditional step visibility based on site conditions.

### Acceptance Criteria
- [ ] Implement work described in FIEL-3: Epic: Procedure Engine & Safety Gates

## [FIEL-1] Epic: Supervisor Review Queue & Rework Loop
**Project:** Fieldlines | **Priority:** Medium | **Points:** - | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/FIEL-1
**Labels:** None

### What to build
Build web-based supervisor review queue showing completed jobs prioritized by findings, overrides, and risk. Enable reviewer to return jobs with specific evidence and reason, re-entering technician's queue for rework. Pair reviewer verdicts with on-site findings to measure check accuracy. Develop training data labelling workflow for future model improvements.

### Acceptance Criteria
- [ ] Implement work described in FIEL-1: Epic: Supervisor Review Queue & Rework Loop

## [OPSC-32] As a DevOps engineer, I need secure development environment with SOC 2 controls so that we can build and test with tenant isolation and audit logging
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-32
**Labels:** None

### What to build
Provision tenant-isolated infrastructure, configure encryption at rest/in transit, set up audit logging, and establish CI/CD pipeline with SOC 2 compliance checks.

### Acceptance Criteria
- [ ] Implement work described in OPSC-32: As a DevOps engineer, I need secure development environment with SOC 2 controls so that we can build and test with tenant isolation and audit logging

## [OPSC-18] As an AI engineer, I need Nova grounding strategy and refusal behavior specified so that we can build citation traceability and prevent hallucinations
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-18
**Labels:** None

### What to build
Define citation architecture, refusal messaging for out-of-scope queries, and evaluation harness for grounded vs. hallucinated responses.

### Acceptance Criteria
- [ ] Implement work described in OPSC-18: As an AI engineer, I need Nova grounding strategy and refusal behavior specified so that we can build citation traceability and prevent hallucinations

## [OPSC-25] As a risk analyst, I need supplier network graph built with tier-N inference so that I can see multi-tier supplier relationships with confidence bands
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-25
**Labels:** None

### What to build
Ingest tier-1 suppliers from client ERP, infer tier-2/3 relationships from public filings and customs data, and store in queryable graph database.

### Acceptance Criteria
- [ ] Implement work described in OPSC-25: As a risk analyst, I need supplier network graph built with tier-N inference so that I can see multi-tier supplier relationships with confidence bands

## [OPSC-8] As a data engineer, I need multi-modal signal ingestion pipeline live so that 6+ data streams can be ingested with 5-minute latency
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-8
**Labels:** None

### What to build
Implement connectors for financial, geopolitical, weather, logistics, ESG, cyber, and news streams with de-duplication and classification engine.

### Acceptance Criteria
- [ ] Implement work described in OPSC-8: As a data engineer, I need multi-modal signal ingestion pipeline live so that 6+ data streams can be ingested with 5-minute latency

## [OPSC-55] As a product manager, I need retail anchor industry discovery complete so that we can define accurate risk taxonomy and playbook requirements
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-55
**Labels:** None

### What to build
Interview reference client risk managers, document retail-specific risk taxonomy, and align with Firm content team on playbook delivery timeline.

### Acceptance Criteria
- [ ] Implement work described in OPSC-55: As a product manager, I need retail anchor industry discovery complete so that we can define accurate risk taxonomy and playbook requirements

## [OPSC-17] As a risk methodology lead, I need cyber-risk scoring methodology defined so that we can integrate cyber posture as a first-class risk dimension
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-17
**Labels:** None

### What to build
Define cyber posture scoring algorithm, identify Firm-procured data sources, and design integration points into composite risk score with transparency requirements.

### Acceptance Criteria
- [ ] Implement work described in OPSC-17: As a risk methodology lead, I need cyber-risk scoring methodology defined so that we can integrate cyber posture as a first-class risk dimension

## [OPSC-16] As a platform architect, I need signal ingestion architecture designed so that we can ingest 6+ data streams with 5-minute latency SLA
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 5 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-16
**Labels:** None

### What to build
Design multi-modal ingestion layer for financial, geopolitical, weather, logistics, ESG, cyber, and news streams with de-duplication and classification logic.

### Acceptance Criteria
- [ ] Implement work described in OPSC-16: As a platform architect, I need signal ingestion architecture designed so that we can ingest 6+ data streams with 5-minute latency SLA

## [OPSC-28] As a risk methodology lead, I need composite risk scoring engine with cyber dimension so that supplier risk scores reflect all risk factors transparently
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-28
**Labels:** None

### What to build
Implement scoring algorithm combining financial, geopolitical, ESG, concentration, and cyber components with transparent decomposition and change-history tracking.

### Acceptance Criteria
- [ ] Implement work described in OPSC-28: As a risk methodology lead, I need composite risk scoring engine with cyber dimension so that supplier risk scores reflect all risk factors transparently

## [OPSC-20] As a supply chain risk manager, I want an early-warning dashboard showing top-changing suppliers so that I can respond to emerging risks within 24 hours
**Project:** Operations Practice (Supply Chain) | **Priority:** Medium | **Points:** 8 | **Status:** To Do
**URL:** https://sidsanadhaya.atlassian.net/browse/OPSC-20
**Labels:** None

### What to build
Build responsive web dashboard showing 24-hour rolling supplier changes ranked by client impact, with configurable alert thresholds.

### Acceptance Criteria
- [ ] Implement work described in OPSC-20: As a supply chain risk manager, I want an early-warning dashboard showing top-changing suppliers so that I can respond to emerging risks within 24 hours
