# 🚀 Automatisches Deployment Setup

## Einmalig einrichten (nur 1x nötig):

### 1. **Vercel CLI installieren**
```bash
npm i -g vercel
vercel login
```

### 2. **Frontend-Projekt bei Vercel anlegen**
```bash
cd frontend
vercel --prod
# Folge den Anweisungen, wähle deine Organisation
# Notiere dir die Project ID aus der Ausgabe
```

### 3. **Backend-Projekt bei Vercel anlegen**
```bash
cd ../backend
vercel --prod
# Folge den Anweisungen
# Notiere dir auch diese Project ID
```

### 4. **GitHub Secrets einrichten**

Gehe zu GitHub → Settings → Secrets and variables → Actions → New repository secret:

**Vercel-Tokens:**
```bash
# Vercel Token generieren:
vercel --token
# Kopiere den Token
```

Erstelle diese Secrets:
- `VERCEL_TOKEN`: Dein Vercel-Token
- `VERCEL_ORG_ID`: Deine Vercel Organization ID (findest du in Vercel Dashboard)
- `VERCEL_PROJECT_ID`: Frontend Project ID 
- `VERCEL_BACKEND_PROJECT_ID`: Backend Project ID
- `ANTHROPIC_API_KEY`: Dein Claude API Key
- `OPENAI_API_KEY`: Dein OpenAI API Key

### 5. **Environment Variables in Vercel setzen**

**Frontend-Projekt:**
```bash
cd frontend
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
```

**Backend-Projekt:**
```bash
cd ../backend  
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
```

## 🎯 Ab jetzt läuft alles automatisch!

### Bei jedem `git push origin main`:
1. ✅ **Build-Tests** laufen automatisch
2. 🚀 **Frontend** wird zu Vercel deployed  
3. ⚙️ **Backend** wird zu Vercel deployed
4. 📢 **Benachrichtigung** über Erfolg/Fehler

### Live-URLs:
- **Frontend**: `https://dein-frontend-projekt.vercel.app`
- **Backend**: `https://dein-backend-projekt.vercel.app`

## 🔧 Tipps:

### CORS-URL aktualisieren:
Nach dem ersten Deployment musst du in `backend/index.js` die Frontend-URL eintragen:
```javascript
app.use(cors({ 
  origin: [
    "https://dein-frontend-projekt.vercel.app", 
    "http://localhost:3000"
  ] 
}));
```

### Logs anschauen:
```bash
# GitHub Actions
GitHub → Actions Tab

# Vercel Functions
vercel logs
```

### Manual Deployment (falls nötig):
```bash
# Frontend
cd frontend && vercel --prod

# Backend  
cd backend && vercel --prod
```

## ✨ Vorteile:

- 🚀 **Automatisch**: Jeder Push deployed sofort
- 🧪 **Getestet**: Builds werden validiert
- 🔄 **Rollback**: Bei Fehlern bleibt alte Version online
- 📱 **Preview**: Pull Requests bekommen Preview-URLs
- 💰 **Kostenfrei**: GitHub Actions + Vercel Hobby sind gratis
