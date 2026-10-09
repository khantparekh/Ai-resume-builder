<div align="center">

# CareerCompat AI
 
**Match your resume to any job, optimize it for ATS, and practice interviews with AI.**
 
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?logo=googlegemini&logoColor=white)
 
</div>
CareerCompat AI is an intelligent full-stack career platform that bridges the gap between candidate resumes and target job descriptions. Powered by Google Gemini and a modern reactive UI, it evaluates job compatibility, generates ATS-friendly resume updates, and runs interactive AI mock interviews with performance scoring.
 
---
 
## Table of Contents
 
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Roadmap](#roadmap)
- [Author](#author)
---
 
## Features
 
### 1. Precision Resume vs. Job Description Matching
- Ingests **PDF resumes** or plain text.
- Calculates a realistic **match score (0-100)**.
- Highlights prioritized skill gaps (`High Priority`, `Medium`, `Matched`) with actionable recommendations.
- Generates high-yield **technical and behavioral interview questions**.
- Provides an interactive **day-by-day preparation roadmap**.
### 2. ATS Resume Studio & Optimizer
- Calculates **ATS readability** and keyword pass likelihood.
- Extracts **missing keywords** and shows where to place them.
- Rewrites bullet points using Google's **X-Y-Z formula**: *"Accomplished [X] as measured by [Y] by doing [Z]"*.
- Recommends a structured **skills section** that ATS parsers read correctly.
- Writes a tailored **professional summary**.
- Generates a full **ATS-compliant Markdown draft**, ready to copy or download (`.md` / `.txt`).
### 3. AI Mock Interview Simulator
- Generates **6 tailored questions**: 2 Technical, 2 Resume-based, 2 Behavioral (STAR method).
- **Text-to-Speech** playback of each question.
- Instant performance evaluation with:
  - Overall score
  - Category breakdown (Technical, Communication, Behavioral)
  - Hiring verdict badge
  - Exemplar model answers
- **Speech-to-Text** voice answering for hands-free practice *(in progress)*.
---
 
## Tech Stack
 
| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, SCSS, React Router v7, Axios, Google Fonts (Hanken Grotesk, Geist), Material Symbols |
| **Backend** | Node.js, Express, MongoDB Atlas, Mongoose, JWT, Zod |
| **AI** | Google Gemini Flash via `@google/genai` |
 
---
 
## Project Structure
 
```
Ai-resume-builder/
├── Backend/     # Express API, Mongoose models, auth, Gemini integration
├── Frontend/    # React 19 + Vite client
├── .gitignore
└── README.md
```
 
---
 
## Getting Started
 
### Prerequisites
 
- [Node.js](https://nodejs.org/) v18 or later
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any MongoDB connection string)
- A [Google Gemini API key](https://aistudio.google.com/apikey)
### 1. Clone the repository
 
```bash
git clone https://github.com/khantparekh/Ai-resume-builder.git
cd Ai-resume-builder
```
 
### 2. Set up the backend
 
```bash
cd Backend
npm install
```
 
Create a `.env` file in `Backend/` (see [Environment Variables](#environment-variables)), then start the server:
 
```bash
npm run dev
```
 
The API runs on **http://localhost:3000**.
 
### 3. Set up the frontend
 
Open a second terminal:
 
```bash
cd Frontend
npm install
npm run dev
```
 
The app runs on **http://localhost:5173**.
 
---
 
## Environment Variables
 
Create `Backend/.env` with the following. Variable names may differ slightly in your code, so match them to what your backend reads.
 
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_secret
GEMINI_API_KEY=your_google_gemini_api_key
```
 
> Never commit your `.env` file. It is already excluded by `.gitignore`.
 
---
 
## How It Works
 
```
 Resume (PDF / text) + Job Description
                 │
                 ▼
        Express API (JWT-protected, Zod-validated)
                 │
                 ▼
        Google Gemini (structured JSON output)
                 │
     ┌───────────┼─────────────┐
     ▼           ▼             ▼
 Match score   ATS Studio   Mock interview
 + skill gaps  + rewrites   + scoring
     │           │             │
     └───────────┴─────────────┘
                 ▼
        React dashboard  ⇄  MongoDB Atlas
```
 
1. The user signs in and uploads a resume (PDF or text) with a target job description.
2. The backend validates the request with **Zod**, then prompts **Gemini** for structured analysis.
3. Results are saved to **MongoDB Atlas** and rendered in the React dashboard as scores, gap tables, rewritten bullets and interview feedback.
---
 
## Roadmap
 
- [x] Resume vs. job description matching with skill gaps
- [x] ATS Resume Studio with Markdown export
- [x] AI mock interview with scoring and model answers
- [x] Text-to-Speech question playback
- [ ] Speech-to-Text voice answers
- [ ] PDF export of the optimized resume
---
 
## Author
 
**Khantkumar Parekh**
Computer Engineering student, Gujarat Technological University
 
[GitHub](https://github.com/khantparekh) · [LinkedIn](https://www.linkedin.com/in/khant-parekh-b61110375/)
 