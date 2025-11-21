# 🎓 Smart Student - Aplicație de Management pentru Studenți

Aplicație full-stack pentru gestionarea eficientă a activităților studenților: examene, task-uri, venituri și cheltuieli.

## 🚀 Tehnologii Folosite

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT pentru autentificare
- bcrypt pentru securitate

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios pentru API calls
- Recharts pentru grafice
- date-fns pentru manipulare date

## 📦 Instalare

### Cerințe preliminare
- Node.js (v14 sau mai nou)
- MongoDB Atlas account sau MongoDB local
- Git

### 1. Clonare repository
```bash
git clone <repository-url>
cd smart-student
```

### 2. Configurare Backend

```bash
cd server
npm install
```

Creează fișierul `.env` în directorul `server/`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_very_secret_jwt_key_here
PORT=5000
```

**IMPORTANT:** Înlocuiește valorile cu ale tale! Vezi `.env.example` pentru referință.

### 3. Configurare Frontend

```bash
cd ../smart-student-frontend
npm install
```

## 🎯 Rulare

### Backend
```bash
cd server
npm start
# sau pentru development cu nodemon:
npm run dev
```
Server va rula pe `http://localhost:5000`

### Frontend
```bash
cd smart-student-frontend
npm run dev
```
Frontend va rula pe `http://localhost:5173`

## 📱 Funcționalități

### 🔐 Autentificare
- Înregistrare și login securizat cu JWT
- Parole hash-uite cu bcrypt
- Protected routes
- Auto-logout la token expirat

### 📝 Management Task-uri
- Adaugă, editează, șterge task-uri
- Progress bar pentru % completare
- Filtrare după status și categorie
- Alert pentru deadline-uri apropiate
- Grid layout responsive

### 📊 Management Financiar
- Tracking venituri și cheltuieli
- Pie chart pentru cheltuieli pe categorii
- Bar chart pentru evoluție lunară (6 luni)
- Rapoarte lunare
- Statistici live (venituri, cheltuieli, balanță)
- Filtre interactive

### 📈 Dashboard
- Overview tasks și finanțe
- Statistici quick view
- Link-uri rapide către secțiuni

## 🔒 Securitate

⚠️ **IMPORTANT pentru Git:**
- Fișierul `.env` NU este inclus în repository
- Vezi `.env.example` pentru structura necesară

## 📂 Structura Proiectului

```
smart-student/
├── server/                 # Backend Node.js
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── transactionModel.js
│   ├── routes/            # Express routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── transactionRoutes.js
│   ├── .env.example       # Template variabile mediu
│   ├── .env              # (ignorat de git)
│   └── server.js         # Entry point
│
├── smart-student-frontend/ # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── index.css
│   └── public/
│
├── .gitignore             # Fișiere ignorate
└── README.md              # Acest fișier
```

## 📝 API Endpoints

### Auth
- `POST /auth/register` - Înregistrare utilizator nou
- `POST /auth/login` - Autentificare
- `GET /auth/me` - Profil utilizator
- `PUT /auth/me` - Actualizare profil

### Tasks
- `GET /tasks` - Lista task-uri
- `POST /tasks` - Creare task nou
- `PUT /tasks/:id` - Actualizare task
- `DELETE /tasks/:id` - Ștergere task

### Transactions
- `GET /transactions` - Lista tranzacții
- `POST /transactions` - Creare tranzacție
- `PUT /transactions/:id` - Actualizare tranzacție
- `DELETE /transactions/:id` - Ștergere tranzacție

## 🚦 Troubleshooting

### Backend nu pornește:
```bash
cd server
rm -rf node_modules
npm install
npm start
```

### Frontend nu pornește:
```bash
cd smart-student-frontend
rm -rf node_modules
npm install
npm run dev
```

### Erori CORS:
- Verifică că backend-ul rulează pe portul corect (5000)
- Verifică `config.js` din frontend

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru schimbări majore:
1. Fork repository-ul
2. Creează un branch pentru feature-ul tău
3. Commit schimbările
4. Push la branch
5. Deschide un Pull Request

## 📄 Licență

Acest proiect este licențiat sub MIT License.

## 👨‍💻 Autor

Dezvoltat cu ❤️ pentru studenți

---

**Notă:** Nu uita să configurezi corect fișierul `.env` înainte de a rula aplicația!
