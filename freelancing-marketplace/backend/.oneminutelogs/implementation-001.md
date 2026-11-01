# OneMinute Logs — Implementation Plan 001
Express · @oneminutelogs/express · npm · 2026-11-01

## Proposed events

| File · function | eventName | level | message | attributes | status |
|---|---|---|---|---|---|
| src/modules/auth/auth.controller.ts · signUp | auth.signup.succeeded | info | User signed up | user.id | new |
| src/modules/client/client.controller.ts · upsertClientProfile | user.updated | info | User updated | user.id | new |
| src/modules/freelancer/freelancer.controller.ts · upsertFreelancerProfile | user.updated | info | User updated | user.id | new |
| src/modules/jobs/jobs.controller.ts · createClientJobPost | order.created | info | Order created | order.id | new |
| src/modules/freelancer/freelancer.service.ts · uploadPortfolioImages | storage.succeeded | info | Object stored | storage.bucket, storage.key, file.size_bytes, file.content_type | new |
| src/modules/freelancer/freelancer.service.ts · uploadPortfolioImages | storage.failed | error | Object store failed | storage.bucket, error.type | new |
| src/modules/jobs/jobs.service.ts · uploadDocuments | storage.succeeded | info | Object stored | storage.bucket, storage.key, file.size_bytes, file.content_type | new |
| src/modules/jobs/jobs.service.ts · uploadDocuments | storage.failed | error | Object store failed | storage.bucket, error.type | new |

## Workflows deliberately skipped

- **auth.login.\*** — no login endpoint in this backend; Clerk handles authentication externally, the backend only verifies tokens via the auth middleware.
- **payment.\*** — no payment integration implemented in this codebase.
- **webhook.\*** — no webhook endpoints implemented.
- **job.\* / task.\*** — no background job workers; the `jobs` module handles job postings (client-facing listings), not async background jobs.
- **notification.\*** — no outbound notification sending implemented.
- **db.query.\* / db.migration.\*** — database operations are handled by Drizzle ORM; no direct query instrumentation at this phase.
- **Per-request HTTP success** — automatic telemetry covers this; logging every successful request would be noise per conventions.md §7.

## Notes

- `user.updated` is not in the §7 registry; derived per conventions.md §6 step 7: message "User updated", level `info` (from `updated` outcome default). `user` is a root entity per §4, so no object segment.
- `order.created` maps job-post creation to the `order` domain (closest fit per §6: "pick the closest domain and use the object/qualifier segments").
- Controllers use `request.logger` (attached by `withOneMinuteLogs` middleware); services use `createLogger(...)` standalone instance with the same `projectName: "backend"`.
