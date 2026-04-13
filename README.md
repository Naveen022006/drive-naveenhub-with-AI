# 🚀 NaveenHub Drive Assistant

A production-ready web application for securely accessing and managing Google Drive files through a custom website, with a JARVIS-style AI assistant panel ready for future integration.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tech Stack](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![Tech Stack](https://img.shields.io/badge/Flask-3.1-000000?logo=flask)
![Tech Stack](https://img.shields.io/badge/Google%20Drive%20API-v3-4285F4?logo=google-drive)

---

## 📁 Project Structure

```
naveen-drive/
├── backend/                  # Python Flask API
│   ├── app.py                # Flask app factory (entry point)
│   ├── config.py             # Environment variable loader
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Example env vars
│   ├── routes/
│   │   ├── auth.py           # /login, /callback, /logout, /user
│   │   └── drive.py          # /files, /upload, /download, /delete
│   ├── services/
│   │   ├── google_auth.py    # OAuth flow helpers
│   │   └── google_drive.py   # Drive API operations
│   └── utils/
│       └── helpers.py        # Decorators & formatting
│
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── App.jsx           # Root with routing
│   │   ├── main.jsx          # Entry point
│   │   ├── index.css         # Design system + Tailwind
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios API client
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── FileCard.jsx
│   │       ├── UploadZone.jsx
│   │       ├── AiAssistant.jsx
│   │       └── LoadingSpinner.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔧 Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.10+
- A **Google Cloud** account

---

## 🔑 Step 1: Set Up Google Drive API

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it `NaveenHub Drive Assistant` → **Create**

### 1.2 Enable the Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Google Drive API"** → Click it → **Enable**
3. Also enable **"Google People API"** (for user profile info)

### 1.3 Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - App name: `NaveenHub Drive Assistant`
   - User support email: your email
   - Authorized domains: `navinhub.dev` (add later for production)
4. **Scopes**: Add:
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `openid`
5. **Test users**: Add your Google email for testing
6. **Save**

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Application type: **Web application**
4. Name: `NaveenHub Web Client`
5. **Authorized redirect URIs**:
   - `http://localhost:5000/callback` (development)
   - `https://api.navinhub.dev/callback` (production — add later)
6. Click **Create**
7. **Copy the Client ID and Client Secret** — you'll need these next

---

## 💻 Step 2: Run Locally

### 2.1 Backend Setup

```bash
# Navigate to backend
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example)
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/callback
SECRET_KEY=any-random-string-for-session-encryption
FLASK_DEBUG=true
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
python app.py
```

The API will be running at **http://localhost:5000**.

### 2.2 Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The app will be running at **http://localhost:5173**.

### 2.3 Test It!

1. Open **http://localhost:5173** in your browser
2. Click **"Sign in with Google"**
3. Authorize the app on Google's consent screen
4. You'll be redirected to the dashboard with your Drive files
5. Try uploading, downloading, and deleting files
6. Click the **AI Assistant** floating button to try the chat panel

---

## 🚀 Step 3: Deploy

### 3.1 Backend → Render

1. Push your code to a GitHub repository
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `naveenhub-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:create_app()`
5. Add **Environment Variables**:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://naveenhub-api.onrender.com/callback
   SECRET_KEY=generate-a-strong-random-key
   FRONTEND_URL=https://navinhub.dev
   FLASK_ENV=production
   ```
6. **Deploy**

Note: Update the Google Cloud Console to add `https://naveenhub-api.onrender.com/callback` as an authorized redirect URI.

### 3.2 Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   ```
   VITE_API_URL=https://naveenhub-api.onrender.com
   ```
5. **Deploy**

---


At your domain registrar (e.g., Namecheap, Cloudflare, GoDaddy), add:

| Type  | Name  | Value                              |
|-------|-------|------------------------------------|
| A     | @     | `76.76.21.21` (Vercel)             |
| CNAME | www   | `cname.vercel-dns.com`             |
| CNAME | api   | `naveenhub-api.onrender.com`       |

### 4.4 Update Environment Variables

After domain setup:

**Backend (.env on Render):**
```env
GOOGLE_REDIRECT_URI=https://api.navinhub.dev/callback
FRONTEND_URL=https://navinhub.dev
```

**Frontend (Vercel env vars):**
```env
VITE_API_URL=https://api.navinhub.dev
```

**Google Cloud Console:**
- Add `https://api.navinhub.dev/callback` to authorized redirect URIs
- Add `navinhub.dev` to authorized domains in the OAuth consent screen

---

## 🔒 Security Checklist

- [x] OAuth credentials stored in environment variables
- [x] Client secret never exposed to frontend
- [x] CORS restricted to frontend origin only
- [x] Session cookies with SameSite and Secure flags
- [x] Token refresh on expiration
- [x] `.gitignore` excludes `.env`, `credentials.json`, `token.json`

---

## 🧠 Future AI Integration (RAG + Assistant)

The AI Assistant panel is built and ready. To integrate real AI:

1. **Add an LLM backend** (OpenAI / Gemini / local model)
2. **Implement RAG** — index Drive file contents with embeddings
3. **Add a `/chat` endpoint** to the Flask backend
4. **Connect the frontend** `AiAssistant.jsx` to the real endpoint
5. **Features to add**:
   - "Find my recent invoices"
   - "Summarize this document"
   - "Open my project folder"
   - File search by natural language

---

## 📜 License

MIT — feel free to use, modify, and deploy.

---

**Built with ❤️ by Naveen • NaveenHub Drive Assistant v1.0**
