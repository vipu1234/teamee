# Teamee — Team Task Manager 🚀

A professional, market-ready **Team Task Management Web Application** built for AI companies.

## 🌐 Live Demo
- **Frontend:** `<your-railway-frontend-url>`
- **Backend API:** `<your-railway-backend-url>`

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | JWT (httpOnly cookies) |
| Validation | Zod |

## ✨ Features

- **🔐 JWT Authentication** — Signup, login, logout with httpOnly cookies
- **📁 Project Management** — Create projects, invite members by email, CRUD
- **✅ Task Management** — Create, assign, update status (TODO → IN_PROGRESS → REVIEW → COMPLETED)
- **📊 Dashboard Analytics** — Stats, completion rate, tasks per user
- **👥 Team View** — All members across projects
- **⚙️ Settings** — Profile update, password change
- **🛡️ Role-Based Access** — Admin vs Member permissions

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & Install
```bash
git clone <repo-url>
cd Teamee

# Backend
cd backend
npm install
cp .env.example .env    # Edit with your values

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

### 2. Database Setup
```bash
cd backend
npx prisma migrate dev --name init --schema=prisma/schema.prisma
```

### 3. Run Development Servers
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🚂 Railway Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Deploy Backend on Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → Choose the `backend` folder as root
3. Add a **PostgreSQL** plugin
4. Set environment variables:
   ```
   DATABASE_URL=<auto-filled by Railway PostgreSQL plugin>
   JWT_SECRET=your_strong_secret_here
   FRONTEND_URL=https://your-frontend.railway.app
   PORT=5000
   NODE_ENV=production
   ```
5. Set **Start Command:** `npm run start`

### Step 3: Deploy Frontend on Railway
1. New Project → Deploy from GitHub → Choose `frontend` folder
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
3. Build: `npm run build` | Start: `npm run start`

### Step 4: Update Backend Schema for PostgreSQL
In production, edit `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Change `tags` field to `String[]` (remove JSON workaround).

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| PUT | `/api/auth/password` | Yes | Change password |
| GET | `/api/projects` | Yes | List projects |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:id` | Yes | Project detail |
| PUT | `/api/projects/:id` | Yes/Admin | Update project |
| DELETE | `/api/projects/:id` | Yes/Owner | Delete project |
| POST | `/api/projects/:id/members` | Yes/Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Yes/Admin | Remove member |
| GET | `/api/tasks` | Yes | My tasks |
| GET | `/api/tasks/stats` | Yes | Dashboard stats |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| GET | `/api/team` | Yes | Team members |

## 🎥 Demo Video
[Watch 3-minute demo →](<your-loom-link>)

---

Built with ❤️ for the Full-Stack Assignment.
