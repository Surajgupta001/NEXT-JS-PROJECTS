# ReelKit

A minimal, real-world video uploader built with Next.js and ImageKit. Users can register, sign in, upload videos directly to ImageKit using signed auth, and view a simple gallery. Data is stored in MongoDB via Mongoose.

## Project overview

ReelKit demonstrates a production-friendly upload flow:

- Client uploads directly to ImageKit via the `@imagekit/next` SDK using short‑lived auth from your API.
- After a successful upload, the client persists metadata (title, description, video URL, thumbnail URL) in MongoDB.
- Authenticated users can create videos; all visitors can view the gallery.

Key pages:

- `/` — Video gallery (Server Component)
- `/upload` — Authenticated upload form (Client Component)
- `/login`, `/register` — Credentials auth

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- NextAuth (Credentials Provider, JWT sessions)
- MongoDB + Mongoose
- ImageKit (direct uploads + delivery URLs)
- Turbopack dev/build, ESLint

## Architecture & data flow

1. Client requests signed upload params from your API. `GET /api/auth/imagekit-auth` returns `{ expire, token, signature, publicKey }` using `getUploadAuthParams` on the server.

1. Client uploads the file directly to ImageKit using `upload()` from `@imagekit/next` with the signed params. Progress events update a local progress bar.

1. Client saves video metadata in MongoDB. `POST /api/video` stores `{ title, description, videoUrl, thumbnailUrl, controls, transformation }`. This is protected with `getServerSession(authOptions)` so only authenticated users can create records.

1. Server‑rendered gallery. The `/` page fetches from MongoDB on the server and renders the list with `<video>` tags.

### Important folders

- `app/` — App Router pages and route handlers
  - `app/page.tsx` — gallery
  - `app/upload/page.tsx` — upload form
  - `app/api/video/route.ts` — GET/POST video metadata
  - `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
  - `app/api/auth/register/route.ts` — signup
  - `app/api/auth/imagekit-auth/route.ts` — ImageKit upload auth
- `app/components/` — `providers.tsx` (NextAuth + ImageKit providers), `fileUpload.tsx` (upload widget)
- `lib/` — `auth.ts`, `database.ts`, `api_client.ts`
- `models/` — `user.ts`, `video.ts`

## API summary

- `GET /api/video` — List videos (public)
- `POST /api/video` — Create video (auth required)
- `POST /api/auth/register` — Register user
- `GET|POST /api/auth/[...nextauth]` — NextAuth endpoints
- `GET /api/auth/imagekit-auth` — Generate signed upload params

## Environment variables

Add a `.env.local` file with:

```ini
NEXT_PUBLIC_URL_ENDPOINT=ik.imagekit.io/your_public_endpoint
NEXT_PUBLIC_PUBLIC_KEY=public_key_from_imagekit
IMAGEKIT_PRIVATE_KEY=private_key_from_imagekit

MONGODB_URI=mongodb+srv://user:pass@cluster/dbname

NEXTAUTH_SECRET=complex_random_string
# NEXTAUTH_URL=http://localhost:3000  # set in dev or on deploy
```

## Getting started

1. Install dependencies

```bash
npm install
```

1. Run the dev server

```bash
npm run dev
```

1. Open <http://localhost:3000>

1. Register, sign in, then upload a video on `/upload`.

## Real‑world uses

- E‑commerce: product demo videos uploaded by merchants
- UGC platforms: creators upload reels/shorts for review and publishing
- Marketing: landing pages embedding hosted videos with transformations
- Education/LMS: instructors uploading course content
- Newsrooms: quick clip uploads from the field

## Notes & constraints

- Client‑side validation limits files to ≤ 100MB and enforces image/video MIME types.
- Direct uploads keep large files off your server; only metadata is stored in MongoDB.
- Authentication uses credentials; consider SSO providers for production.
- Tailwind v4 is enabled via `@import "tailwindcss";` in `app/globals.css` and `@tailwindcss/postcss` in PostCSS.

## Next steps (ideas)

- Drag‑and‑drop, multiple files, and cancel/resume uploads
- Generate thumbnails from video frames via ImageKit transformations
- Delete videos + metadata; soft‑delete/audit logs
- Pagination, search, and tags in the gallery
- Role‑based access (creator, editor, admin)
- Webhooks to confirm processing status or transcodes

---

If you need help deploying ReelKit (Vercel, env setup, ImageKit config), open an issue or ask for a deploy checklist.

