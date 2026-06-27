# Localhost Development Setup

## Backend Setup (Terminal 1):

1. Open terminal in VS Code
2. Run these commands:

```bash
cd backend
npm install
npm run dev
```

Backend will start on: `http://localhost:5000`

## Frontend Setup (Terminal 2):

1. Open `SE Project (2)/SE Project/New folder/admin-login.html` in VS Code
2. Right-click → **"Open with Live Server"**

Frontend will open on: `http://127.0.0.1:5501/...`

## Login Credentials:

- **Username**: `admin`
- **Password**: `admin123`

## How It Works:

- `config.js` now automatically detects localhost
- When on localhost → uses `http://localhost:5000` (local backend)
- When on Vercel → uses `https://edusphereerp-scbr.onrender.com` (production)

## Troubleshooting:

If backend doesn't start:
1. Make sure PostgreSQL is installed and running
2. Check `.env` file in backend folder has correct DATABASE_URL
3. Run: `npm run db:push` to sync database schema

---

**Now you can develop locally without "Cannot connect to server" errors!** ✅
