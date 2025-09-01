# 🚀 Warp CodeRabbit Automation Workflows

Production-grade automation workflows für nahtlose CodeRabbit-Integration mit Vercel Deploy.

## 📋 Verfügbare Workflows

### 🎯 **deploy-auto-branch** - Vollautomatischer Pipeline
Der Hauptworkflow für vollständige Automatisierung:

```bash
warp run deploy-auto-branch                    # Standard (BASE=develop)
warp run deploy-auto-branch --base main        # Gegen main-Branch
```

**Was passiert:**
1. 📊 Delta-Übersicht vs. BASE (Dateien, Commits, Stats)
2. 🔧 Auto-Commit/Push der aktuellen Änderungen
3. 🔗 PR erstellen/updaten falls noch nicht vorhanden
4. 🤖 CodeRabbit Polling (15s Intervall, 7min Timeout, max 5 Zyklen)
5. 🔧 Suggestions automatisch anwenden mit robustem Bottom-up-Patching
6. 🔄 Iterativ wiederholen bis keine neuen Suggestions mehr kommen
7. ✅ CodeRabbit Review-Status prüfen (bricht ab bei CHANGES_REQUESTED)
8. 🔎 CI-Checks abwarten (mit Timeout)
9. 🔄 Rebase auf BASE vor Deploy (optional)
10. 🧹 Pre-Deploy Guards (typecheck/lint/test/build wenn verfügbar)
11. 🚀 Vercel Preview Deploy
12. 💬 Preview-URL als PR-Kommentar

### 🧪 **test-deploy** - Sicherer Test-Lauf
```bash
warp run test-deploy                           # Trockenlauf mit develop
warp run test-deploy --base main               # Trockenlauf mit main
```
Führt den kompletten Workflow im DRY_RUN-Modus aus - keine echten Änderungen.

### 🎛️ **deploy-production-ready** - Konfigurierbare Version
```bash
# Vollständig konfigurierbar mit allen Optionen:
warp run deploy-production-ready \
  --base develop \
  --dry_run false \
  --label autodeploy \
  --skip_rebase false \
  --max_cycles 5 \
  --app_dir .
```

### 📊 **show-diff-vs-base** - Quick Diff
```bash
warp run show-diff-vs-base                     # vs. develop
warp run show-diff-vs-base --base main         # vs. main
```
Zeigt nur die Änderungen ohne Deploy-Aktionen.

### 🔍 **check-coderabbit** - Status Monitor
```bash
warp run check-coderabbit
```
Zeigt aktuellen CodeRabbit-Status der PR (Suggestions, letzte Kommentare).

### 🚨 **rollback-last** - Notfall-Revert
```bash
warp run rollback-last
```
Revertiert den letzten Commit (mit Sicherheitsabfrage) - für Notfälle.

### 🛠️ **create-coderabbit-script** - Setup Helper
```bash
warp run create-coderabbit-script
```
Erstellt das Apply-Script falls es fehlt.

## ⚙️ Konfiguration

### Umgebungsvariablen

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `DRY_RUN` | `false` | Test-Modus ohne echte Änderungen |
| `MAX_CYCLES` | `5` | Maximum Suggestion-Apply Zyklen |
| `REQUIRES_LABEL` | - | PR-Label Required für Deploy (optional) |
| `SKIP_REBASE` | `false` | Rebase auf BASE überspringen |
| `APP_DIR` | `.` | Verzeichnis für npm-Commands und Vercel |
| `POLL_SECONDS` | `15` | Polling-Intervall für CodeRabbit |
| `TIMEOUT_SECONDS` | `420` | Timeout für CodeRabbit (7min) |
| `BOT` | `coderabbitai[bot]` | Bot-Username |

### Beispiel-Konfigurationen

**Sicherer Testlauf:**
```bash
export DRY_RUN=true
export MAX_CYCLES=2
warp run deploy-auto-branch
```

**Nur mit autodeploy-Label:**
```bash
export REQUIRES_LABEL=autodeploy
warp run deploy-auto-branch
```

**Monorepo-Unterstützung:**
```bash
export APP_DIR=apps/web
warp run deploy-auto-branch
```

**Ohne Rebase (schneller):**
```bash
export SKIP_REBASE=true
warp run deploy-auto-branch
```

## 🛡️ Sicherheitsfeatures

### ✅ **Built-in Safeguards**
- ❌ **BASE-Branch Protection** - Bricht ab wenn Sie auf develop/main sind
- 🏷️ **Label-basierte Gateways** - Optional: Deploy nur mit bestimmtem PR-Label
- ⛔ **CodeRabbit CHANGES_REQUESTED** - Stoppt Deploy bei aktiven Einwänden
- 🔎 **CI-Checks Gateway** - Wartet auf erfolgreiche Tests/Builds
- ⏰ **Timeout Protection** - Kein endloses Warten
- 🔄 **Cycle Limits** - Max. Anzahl Auto-Fix Iterationen
- 🧪 **DRY_RUN Mode** - Sicheres Testen ohne Nebenwirkungen

### 🔧 **Pre-Deploy Validierung**
Automatisch ausgeführt wenn verfügbar:
- `npm run typecheck` - TypeScript Validierung  
- `npm run lint` - Code Style Checks
- `npm test -- --watch=false` - Unit Tests
- `npm run build` - Build-Validierung

## 🎯 Best Practices

### 1. **Workflow-Auswahl**
```bash
# Entwicklung: Quick & Dirty
warp run test-deploy

# Feature-Branch: Standard
warp run deploy-auto-branch

# Production-Critical: Vollüberwachung
warp run deploy-production-ready --label production-ready
```

### 2. **Branch-Strategie**
- ✅ Arbeiten Sie immer auf Feature-Branches
- ✅ BASE sollte `develop` oder `main` sein
- ✅ Nutzen Sie `show-diff-vs-base` zur Vorab-Prüfung

### 3. **CodeRabbit Integration**
- 🤖 Lassen Sie CodeRabbit vollständig analysieren bevor Sie deployen
- 🔄 Der Workflow wendet nur ````suggestion` Blocks an
- 💬 Text-Kommentare werden als Snapshot angezeigt
- ⏰ 7-Minuten Timeout verhindert endloses Warten

### 4. **Error Recovery**
```bash
# Bei Konflikten:
git rebase --continue  # nach manueller Auflösung
git rebase --abort     # zum Abbrechen

# Bei schlechtem Deploy:
warp run rollback-last

# Bei Timeout:
export TIMEOUT_SECONDS=900  # 15 Minuten
warp run deploy-auto-branch
```

## 🧩 Technische Details

### **Bottom-up Patching Algorithm**
Das Apply-Script sortiert Suggestions nach Zeilen-Nummer **absteigend** und wendet sie von unten nach oben an. Das erhält stabile Zeilen-Offsets während des Patchings.

### **Robuste Error-Behandlung**
- ⚠️ Fehlende Dateien werden übersprungen
- 📏 Line-Range Validierung verhindert Crashes  
- 🔄 Partielle Anwendung möglich (nicht alles-oder-nichts)
- 📊 Detaillierte Success/Skip Statistiken

### **GitHub API Integration**
- 🔍 Paginated Comment-Fetching für große PRs
- 🏷️ Label-basierte Gateways
- ✅ Review-State Validation  
- 🔎 CI-Status Integration
- 💬 Automatische Preview-URL Comments

## 🚨 Troubleshooting

### **Häufige Probleme**

**"Apply-Script fehlt"**
```bash
warp run create-coderabbit-script
```

**"Du bist auf dem BASE-Branch"**
```bash
git checkout -b feature/my-changes
```

**"CI checks failed"**
```bash
export SKIP_REBASE=true  # Bei rebase-bedingten Fehlern
warp run deploy-auto-branch
```

**"Vercel CLI nicht installiert"**
```bash
npm install -g vercel
vercel login
```

**"CodeRabbit Timeout"**
```bash
export TIMEOUT_SECONDS=900
export MAX_CYCLES=3
warp run deploy-auto-branch
```

### **Debug-Modus**
```bash
export DRY_RUN=true
export MAX_CYCLES=1
warp run deploy-auto-branch  # Sehen was passiert würde
```

## 📈 Weiterentwicklung

Die Workflows sind modular aufgebaut und können leicht erweitert werden:

- 🔌 **Neue Pre-Deploy Guards** hinzufügen
- 🎯 **Deployment-Targets** erweitern  
- 🤖 **Weitere Bots** integrieren
- 📊 **Metriken & Analytics** anhängen
- 🔔 **Notifications** (Slack, Teams, etc.)

## 💡 Pro-Tips

1. **Nutzen Sie Labels für Kontrolle:** `REQUIRES_LABEL=production-ready`
2. **Monorepo Support:** `APP_DIR=packages/frontend`  
3. **Schnelle Iteration:** `export SKIP_REBASE=true` während Entwicklung
4. **Safety First:** Immer erst `test-deploy` bei kritischen Changes
5. **Emergency Ready:** `rollback-last` für schnelle Reverts

---

**Happy Deploying! 🚀** 

Bei Fragen oder Problemen: Check die Logs, nutze `DRY_RUN=true`, und vergiss nicht die rollback-Option!
