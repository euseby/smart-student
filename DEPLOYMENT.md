# Smart Student - Deployment Guide

## Deploy Frontend on Vercel

### 1. Pregătire
- Am actualizat `config.js` să folosească URL-ul de la Render
- Acum API_URL = `https://smart-student-app.onrender.com`

### 2. Deploy pe Vercel
1. Mergi pe [vercel.com](https://vercel.com)
2. Sign up / Log in cu GitHub
3. Click "Add New Project"
4. Importă repository-ul tău de pe GitHub
5. Setează:
   - **Framework Preset**: Vite
   - **Root Directory**: `smart-student-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Environment Variables (opțional, pentru developare):
   - `VITE_API_URL` = `http://localhost:5000` (pentru local testing)

7. Click "Deploy"

### 3. Pentru localhost (developare)
Creează un fișier `.env.local` în `smart-student-frontend`:
```
VITE_API_URL=http://localhost:5000
```

Astfel când dezvolți local, va folosi localhost, iar în producție va folosi Render.

### 4. CORS pe Server
Asigură-te că serverul de pe Render acceptă request-uri de la domeniul Vercel. Verifică în `server/index.js` că ai:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Note importante:
- Frontend-ul va rula pe Vercel (ex: `https://smart-student.vercel.app`)
- Backend-ul rulează pe Render (`https://smart-student-app.onrender.com`)
- Nu uita să adaugi domeniul Vercel în CORS pe server după deploy
