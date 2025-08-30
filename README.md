# Venture Dossier - AI-Powered Investment Analysis System

**Transform startup pitches into comprehensive investor dossiers using cutting-edge AI models.**

## 🏆 Overview

The Venture Dossier system has evolved from a simple pitchdeck generator into a sophisticated investment analysis platform that leverages OpenAI's newest models, including o3-mini and GPT-4o, to create institutional-quality investment dossiers.

### Key Features

- **Multi-Stage AI Pipeline**: o3 → GPT-4o → o3 processing chain
- **Enhanced Question System**: Interactive follow-up questions with assumption tracking
- **Investment Scoring**: Automated scoring with detailed breakdown
- **Professional Visualizations**: Investor-grade presentation format
- **Assumption Tracking**: Transparent handling of missing information
- **Multi-Language Support**: German and English output

## 🚀 Architecture

### Frontend (Next.js 15)
- **React 18** with TypeScript
- **App Router** with API routes
- **Tailwind CSS** styling
- **Enhanced UI Components** for professional presentation

### AI Pipeline (4-Stage Processing)

1. **Synthesis Stage** (o3-mini)
   - Initial dossier creation from basic startup info
   - Market analysis and competitive landscape
   - Business model evaluation

2. **Integration Stage** (o3-mini) 
   - User answer integration
   - Assumption policy application
   - Enhanced question processing

3. **Scoring Stage** (o3-mini)
   - Investment scoring (1-10 scale)
   - Risk assessment
   - Detailed scoring breakdown

4. **Polish Stage** (GPT-4o)
   - Narrative enhancement
   - Professional language optimization
   - Final presentation polish

### Enhanced Question System
- **Smart Questions**: Context-aware follow-up questions
- **Assumption Tracking**: Transparent handling of missing data
- **Interactive UI**: Modern dialog-based question interface
- **Preset Responses**: Quick answer options for common questions

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

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key with o3 and GPT-4 access

### Setup

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd agile-assistant-full
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Create .env.local in frontend directory
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Development Mode
```bash
cd frontend
npm run dev
```

### Production Deployment
```bash
npm run build
npm run start
```

### API Endpoints

#### `/api/venture-dossier` (POST)
Main pipeline endpoint supporting staged processing:

**Request Body:**
```json
{
  "project_name": "string",
  "elevator_pitch": "string", 
  "geo_focus": "string (optional)",
  "time_horizon": "string (optional)",
  "target_audience": "string (optional)",
  "user_answers": "object (optional)",
  "assumptions_selected": "boolean (optional)",
  "stage": "synthesis|integration|scoring|polish|full"
}
```

**Response:**
```json
{
  "dossier": {
    "executive_summary": "string",
    "company_overview": "string",
    "market_analysis": "string",
    "business_model": "string",
    "financial_projections": "string",
    "team": "string",
    "risk_assessment": "string",
    "investment_recommendation": "string",
    "investment_score": "number (1-10)",
    "scoring_breakdown": "object",
    "missing_info_questions": "array"
  },
  "pipeline_meta": {
    "steps_completed": "array",
    "total_processing_time": "number",
    "models_used": "array"
  }
}
```

## 🎯 Use-Cases

1. **🎩 Pitchdeck**: 14-Slide Gerüst mit Cover, Mission, Problem, Lösung, Markt, GTM, Business Model, Financials, Competition, Roadmap, Team, Ask, Kontakt
2. **📋 Backlog**: Product Goal → KRs → Opportunities → Roadmap → PBIs
3. **🗺️ Roadmap**: Now-Next-Later Struktur mit Prioritäten
4. **📊 Estimation**: Relative Schätzung von Stories
5. **🔄 Retro**: ICE-Framework für Retrospectives

## 🧠 AI Models & Prompts

### Model Selection Strategy
- **o3-mini**: Complex reasoning, analysis, and scoring tasks
- **GPT-4o**: Language polishing and narrative enhancement
- **Fallback**: Automatic fallback to GPT-4o if o3 unavailable

### Prompt Engineering
All prompts are stored in `/frontend/src/prompts/` and include:

- `dossier-synthesis.md` - Initial dossier creation
- `answer-integration.md` - User answer processing  
- `investor-scoring.md` - Investment evaluation
- `narrative-polish.md` - Final narrative enhancement

### Timeout Handling
- **o3 models**: 45-second timeout
- **GPT models**: 30-second timeout
- **Error Recovery**: Graceful fallbacks and error messages

## 🎨 UI Components

### Core Components
- **VentureDossierViewer**: Main dossier display component
- **EnhancedQuestionDialog**: Interactive Q&A interface
- **LoadingIndicator**: Multi-stage progress display
- **Card**: Reusable content containers

### Type Definitions
Comprehensive TypeScript interfaces in:
- `/frontend/src/types/venture-dossier.ts`
- `/frontend/src/types/pitchdeck.ts`

## 🔧 Configuration

### Next.js Configuration
- **Runtime**: Node.js for API routes
- **Timeout**: 60 seconds for Vercel deployment
- **Build**: Optimized for production deployment

### Environment Variables
```bash
OPENAI_API_KEY=sk-...           # Required: OpenAI API key
NEXT_PUBLIC_APP_NAME=VentureDossier  # Optional: App branding
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 🧪 Testing

### Build Verification
```bash
cd frontend
npm run build  # Verifies successful compilation
```

### API Testing
Use tools like Postman or curl to test the `/api/venture-dossier` endpoint with sample data.

## 📋 Recent Updates

### ✅ Completed Features
- [x] Multi-stage o3 → GPT-4o → o3 pipeline
- [x] Enhanced question system with presets
- [x] Assumption tracking and transparency
- [x] Investment scoring with breakdown
- [x] Professional dossier viewer component
- [x] Frontend integration and UI polish
- [x] Error handling and timeouts
- [x] Build optimization and deployment readiness

### 🎯 Deployment Ready
The system is fully functional and ready for deployment with:
- ✅ Frontend builds successfully
- ✅ API routes properly configured
- ✅ All components integrated
- ✅ Error handling implemented
- ✅ Professional UI/UX
- ✅ TypeScript type safety

## 📞 Support

For issues, feature requests, or deployment assistance, please create an issue in the repository.

---

**Status**: ✅ **PRODUCTION READY** 
**Last Updated**: January 2025
**Version**: 2.0.0 (Venture Dossier)
