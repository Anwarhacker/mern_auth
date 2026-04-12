# AuthApp — Full-Stack Authentication System

> **Next.js + Node.js/Express + MySQL** · JWT Auth · Password Reset · CRUD Dashboard

## ✦ Features

| Area | What's Included |
|------|----------------|
| Auth | Register, Login, Forgot/Reset Password |
| Security | bcrypt (rounds=12), JWT (7d), parameterized SQL, CORS |
| Dashboard | Stats cards, Add / Edit / Delete items, Status filter, Live search |
| UI | Dark theme, Tailwind v4, glassmorphism, responsive design |

---

## 🗄️ Prerequisites

- **Node.js** ≥ 18
- **MySQL** running locally on `localhost:3306`
- (Optional) Mailtrap or Gmail for email-based password reset

---

## 🚀 Quick Start

### 1 — Database Setup

```bash
# In MySQL CLI or Workbench:
mysql -u root -p < database.sql
```

### 2 — Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL password & email creds
npm run dev               # starts on http://localhost:5000
```

### 3 — Frontend

```bash
cd my-app
npm install
npm run dev               # starts on http://localhost:3000
```

Then open **http://localhost:3000** — register an account and explore!

---

## ⚙️ Environment Variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | _(empty)_ |
| `DB_NAME` | Database name | `mern_auth_db` |
| `JWT_SECRET` | Long random string | _(set this!)_ |
| `EMAIL_HOST` | SMTP host (Mailtrap/Gmail) | `smtp.mailtrap.io` |
| `EMAIL_PORT` | SMTP port | `2525` |
| `EMAIL_USER` | SMTP username | — |
| `EMAIL_PASS` | SMTP password / app password | — |
| `FRONTEND_URL` | Frontend URL for reset links | `http://localhost:3000` |
| `PORT` | Backend port | `5000` |

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login → returns JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| POST | `/api/auth/forgot-password` | ✗ | Send reset email |
| POST | `/api/auth/reset-password/:token` | ✗ | Reset password |

### Items (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items + stats |
| POST | `/api/items` | Create item |
| GET | `/api/items/:id` | Get single item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

---

## 📂 Project Structure

```
library/
├── database.sql             ← Run once to create tables
├── README.md
│
├── backend/
│   ├── .env.example         ← Copy to .env
│   ├── server.js
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itemsController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── items.js
│   └── utils/mailer.js
│
└── my-app/                  ← Next.js 16 frontend
    └── src/
        ├── lib/axios.js
        ├── context/AuthContext.js
        ├── components/
        │   ├── ClientProviders.js
        │   ├── ProtectedRoute.js
        │   └── Navbar.js
        └── app/
            ├── layout.js
            ├── page.js           ← redirects to /login or /dashboard
            ├── login/
            ├── register/
            ├── forgot-password/
            ├── reset-password/[token]/
            └── dashboard/
```

---

## 🔒 Security Highlights

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** tokens expire in 7 days
- All item queries scoped to `user_id` — users can only see their own data
- **Parameterized SQL queries** prevent SQL injection
- CORS restricted to `FRONTEND_URL` only
- Reset tokens expire in **1 hour**; cleared after use
- `.env` is in `.gitignore` — never committed

---

## 💡 Gmail App Password Setup

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords** → generate one for "Mail"
4. Set `EMAIL_HOST=smtp.gmail.com`, `EMAIL_PORT=587`, `EMAIL_USER=your@gmail.com`, `EMAIL_PASS=<app-password>`
