# 🎩 Pitchdeck Generator - Powered by AI

Ein KI-gestütztes Tool zur automatischen Generierung von professionellen Pitchdeck-Gerüsten aus Elevator Pitches. Zusätzlich unterstützt für Product Backlogs, Roadmaps und andere agile Artefakte.

## 🏗️ Architektur

```
agile-assistant-full/
├── frontend/                 # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/generate/    # Hauptendpoint für AI-Generierung
│   │   │   ├── layout.tsx       # App Layout
│   │   │   └── page.tsx         # Hauptformular
│   │   ├── components/
│   │   │   ├── FormField.tsx    # Erweiterte Form-Komponente
│   │   │   ├── LoadingIndicator.tsx # Progress-Animation
│   │   │   ├── Card.tsx         # Flexible Card-Komponente
│   │   │   ├── StepDialog.tsx   # 5-Schritte Pitchdeck-Dialog
│   │   │   ├── PitchSlide.tsx   # Einzelne Slide-Darstellung
│   │   │   ├── PitchdeckViewer.tsx # Komplette Deck-Ansicht
│   │   │   └── MissingInfoDialog.tsx # Follow-up für fehlende Daten
│   │   └── types/
│   │       └── pitchdeck.ts     # TypeScript Definitionen
├── backend/                  # Express.js API (Port 3001)
│   ├── services/
│   │   ├── llm.js              # Claude & OpenAI API-Calls
│   │   ├── prompts.js          # Prompt-Loading & Building
│   │   ├── response.js         # Response-Formatierung
│   │   └── cache.js            # In-Memory Caching
│   ├── __tests__/              # Unit Tests
│   └── index.js                # Express Server
├── shared/
│   ├── prompts/                # Zentralisierte AI-Prompts
│   └── validation.js           # Umfassende Input-Validation
└── README.md                   # Diese Datei
```

## 🚀 Features

### 🎩 Pitchdeck-Generierung (NEU)
- **5-Schritte Dialog**: Projektname → Elevator Pitch → Kontext → Zielgruppe
- **14-Slide-Gerüst**: Von Cover bis Kontakt mit investor-optimierter Struktur  
- **Missing-Info Follow-up**: Intelligente Nachfragen für stärkere Pitchdecks
- **Slide-Navigation**: Übersicht und Detail-Ansicht mit visuellen Elementen
- **Auto-Save & Resume**: Automatisches Speichern und Fortsetzen von Entwürfen

### Automatisierte Backlog-Generierung
- **7-Fragen-Framework**: Strukturierte Eingabe für outcome-basierte Artefakte
- **Multi-Provider-Support**: OpenAI GPT-4o-mini & Anthropic Claude
- **Flexible Ausgaben**: JSON oder Markdown Format
- **Multiple Use-Cases**: **Pitchdeck**, Backlog, Roadmap, Estimation, Retrospective

### Performance & Reliability
- **Response-Caching**: 1h TTL mit LRU-Eviction (bis zu 100% Kosteneinsparung bei identischen Requests)
- **Rate Limiting**: 10 Requests/Minute zum Schutz vor Missbrauch
- **Input-Validation**: Client- und Server-seitig mit detaillierten Fehlermeldungen
- **Error Handling**: Robuste Fehlerbehandlung mit strukturierten Responses

### User Experience
- **Real-time Validation**: Sofortiges Feedback bei Eingabefehlern
- **Progress-Stages**: Live-Updates während der Generierung
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Intuitive Navigation**: Klare Guidance durch den Prozess

## 🛠️ Entwicklung

### Setup
```bash
# Backend
cd backend
npm install
npm start                 # Port 3001

# Frontend  
cd frontend
npm install
npm run dev              # Port 3000
```

### Tests
```bash
cd backend
npm test                 # Unit Tests
npm run test:coverage    # Mit Coverage-Report
```

### API-Endpoints

#### `POST /generate`
Hauptendpoint für AI-Generierung mit Cache-Support und Validation.

**Pitchdeck Request:**
```json
{
  "usecase": "pitchdeck",
  "structure": "epics_stories", 
  "format": "json",
  "provider": "claude",
  "answers": {
    "project_name": "HappyNest",
    "elevator_pitch": "HappyNest ist das digitale Zuhause für moderne Familien. Unsere App vereint Organisation und emotionale Unterstützung - mit smartem Kalender, Kostenaufteilung und KI-Mediation.",
    "geo_focus": "DACH → EU → Global",
    "time_horizon": "bis 2030",
    "target_audience": "Pre-Seed VCs, Business Angels"
  }
}
```

**Backlog Request:**
```json
{
  "usecase": "backlog",
  "structure": "epics_stories", 
  "format": "json",
  "provider": "gpt",
  "answers": {
    "q1_segment": "EU Neukunden",
    "q2_problem": "Hohe Checkout-Abbruchrate",
    "q3_behavior_change": "Mehr Conversions",
    "q4_metrics": "Abbruchrate 65% → 45%",
    "q5_constraints": "2 Devs, 8 Wochen", 
    "q6_assets": "Stripe, Feature-Flags",
    "q7_horizon": "Q4, 20% Pilot"
  },
  "guidelines": "Nutze HEART-Metriken"
}
```

#### `GET /cache/stats`
Cache-Monitoring für Performance-Überwachung.

## 🎯 Use-Cases

1. **🎩 Pitchdeck**: 14-Slide Gerüst mit Cover, Mission, Problem, Lösung, Markt, GTM, Business Model, Financials, Competition, Roadmap, Team, Ask, Kontakt
2. **📋 Backlog**: Product Goal → KRs → Opportunities → Roadmap → PBIs
3. **🗺️ Roadmap**: Now-Next-Later Struktur mit Prioritäten
4. **📊 Estimation**: Relative Schätzung von Stories
5. **🔄 Retro**: ICE-Framework für Retrospectives

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# Backend (.env)
ANTHROPIC_API_KEY=your_claude_key_here
OPENAI_API_KEY=your_openai_key_here
PORT=3001

# Frontend automatisch über Next.js
```

### AI-Provider
- **Claude**: Haiku-Model für schnelle, kostengünstige Generierung
- **GPT**: GPT-4o-mini für ausgeglichene Performance/Kosten-Ratio

## 📊 Monitoring

- Cache-Hit-Rate über `/cache/stats`
- Request-Logs mit strukturiertem Format
- Performance-Metriken in Console-Output

## 🔮 Nächste Schritte

- [ ] WebSocket-Support für Real-time Updates
- [ ] Persistente Cache-Layer (Redis)
- [ ] A/B-Testing für Prompt-Optimierung
- [ ] Export-Funktionen (JIRA, Azure DevOps)
- [ ] Team-Collaboration-Features
