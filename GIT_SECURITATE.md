# 🔐 Ghid Securitate pentru Git

## ⚠️ IMPORTANT - Înainte de Push pe GitHub

### 1. Verifică că `.env` este ignorat

Fișierul `.gitignore` din root TREBUIE să conțină:
```
.env
**/.env
```

### 2. Nu comite niciodată:

❌ Parolele de baze de date
❌ JWT secrets
❌ API keys
❌ Credențiale MongoDB
❌ Tokeni de autentificare

### 3. Fișiere sensibile în acest proiect:

- `server/.env` - NU trebuie să fie în Git
- `server/.env.example` - DA, poate fi în Git (template fără parole)

## ✅ Checklist înainte de Git Push:

- [ ] `.gitignore` este configurat corect
- [ ] `server/.env` NU apare în `git status`
- [ ] `server/.env.example` există și are valori placeholder
- [ ] Nu există parole hardcodate în `server.js` sau alte fișiere
- [ ] MongoDB URI folosește `process.env.MONGO_URI`
- [ ] JWT_SECRET folosește `process.env.JWT_SECRET`

## 📝 Comenzi Git Recomandate:

### Inițializare Git (prima dată):
```bash
cd /c/Users/Eusebiu/Desktop/smart-student
git init
git add .
git status    # VERIFICĂ că .env NU apare aici!
```

### Dacă vezi .env în git status:
```bash
# Șterge .env din staging
git reset HEAD server/.env
git rm --cached server/.env

# Asigură-te că .gitignore conține .env
echo ".env" >> .gitignore
echo "**/.env" >> .gitignore
```

### Commit și Push:
```bash
git commit -m "Initial commit - Smart Student App"
git branch -M main
git remote add origin <URL-REPOSITORY-TAU>
git push -u origin main
```

## 🛡️ Dacă ai comis din greșeală .env:

### Șterge din istoricul Git:
```bash
# Șterge fișierul din toate commit-urile
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Forțează push (ATENȚIE: rescrie istoricul!)
git push origin --force --all
```

### Apoi SCHIMBĂ IMEDIAT:
1. Parola MongoDB
2. JWT_SECRET
3. Orice alte credențiale expuse

## 📦 Setup pentru alții care clonează:

Când cineva clonează repository-ul:

```bash
git clone <repository-url>
cd smart-student/server

# Copiază template-ul
cp .env.example .env

# Editează .env cu propriile credențiale
nano .env  # sau notepad .env pe Windows
```

## 🔒 Best Practices:

1. **Niciodată** nu comite fișiere `.env`
2. Oferă **întotdeauna** un `.env.example`
3. Documentează în README ce variabile sunt necesare
4. Folosește **întotdeauna** `process.env.VARIABILA`
5. Verifică cu `git status` înainte de commit
6. Folosește `.gitignore` corespunzător

## 📋 Template .env.example:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret (generează uno nou cu: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_very_secret_jwt_key_here

# Server Port
PORT=5000
```

## 🎯 Verificare finală:

```bash
# Verifică ce fișiere vor fi commit-uite
git status

# Verifică conținutul fișierelor staged
git diff --cached

# Dacă totul e OK:
git commit -m "Your message"
git push
```

---

**Reține:** O parolă expusă public trebuie schimbată IMEDIAT, chiar dacă ai șters-o din Git!
