# CareerCompat AI (Career Compatibility AI)

**CareerCompat AI** is an intelligent full-stack career platform designed to bridge the gap between candidate resumes and target job descriptions. Powered by Google Gemini and modern reactive design, it evaluates job compatibility, generates ATS-friendly resume updates, and conducts interactive AI mock interviews with performance scoring.

---

## Key Features

1. **Precision Resume vs. Job Description Matching**
   - Ingests PDF resumes or plain text.
   - Calculates a realistic match score ($0-100\%$).
   - Highlights prioritized skill gaps (`High Priority`, `Medium`, `Matched`) with actionable recommendations.
   - Generates high-yield technical and behavioral interview preparation questions.
   - Provides an interactive day-by-day preparation roadmap.

2. **ATS Resume Studio & Optimizer**
   - Calculates ATS readability and keyword pass likelihood.
   - Extracts missing keywords and indicates strategic placement contexts.
   - Rewrites bullet points using Google's X-Y-Z formula (*"Accomplished [X] as measured by [Y] by doing [Z]"*).
   - Recommends structured skills section formatting for ATS parsers.
   - Creates a tailored professional summary statement.
   - Generates a full ATS-compliant Markdown draft ready to copy or download (`.md` / `.txt`).

3. **AI Mock Interview Simulator**
   - Generates 6 tailored questions: 2 Technical, 2 Resume-based, and 2 Behavioral (STAR method).
   - Text-to-Speech audio question playback.
   - Speech-to-Text voice recognition for hands-free answering.
   - Instant performance evaluation with overall score, category breakdown (Technical, Communication, Behavioral), hiring verdict badge, and exemplar model answers.

---

## Tech Stack

- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose, `@google/genai` (Gemini Flash), JWT, Zod.
- **Frontend**: React 19, Vite, SCSS, React Router v7, Axios, Google Fonts (Hanken Grotesk, Geist), Material Symbols.

---

## Getting Started

### 1. Backend Setup
```bash
cd Backend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.