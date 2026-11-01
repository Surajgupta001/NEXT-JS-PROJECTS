# OneMinute Logs — Report 001
Express · @oneminutelogs/express@1.2.0 · npm · 2026-11-01

## Events instrumented (8)

| # | File · function | eventName | level | message | attributes |
|---|---|---|---|---|---|
| 1 | src/modules/auth/auth.controller.ts · signUp | auth.signup.succeeded | info | User signed up | user.id |
| 2 | src/modules/client/client.controller.ts · upsertClientProfile | user.updated | info | User updated | user.id |
| 3 | src/modules/freelancer/freelancer.controller.ts · upsertFreelancerProfile | user.updated | info | User updated | user.id |
| 4 | src/modules/jobs/jobs.controller.ts · createClientJobPost | order.created | info | Order created | order.id |
| 5 | src/modules/freelancer/freelancer.service.ts · uploadPortfolioImages | storage.succeeded | info | Object stored | storage.bucket, storage.key, file.content_type |
| 6 | src/modules/freelancer/freelancer.service.ts · uploadPortfolioImages | storage.failed | error | Object store failed | storage.bucket, error.type |
| 7 | src/modules/jobs/jobs.service.ts · uploadDocuments | storage.succeeded | info | Object stored | storage.bucket, storage.key, file.content_type |
| 8 | src/modules/jobs/jobs.service.ts · uploadDocuments | storage.failed | error | Object store failed | storage.bucket, error.type |

## Files changed

- `src/app.ts` — registered `withOneMinuteLogs` middleware (projectName: "backend")
- `src/modules/auth/auth.controller.ts` — added `auth.signup.succeeded` call
- `src/modules/client/client.controller.ts` — added `user.updated` call
- `src/modules/freelancer/freelancer.controller.ts` — added `user.updated` call
- `src/modules/freelancer/freelancer.service.ts` — added `createLogger`, `storage.succeeded`, `storage.failed` calls
- `src/modules/jobs/jobs.controller.ts` — added `order.created` call
- `src/modules/jobs/jobs.service.ts` — added `createLogger`, `storage.succeeded`, `storage.failed` calls
- `.oneminutelogs/implementation-001.md` — implementation plan (created in Phase 6)
- `.oneminutelogs/report-001.md` — this report

## Skipped workflows

- `auth.login.*` — no login endpoint; Clerk handles auth externally, backend only verifies tokens
- `payment.*` — no payment integration implemented
- `webhook.*` — no webhook endpoints implemented
- `job.*` / `task.*` — the `jobs` module handles client-facing job postings, not async background jobs
- `notification.*` — no outbound notification sending implemented
- `db.query.*` / `db.migration.*` — Drizzle ORM handles DB; no direct query instrumentation at this phase
- Per-request HTTP success — automatic telemetry covers this; logging every success would be noise (per conventions.md §7)

## How to see the events

Dashboard: log in to OneMinute Logs and view events scoped to the `backend` project (API key's project).

Programmatic reads via the SDK:

```ts
import { getLogs, getStream } from '@oneminutelogs/express';

const { logs } = await getLogs(
  {
    apiKey: process.env.ONE_MINUTE_LOGS_API_KEY!,
    projectName: 'backend',
  },
  { type: 'error', range: '24h', limit: 50 },
);

const stream = getStream(
  {
    apiKey: process.env.ONE_MINUTE_LOGS_API_KEY!,
    projectName: 'backend',
  },
  { type: 'error' },
);
for await (const event of stream.events) {
  console.log(event.level, event.message);
}
stream.close();
```

Filters: `type` (level), `env`, `appName` (service name), `search` (message substring),
`range` (`getLogs` only, e.g. `"24h"`), `limit`.

Setup is complete.
