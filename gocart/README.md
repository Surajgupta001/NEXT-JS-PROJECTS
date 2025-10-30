# GoCart

Modern multi-vendor e‑commerce built with Next.js App Router. Buyers can browse products, manage a cart, apply coupons, and checkout via Stripe. Sellers can create a store, get approved by an admin, list products (with an AI assistant that drafts titles/descriptions from an image), and manage orders. Admins can review and approve seller applications and manage the marketplace.

## Overview

High‑level capabilities and architecture are summarized below.

## Features

### Buyer experience

- Product browsing and detail pages
- Cart, address book, coupons, and checkout (COD or Stripe)
- Ratings and reviews
- Optional Plus membership gating via Clerk Protect (Free shipping for members)

### Seller (store) experience

- Create a store application (pending → approved by admin)
- Seller dashboard with sales overview
- Add/manage products, toggle stock, view and update order status
- AI assistant to generate title/description from the first uploaded product image

### Admin experience

- Approve or reject store applications
- Inspect stores and marketplace health

### Platform

- Stripe webhook to mark Stripe orders paid or clean up canceled payments
- Neon + Prisma for serverless-friendly Postgres
- Inngest functions for user sync and coupon expiry

## Tech stack

- Framework: Next.js 15 (App Router, Turbopack)
- UI: React 19, Tailwind CSS v4, lucide-react icons
- Auth: Clerk (`@clerk/nextjs`)
- State: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- Data: Prisma ORM (`@prisma/client`, `prisma`) + Neon (`@neondatabase/serverless`, `@prisma/adapter-neon`)
- Payments: Stripe (`stripe`)
- Media: ImageKit (`imagekit`)
- AI: OpenAI SDK (`openai`) via configurable base URL + model
- Jobs: Inngest (`inngest`)
- Utilities: axios, date-fns, recharts, react-hot-toast

## Project structure

Key locations inside `gocart/`:

```text
gocart/
  app/
    (public)/           # public pages (home, products, shop, create-store)
    store/              # seller dashboard (add product, manage products, orders)
    api/                # server routes (orders, products, store, admin, coupon, rating, stripe, inngest)
  components/           # UI components (Navbar, ProductCard, OrderSummary, etc.)
  lib/                  # Prisma client, Redux store and features
  middlewares/          # app-level authorization helpers (admin/seller)
  configs/              # external services configuration (OpenAI, ImageKit)
  prisma/               # Prisma schema
```

## Environment variables

Create a `.env` file in `gocart/` and fill these values:

Required

- `DATABASE_URL` – Postgres connection string (Neon or any Postgres)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk frontend key
- `CLERK_SECRET_KEY` – Clerk backend key
- `ADMIN_EMAIL` – Comma‑separated admin emails (for admin guard)
- `STRIPE_SECRET_KEY` – Stripe secret key
- `STRIPE_WEBHOOK_SECRET` – Webhook signing secret for `/api/stripe`
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` – ImageKit configuration

AI assistant (optional)

- `OPENAI_API_KEY` – API key for OpenAI or an OpenAI‑compatible provider
- `OPENAI_BASE_URL` – Base URL (use the provider’s OpenAI‑compatible endpoint)
- `OPEN_AI_MODEL` – Chat model that supports image input

Optional

- `NEXT_PUBLIC_CURRENCY_SYMBOL` – Currency symbol (defaults to `$`)

## Getting started

1. Install dependencies

```bash
npm install
```

1. Generate Prisma client and create database schema

```bash
npx prisma migrate dev --name init
```

1. Start the dev server

```bash
npm run dev
```

1. Configure Stripe webhook (for local development)

```bash
# In another terminal, forward Stripe events to your app
stripe listen --forward-to localhost:3000/api/stripe
```

Notes

- If you deploy on edge runtimes, `lib/prisma.js` switches to Neon’s adapter automatically.
- Clerk Protect is used to gate free shipping for members: `<Protect plan="plus" />`. Configure plans in Clerk or remove gating if not needed.

## Core routes (high level)

### Buyer

- `POST /api/orders` – place order (COD or Stripe)
- `GET /api/orders` – user’s orders
- `POST /api/coupon` – validate/apply coupon
- `POST /api/rating` / `GET /api/rating` – ratings

### Seller

- `GET /api/store/dashboard` – seller stats
- `GET /api/store/product` / `POST /api/store/product` – list/create products
- `POST /api/store/stock-toggle` – toggle product availability
- `GET /api/store/orders` / `POST /api/store/orders` – list/update order status
- `POST /api/store/ai` – AI listing assistant (image → title/description)

### Admin

- `GET /api/admin/approve-store` – pending applications
- `POST /api/admin/approve-store` – approve/reject store

### Platform routes

- `POST /api/stripe` – Stripe webhook
- `GET|POST|PUT /api/inngest` – Inngest function serving endpoint

## Scripts

- `npm run dev` – start Next.js dev server with Turbopack
- `npm run build` – generate Prisma client and build the app
- `npm start` – run the production build
- `npm run lint` – run Next.js ESLint

## Troubleshooting

- 400 from Clerk‑protected routes: ensure you pass the `Request` into `getAuth(request)` in route handlers and that the client includes the Bearer token.
- AI assistant errors: verify `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPEN_AI_MODEL`. Use a model that accepts image input.
- Stripe checkout total mismatch: confirm shipping logic. Members (plan `plus`) skip the flat $5 fee.
- Admin access denied: set `ADMIN_EMAIL` to the signed‑in email(s) and re‑login.

## License

See `LICENSE.md` in this folder for licensing details.
