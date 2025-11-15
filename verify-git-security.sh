#!/bin/bash

# Script de verificare înainte de Git Push
# Verifică că nu există date sensibile în fișierele care vor fi commit-uite

echo "🔍 Verificare securitate Git..."
echo ""

# Verifică dacă .gitignore există
if [ ! -f .gitignore ]; then
    echo "❌ EROARE: .gitignore lipsește!"
    exit 1
fi

# Verifică dacă .env este în .gitignore
if ! grep -q "\.env" .gitignore; then
    echo "⚠️  ATENȚIE: .env nu este în .gitignore!"
    echo "   Adăugând .env în .gitignore..."
    echo ".env" >> .gitignore
    echo "**/.env" >> .gitignore
fi

# Verifică dacă .env apare în git status
if git status 2>/dev/null | grep -q "\.env"; then
    echo "❌ PERICOL: Fișier .env detectat în staging area!"
    echo "   Rulează: git rm --cached server/.env"
    exit 1
fi

# Verifică dacă există credențiale hardcodate în fișiere JavaScript
echo "🔍 Verificare parole hardcodate..."

# Caută pattern-uri periculoase
dangerous_patterns=(
    "mongodb+srv://[^/]*:[^@]*@"
    "JWT_SECRET.*=.*['\"][^'\"]*['\"]"
    "password.*=.*['\"][^'\"]*['\"]"
    "api_key.*=.*['\"][^'\"]*['\"]"
)

found_issues=0

for pattern in "${dangerous_patterns[@]}"; do
    if git diff --cached | grep -E "$pattern" > /dev/null; then
        echo "⚠️  Pattern periculos detectat: $pattern"
        found_issues=1
    fi
done

# Verifică fișiere specifice
echo "🔍 Verificare fișiere critice..."

if [ -f "server/server.js" ]; then
    if grep -q "mongodb+srv://admin:" server/server.js; then
        echo "❌ PERICOL: Credențiale MongoDB hardcodate în server.js!"
        found_issues=1
    fi
fi

if [ $found_issues -eq 0 ]; then
    echo "✅ Verificare completă - Nu s-au găsit probleme!"
    echo ""
    echo "📋 Fișiere care vor fi commit-uite:"
    git status --short
    echo ""
    echo "✅ Safe to push!"
else
    echo ""
    echo "❌ OPREȘTE! Remediază problemele de mai sus înainte de push!"
    exit 1
fi
