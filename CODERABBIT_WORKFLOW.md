# 🤖 Auto Deploy Workflow mit CodeRabbit Integration

Dieser Workflow automatisiert den gesamten Deploy-Prozess mit CodeRabbit Integration, einschließlich:

- ✅ Änderungen committen/pushen und PR erstellen/aktualisieren
- ⏳ Auf CodeRabbit-Review warten
- 🤖 Automatische Anwendung von GitHub Suggested Changes
- 📋 Zusammenfassung der letzten 3 Bot-Kommentare
- 🚀 Vercel Preview Deployment mit URL-Ausgabe

## 🚀 Quick Start

### 1. Workflow ausführen

```bash
# Im GitHub Repository unter "Actions" → "🤖 Auto Deploy with CodeRabbit Integration"
# Oder über die GitHub CLI:
gh workflow run auto-deploy-with-coderabbit.yml
```

### 2. Optionale Parameter

- **Commit Message**: Nachricht für den automatischen Commit
- **Target Branch**: Ziel-Branch für die PR (Standard: main)

## 📋 Workflow-Schritte

### 1. 📝 Commit Changes & Create PR

- Prüft auf lokale Änderungen
- Committed und pushed alle Änderungen in den aktuellen Branch
- Erstellt eine neue PR oder aktualisiert eine bestehende PR gegen den target branch

### 2. ⏳ Wait for CodeRabbit Review  

- Wartet bis zu 15 Minuten auf CodeRabbit Review-Kommentare
- Prüft alle 30 Sekunden auf neue Bot-Kommentare
- Läuft mit Timeout weiter, wenn kein Review kommt

### 3. 🤖 Apply CodeRabbit Suggestions

**Nur ausgeführt wenn CodeRabbit Review gefunden wurde**

- Sucht nach GitHub Suggested Changes vom `coderabbitai[bot]`
- Wendet alle Suggestions automatisch an
- Committed und pushed die Änderungen zurück in den Branch

### 4. 📋 Summarize Bot Comments

- Sammelt die letzten 3 CodeRabbit Bot-Kommentare
- Erstellt eine formatierte Zusammenfassung
- Posted die Zusammenfassung als Kommentar in die PR

### 5. 🚀 Deploy Vercel Preview

- Deployt Frontend und Backend als Vercel Preview
- Gibt die Preview-URLs aus
- Posted Deployment-URLs als Kommentar in die PR

### 6. ✅ Final Status

- Zeigt eine Zusammenfassung aller Workflow-Schritte
- Listet alle wichtigen URLs (PR, Frontend Preview, Backend Preview)

## 🔧 Setup-Voraussetzungen

### GitHub Secrets

Diese Secrets müssen in den Repository Settings konfiguriert werden:

```
VERCEL_TOKEN          # Vercel API Token
VERCEL_ORG_ID         # Vercel Organization ID  
VERCEL_PROJECT_ID     # Vercel Project ID (Frontend)
VERCEL_BACKEND_PROJECT_ID # Vercel Project ID (Backend)
```

### CodeRabbit Integration

- CodeRabbit muss als GitHub App im Repository installiert sein
- Der Bot sollte automatisch PRs reviewen
- GitHub Suggested Changes müssen aktiviert sein

## 📁 Dateien-Struktur

```
.github/
├── workflows/
│   └── auto-deploy-with-coderabbit.yml  # Haupt-Workflow
└── scripts/
    ├── apply-coderabbit-suggestions.sh   # CodeRabbit Suggestions Script
    └── summarize-bot-comments.sh         # Bot-Kommentar Zusammenfassung
```

## 🛠️ Scripts im Detail

### apply-coderabbit-suggestions.sh

Dieses Script:
- Findet alle GitHub Suggested Changes vom CodeRabbit Bot
- Wendet sie automatisch auf die entsprechenden Dateien an
- Erstellt Backups vor jeder Änderung
- Committed und pushed die Änderungen

**Verwendung:**
```bash
./apply-coderabbit-suggestions.sh <PR_NUMBER>
```

### summarize-bot-comments.sh

Dieses Script:
- Holt die letzten 3 CodeRabbit Kommentare via GitHub API
- Formatiert sie in eine übersichtliche Markdown-Zusammenfassung
- Kürzt sehr lange Kommentare automatisch

**Verwendung:**
```bash
./summarize-bot-comments.sh <PR_NUMBER>
```

## 📊 Workflow Outputs

Der Workflow gibt folgende Informationen aus:

### In den Workflow-Logs:
- Status jedes einzelnen Schritts
- CodeRabbit Suggestion Details
- Bot-Kommentar Zusammenfassung
- Deployment URLs

### Als PR-Kommentare:
- 📋 CodeRabbit Bot-Kommentar Zusammenfassung
- 🚀 Vercel Preview Deployment URLs

### Im Final Status:
- ✅ Übersicht über alle Workflow-Ergebnisse
- 🔗 Links zu PR und Preview-Deployments

## 🔄 Trigger-Optionen

### Manual Trigger (workflow_dispatch)

Der Workflow kann manuell gestartet werden mit optionalen Parametern:

- **commit_message**: Custom commit message (Standard: "Auto-commit: Latest changes")
- **target_branch**: Target branch für PR (Standard: "main")

### Automatic Trigger (Optional)

Der Workflow kann erweitert werden für automatische Trigger:

```yaml
on:
  push:
    branches: [develop, feature/*]
  schedule:
    - cron: '0 9 * * 1-5'  # Täglich Mo-Fr um 9:00
```

## 🚨 Error Handling

### Robuste Fehlerbehandlung:

- **Keine Änderungen**: Workflow läuft durch ohne Fehler
- **Kein CodeRabbit Review**: Timeout nach 15 Minuten, Workflow läuft weiter
- **Keine Suggestions**: Script gibt informativen Output aus
- **Vercel Deployment Fehler**: Andere Schritte laufen trotzdem durch
- **Git Konflikte**: Backup-Dateien werden erstellt

### Debugging:

Alle Scripts geben detaillierte Logs aus:
```bash
# Beispiel Log-Ausgabe:
🔍 Suche nach CodeRabbit Suggested Changes in PR #123...
✅ CodeRabbit Reviews gefunden, prüfe auf Suggested Changes...
🎯 Gefunden: 2 Suggested Changes
📝 Applying suggestion to src/utils.js at line 42
✅ Suggestion angewendet auf src/utils.js
```

## 📈 Best Practices

### 1. Branch-Namen
Verwende beschreibende Branch-Namen:
```
feature/add-user-authentication
bugfix/fix-login-redirect
hotfix/security-patch
```

### 2. CodeRabbit Konfiguration
Stelle sicher, dass CodeRabbit folgende Settings hat:
- Auto-Review für PRs aktiviert
- GitHub Suggestions aktiviert
- Review-Kommentare für alle Dateitypen

### 3. Vercel Projekte
- Separate Vercel-Projekte für Frontend und Backend
- Preview Deployments aktiviert
- Richtige Build-Commands konfiguriert

## 🎯 Erweiterte Konfiguration

### Custom Commit Messages
```yaml
- name: Custom Commit
  run: |
    git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M')"
```

### Slack/Discord Benachrichtigungen
```yaml
- name: 💬 Send Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Database Migrations
```yaml
- name: 🗃️ Run Migrations
  run: npm run migrate
```

## 🔒 Sicherheit

### Token-Berechtigungen

Der Workflow benötigt folgende GitHub Token-Permissions:
- `contents: write` (für commits)
- `pull-requests: write` (für PR-Erstellung)
- `issues: write` (für Kommentare)

### Vercel Tokens

- Verwende Vercel Tokens mit minimalen Rechten
- Regelmäßige Rotation der Tokens
- Überwache Token-Nutzung im Vercel Dashboard

## 🏃‍♂️ Troubleshooting

### Häufige Probleme:

1. **"No CodeRabbit reviews found"**
   - Prüfe ob CodeRabbit App installiert ist
   - Stelle sicher, dass Bot für das Repository konfiguriert ist

2. **"Vercel deployment failed"**
   - Prüfe Vercel Token und Project IDs
   - Stelle sicher, dass Build-Commands korrekt sind

3. **"Git push failed"**
   - Möglicherweise wurden Dateien extern geändert
   - Prüfe Branch-Schutz Regeln

4. **Script-Permissions**
   ```bash
   chmod +x .github/scripts/*.sh
   ```

### Debug-Modus aktivieren:

Füge zu den Scripts hinzu:
```bash
set -x  # Zeigt alle ausgeführten Befehle
```

## 📞 Support

Bei Problemen oder Fragen:

1. Prüfe die Workflow-Logs in GitHub Actions
2. Validiere alle required Secrets
3. Teste Scripts lokal mit entsprechenden Environment Variables

---

**🎉 Happy Deploying mit CodeRabbit Integration!**
