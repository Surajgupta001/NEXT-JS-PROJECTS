# Next.js Projects Repository

Welcome to my Next.js projects repository! This collection showcases various applications built with Next.js, demonstrating modern web development practices and cutting-edge technologies.

## 🚀 About Next.js

**Next.js** is a powerful React framework that enables you to build full-stack web applications. Created by Vercel, it provides an excellent developer experience with features like:

### Key Features

- **Server-Side Rendering (SSR)** - Pre-render pages on the server for better SEO and performance
- **Static Site Generation (SSG)** - Generate static HTML at build time for maximum performance
- **App Router** - Modern file-system based routing with layouts and nested routes
- **API Routes** - Build backend endpoints directly within your Next.js application
- **Automatic Code Splitting** - Only load the JavaScript needed for each page
- **Built-in CSS Support** - Support for CSS Modules, Sass, and CSS-in-JS
- **Image Optimization** - Automatic image optimization with the `next/image` component
- **TypeScript Support** - First-class TypeScript support out of the box
- **Edge Runtime** - Deploy functions closer to users for faster performance

### Why Choose Next.js

- 🔥 **Production Ready** - Used by companies like Netflix, TikTok, and Hulu
- ⚡ **Performance** - Automatic optimizations for better Core Web Vitals
- 🛠️ **Developer Experience** - Hot reloading, error reporting, and debugging tools
- 🌐 **Full-Stack** - Build both frontend and backend in a single framework
- 📱 **SEO Friendly** - Server-side rendering for better search engine optimization

---

## 📁 Projects in this Repository

### � Blog App - Content Management System

**Blog App** is a modern, full-featured blogging platform built with Next.js 14. It provides a complete content management system with both public blog viewing and admin management capabilities.

#### 🌟 Blog App Features

- **Modern Blog Interface** - Clean, responsive design for reading blog posts
- **Admin Dashboard** - Complete admin panel for content management
- **Rich Content Support** - Support for images, text, and multimedia content
- **Category Management** - Organize blogs by categories and tags
- **User-Friendly Editor** - Easy-to-use content creation interface
- **SEO Optimized** - Server-side rendering for better search engine visibility
- **Responsive Design** - Mobile-first approach for all devices
- **Fast Performance** - Optimized loading and caching strategies

#### 🛠️ Blog App Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS, PostCSS
- **Image Handling**: Next.js Image Optimization
- **Development**: ESLint, Hot Reloading

#### 📂 Blog App Structure

```text
blog-app/
├── app/                    # App Router directory
│   ├── api/               # API routes for blog operations
│   ├── admin/             # Admin dashboard pages
│   ├── blogs/             # Public blog pages
│   └── layout.js          # Root layout component
├── Components/            # Reusable React components
│   ├── AdminComponents/   # Admin-specific components
│   ├── BlogItem.jsx       # Individual blog post component
│   ├── BlogList.jsx       # Blog listing component
│   ├── Header.jsx         # Navigation header
│   └── Footer.jsx         # Site footer
├── lib/                   # Utility functions and configurations
│   ├── config/            # Database and app configuration
│   └── models/            # MongoDB data models
└── Assets/                # Static assets and images
```

#### 🚀 Getting Started with Blog App

1. **Navigate to the project directory**

   ```bash
   cd "NEXT JS PROJECTS/blog-app"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

#### 🎯 Key Features

- **Public Blog Interface** - Browse and read blog posts with beautiful UI
- **Admin Panel** - Complete content management system at `/admin`
- **Blog Management** - Create, edit, delete, and organize blog posts
- **Image Upload** - Support for blog post featured images
- **Category System** - Organize content with categories and tags
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

---

### �🛒 QuickCart - E-commerce Platform

**QuickCart** is a modern, full-featured e-commerce application built with Next.js 15 and the latest web technologies. It provides a complete online shopping experience with advanced features for both customers and sellers.

#### 🌟 QuickCart Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **User Authentication** - Secure authentication system with Clerk
- **Product Management** - Complete CRUD operations for products
- **Shopping Cart** - Dynamic cart with real-time updates
- **Order Management** - Order tracking and history
- **Seller Dashboard** - Dedicated interface for sellers to manage products
- **Image Upload** - Cloudinary integration for image management
- **Database Integration** - MongoDB with Mongoose for data persistence
- **Background Jobs** - Inngest for handling asynchronous tasks
- **Payment Processing** - Integrated payment solutions
- **Responsive Design** - Mobile-first approach for all devices

#### 🛠️ QuickCart Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: Clerk
- **Image Storage**: Cloudinary
- **Background Jobs**: Inngest
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Styling**: Tailwind CSS, PostCSS
- **Development**: ESLint, Turbopack

#### 📂 QuickCart Structure

```text
QuickCart/
├── app/                    # App Router directory
│   ├── api/               # API routes
│   ├── cart/              # Shopping cart pages
│   ├── seller/            # Seller dashboard
│   ├── product/           # Product pages
│   └── my-orders/         # Order management
├── components/            # Reusable React components
├── context/               # React Context providers
├── models/                # MongoDB models
├── lib/                   # Utility functions
├── assets/                # Static assets and images
└── Config/                # Configuration files
```

#### 🚀 Getting Started with QuickCart

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "NEXT JS PROJECTS/QuickCart"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your configuration:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

#### 🎯 Key Pages

- **Home** (`/`) - Product showcase and hero section
- **All Products** (`/all-products`) - Complete product catalog
- **Product Details** (`/product/[id]`) - Individual product pages
- **Cart** (`/cart`) - Shopping cart management
- **Seller Dashboard** (`/seller`) - Product management for sellers
- **Orders** (`/my-orders`) - Order history and tracking

---

### 🛍️ GoCart - Modern E-commerce (Prisma + Stripe + AI)

GoCart is a production-ready e-commerce app built with the Next.js App Router. It features Clerk authentication, Stripe payments, Prisma with Postgres (Neon), ImageKit media, and an AI-assisted product description generator. Includes a buyer-facing storefront and a seller dashboard with approvals, coupons, orders, and ratings.

#### 🌟 GoCart Highlights

- Clerk auth with buyer/seller roles and admin approvals
- Stripe Checkout (paid) and Cash-on-Delivery (COD) flows
- Free shipping for Plus members via Clerk plan gating
- Prisma + Postgres (Neon) with relational models (orders, items, ratings, coupons)
- Image storage/optimization via ImageKit
- AI endpoint to suggest product names/descriptions from images
- Robust seller dashboard: add products, manage orders, coupons, and store data

#### 🛠️ GoCart Tech Stack

- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS v4
- Backend: Next.js Route Handlers, Prisma ORM (Postgres via Neon)
- Auth: Clerk (getAuth(request) usage)
- Payments: Stripe Checkout + webhook
- Media: ImageKit (upload + CDN)
- State/UI: Redux Toolkit, axios, react-hot-toast
- Jobs: Inngest for background tasks

#### 📚 Docs & Setup

- Full documentation: `gocart/README.md`
- Environment example: `gocart/.env.example`

#### 🚀 Run GoCart Locally (Windows PowerShell)

```powershell
cd "c:\Programming\NEXT JS PROJECTS\gocart"
npm install
npm run dev
```

Open <http://localhost:3000>

---

### 🎬 ReelKit (video-with-ai) - ImageKit Video Uploader

ReelKit is a full-stack video uploader built with Next.js App Router and ImageKit. It lets authenticated users upload videos (and thumbnails) directly to ImageKit and stores metadata in MongoDB. Includes login/register, an upload form, and a home page to list and play videos.

#### 🌟 Key Features

- ImageKit direct uploads with signed auth via API
- Credential-based auth (NextAuth) with login/register pages
- MongoDB persistence for video metadata
- Server Components for fast, SEO-friendly lists
- Tailwind CSS v4 styling + dark mode

#### 🛠️ Tech Stack

- Frontend: Next.js 15, React 19, App Router, Tailwind CSS v4
- Backend: Next.js Route Handlers (API Routes)
- Auth: next-auth (Credentials)
- DB: MongoDB + Mongoose
- Media: ImageKit (upload + delivery)

#### 📂 Project Structure

```text
video-with-ai/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts          # Register user
│   │   │   ├── imagekit-auth/route.ts     # ImageKit upload auth
│   │   │   └── [...nextauth]/route.ts     # NextAuth handler
│   │   └── video/route.ts                 # GET/POST videos
│   ├── components/
│   │   ├── providers.tsx                  # Session + ImageKit providers (client)
│   │   └── fileUpload.tsx                 # Upload widget (client)
│   ├── login/page.tsx                     # Sign in
│   ├── register/page.tsx                  # Sign up
│   ├── upload/page.tsx                    # Upload form (auth required)
│   ├── page.tsx                           # Home: list videos
│   ├── layout.tsx                         # Root layout
│   └── globals.css                        # Tailwind v4 entry (@import "tailwindcss")
├── lib/
│   ├── auth.ts                            # NextAuth options
│   ├── database.ts                        # Mongoose connection helper
│   └── api_client.ts                      # Client for API calls
├── models/
│   ├── user.ts                            # User model (hashed passwords)
│   └── video.ts                           # Video model
├── next-auth.d.ts                         # Session typing
├── next.config.ts
├── postcss.config.mjs                     # Tailwind v4 via @tailwindcss/postcss
└── package.json
```

#### ⚙️ Environment Variables

Create `video-with-ai/.env.local`:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_long_random_secret
# Optional in some setups
# NEXTAUTH_URL=http://localhost:3000

# ImageKit
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/<your_imagekit_id>
NEXT_PUBLIC_PUBLIC_KEY=public_xxxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxx
```

Notes:

- `NEXT_PUBLIC_URL_ENDPOINT` and `NEXT_PUBLIC_PUBLIC_KEY` are exposed to the client.
- `IMAGEKIT_PRIVATE_KEY` must remain server-only (used in the auth route handler).

#### 🚀 Run Locally (Windows PowerShell)

```powershell
cd "c:\Programming\NEXT JS PROJECTS\video-with-ai"
npm install
npm run dev
```

Open <http://localhost:3000>

#### 🧭 App Flow

- Register at `/register`, then login at `/login`.
- Upload videos at `/upload` (requires auth). This performs:
  - GET `/api/auth/imagekit-auth` to fetch signed params
  - Client-side upload to ImageKit using `@imagekit/next` upload
  - POST `/api/video` to save metadata (title, description, videoUrl, thumbnailUrl)
- View uploaded videos on `/` with a built-in video player.

#### 🔐 API Endpoints

- `GET /api/video` — List all videos
- `POST /api/video` — Create video (auth required)
- `POST /api/auth/register` — Register user
- `GET /api/auth/imagekit-auth` — Get ImageKit upload auth params
- `GET|POST /api/auth/[...nextauth]` — NextAuth routes

#### 🧩 Tailwind CSS v4

- PostCSS plugin is configured in `postcss.config.mjs`.
- Global stylesheet `app/globals.css` includes `@import "tailwindcss";`.
- No Tailwind config file is required unless you need custom themes or content settings.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

For any questions or suggestions, feel free to reach out:

- **GitHub**: [@Surajgupta001](https://github.com/Surajgupta001)
- **Repository**: [NEXT-JS-PROJECTS](https://github.com/Surajgupta001/NEXT-JS-PROJECTS)

---

⭐ **Star this repository if you find it helpful!**

Built with ❤️ using Next.js and modern web technologies
