import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const CANDIDATE_MODELS = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite'
];

/**
 * Resilient caller with model fallback across active Gemini models
 */
async function callGeminiWithFallback(prompt, zodSchema, systemInstruction = "") {
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
        try {
            const config = {
                responseMimeType: "application/json",
            };
            if (zodSchema) {
                config.responseSchema = zodToJsonSchema(zodSchema);
            }
            if (systemInstruction) {
                config.systemInstruction = systemInstruction;
            }

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config
            });

            if (response && response.text) {
                const parsed = JSON.parse(response.text);
                return parsed;
            }
        } catch (err) {
            console.warn(`[AI Service] Model ${model} failed: ${err.message}. Trying next fallback...`);
            lastError = err;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown'}`);
}

/* ==========================================================================
   1. Comprehensive Match & ATS Optimization Schema
   ========================================================================== */
const interviewReportSchema = z.object({
    roleTitle: z.string().describe("Inferred job title or target role from the job description"),
    summary: z.string().describe("Concise 2-3 sentence executive summary of the candidate's alignment with the role"),
    matchScore: z.number().min(0).max(100).describe("Overall compatibility score from 0 to 100"),
    
    technicalQuestions: z.array(z.object({
        question: z.string().describe("Targeted technical question based on the job requirements"),
        intention: z.string().describe("The interviewer's underlying motivation and what they are testing"),
        answer: z.string().describe("Comprehensive guide on how to answer with technical depth and best practices"),
    })).describe("3-4 high-yield technical questions tailored to the role"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("Behavioral/situational question matching the role's seniority and team dynamics"),
        intention: z.string().describe("What soft skill, leadership trait, or culture fit element is being tested"),
        answer: z.string().describe("How to answer using the STAR method with clear examples"),
    })).describe("3-4 impactful behavioral questions"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("Missing or underrepresented skill required by the JD"),
        severity: z.enum(['low', 'medium', 'high']).describe("Impact level of the gap on hiring chances"),
        recommendation: z.string().describe("Concrete advice or resource to bridge this gap quickly")
    })).describe("Prioritized skill gaps identified"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number (1, 2, 3...)"),
        focus: z.string().describe("Core domain or subject for the day"),
        tasks: z.array(z.string()).describe("Actionable tasks to complete on this day")
    })).describe("5 to 7 day preparation roadmap"),

    atsOptimization: z.object({
        atsScore: z.number().min(0).max(100).describe("Current ATS readiness score out of 100"),
        matchingKeywords: z.array(z.string()).describe("Important keywords from the JD already found in the resume"),
        missingKeywords: z.array(z.object({
            keyword: z.string().describe("Missing keyword from the JD"),
            importance: z.enum(['critical', 'recommended', 'bonus']).describe("Priority of adding this keyword"),
            context: z.string().describe("Where and how in the resume this keyword should naturally be incorporated")
        })).describe("Crucial keywords that should be added to beat ATS screeners"),
        suggestedSummary: z.string().describe("A powerful 3-4 sentence ATS-optimized professional summary crafted specifically for this job description"),
        experienceBulletPoints: z.array(z.object({
            originalOrRole: z.string().describe("The role or previous weak bullet point reference"),
            improvedBullet: z.string().describe("ATS-optimized rewrite using strong action verbs, quantifiable metrics, and JD keywords"),
            rationale: z.string().describe("Why this rewrite improves ATS score and recruiter impression")
        })).describe("High-impact bullet point rewrites using the Google X-Y-Z formula (Accomplished [X] as measured by [Y] by doing [Z])"),
        skillsSectionRecommendation: z.object({
            hardSkills: z.array(z.string()).describe("Essential hard skills to feature prominently"),
            toolsAndFrameworks: z.array(z.string()).describe("Tools, frameworks, and technologies to list"),
            softSkills: z.array(z.string()).describe("Key soft and collaboration competencies mentioned in JD")
        }).describe("Recommended structure for the skills section to ensure seamless ATS parsing"),
        actionableTips: z.array(z.object({
            category: z.string().describe("Category e.g. Formatting, Metrics, Keyword Density"),
            tip: z.string().describe("Specific recommendation"),
            impact: z.enum(['high', 'medium', 'low']).describe("Expected impact on ATS ranking")
        })).describe("Strategic actionable tips for maximizing ATS pass rate"),
        optimizedResumeMarkdown: z.string().describe("Complete, fully formatted, ATS-compliant Markdown draft of the candidate's resume tailored to the target role")
    }).describe("In-depth ATS resume optimization recommendations and draft")
});

/**
 * Generate full match report & ATS optimization
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are a Principal Technical Recruiter and Career Optimization AI. Analyze the candidate's resume, self description, and target job description in detail.
Calculate a realistic match score (0-100), identify prioritized skill gaps, provide high-impact technical and behavioral questions with ideal answers, create a day-wise prep plan, and generate a comprehensive ATS-friendly resume enhancement with missing keywords, bullet point rewrites, and a complete ready-to-use ATS markdown draft.

Candidate Resume Content:
"""
${resume || "Not provided directly, rely on self description"}
"""

Candidate Self Description:
"""
${selfDescription || "Not provided"}
"""

Target Job Description:
"""
${jobDescription}
"""
`;

    return await callGeminiWithFallback(
        prompt,
        interviewReportSchema,
        "You are an expert technical hiring manager and ATS optimization specialist. Output strictly valid JSON conforming to the requested schema."
    );
}

/* ==========================================================================
   2. AI Mock Interview: Question Generation Schema
   ========================================================================== */
const interviewQuestionsSchema = z.object({
    roleTitle: z.string().describe("Inferred role title"),
    questions: z.array(z.object({
        id: z.number().describe("Sequential question number 1 to 6"),
        type: z.enum(['technical', 'resume-based', 'behavioral']).describe("Category of the interview question"),
        question: z.string().describe("Clear, conversational interview question"),
        context: z.string().describe("Brief context explaining why this question is relevant to the role or candidate profile"),
        expectedKeyPoints: z.array(z.string()).describe("Key technical points, structures (e.g. STAR), or concepts a candidate must include in a top answer")
    })).describe("6 curated questions: 2 Technical, 2 Resume-based, 2 Behavioral")
});

/**
 * Generate interactive mock interview questions
 */
async function generateMockInterviewQuestions({ resume, jobDescription, selfDescription, roleTitle }) {
    const prompt = `You are an elite Senior Interviewer conducting a realistic job interview.
Generate exactly 6 interview questions for this candidate applying for the role '${roleTitle || "Target Role"}':
- Exactly 2 Technical Questions testing core stack requirements from the Job Description.
- Exactly 2 Resume-based Questions probing projects, tools, or achievements claimed in the Candidate's Resume.
- Exactly 2 Behavioral Questions testing conflict management, leadership, or deadlines using the STAR methodology.

Candidate Resume:
"""
${resume || selfDescription || "Software engineer applicant"}
"""

Candidate Self Description:
"""
${selfDescription || ""}
"""

Target Job Description:
"""
${jobDescription || "Standard software engineering position"}
"""
`;

    return await callGeminiWithFallback(
        prompt,
        interviewQuestionsSchema,
        "You are an experienced technical interviewer. Formulate realistic, engaging, and challenging questions. Output strictly JSON."
    );
}

/* ==========================================================================
   3. AI Mock Interview: Performance Scoring Schema
   ========================================================================== */
const interviewEvaluationSchema = z.object({
    overallScore: z.number().min(0).max(100).describe("Overall interview score from 0 to 100 based on answer quality, depth, and clarity"),
    technicalScore: z.number().min(0).max(100).describe("Score for technical precision, correctness, and architecture knowledge (0-100)"),
    communicationScore: z.number().min(0).max(100).describe("Score for clarity, structure, conciseness, and articulation (0-100)"),
    behavioralScore: z.number().min(0).max(100).describe("Score for culture fit, teamwork, ownership, and STAR method execution (0-100)"),
    verdict: z.enum(['Strong Hire', 'Hire', 'Borderline', 'Needs Improvement']).describe("Hiring recommendation"),
    strengths: z.array(z.string()).describe("Top 3-4 strengths demonstrated across the interview"),
    improvements: z.array(z.string()).describe("Top 3-4 critical areas where the candidate must improve to pass real interviews"),
    summary: z.string().describe("Comprehensive recruiter evaluation summary explaining the rationale behind the scores"),
    evaluatedQuestions: z.array(z.object({
        id: z.number().describe("Question ID"),
        score: z.number().min(0).max(100).describe("Individual score for this question (0-100)"),
        feedback: z.string().describe("Constructive critique: what was done well, what was missing or incorrect"),
        idealAnswer: z.string().describe("A masterclass exemplar answer demonstrating how a top candidate would answer")
    })).describe("Evaluation for each question asked")
});

/**
 * Score candidate's mock interview answers
 */
async function evaluateInterviewPerformance({ questions, candidateAnswers, resume, jobDescription, roleTitle }) {
    const formattedQandA = questions.map((q, idx) => {
        const ans = candidateAnswers.find(a => a.id === q.id)?.userAnswer || "Candidate did not provide an answer / skipped.";
        return `Question ${q.id} [${q.type}]: "${q.question}"
Expected Key Points: ${q.expectedKeyPoints?.join(", ") || "N/A"}
Candidate's Answer: "${ans}"`;
    }).join("\n\n---\n\n");

    const prompt = `You are a Principal Bar Raiser and Technical Hiring Committee Lead.
Evaluate the candidate's performance in this completed mock interview for the position '${roleTitle || "Target Role"}'.

Score each response rigorously yet constructively on a 0-100 scale:
- If an answer is thorough, technically accurate, well-structured, and gives examples: score 80-95.
- If an answer is good but lacks depth or misses some metrics: score 60-79.
- If an answer is vague, overly brief, or contains inaccuracies: score 30-59.
- If blank, skipped, or completely incorrect: score 0-25.

Target Job Description:
"""
${jobDescription || ""}
"""

Candidate Resume:
"""
${resume || ""}
"""

INTERVIEW TRANSCRIPT:
${formattedQandA}
`;

    return await callGeminiWithFallback(
        prompt,
        interviewEvaluationSchema,
        "You are an objective, insightful interview evaluator. Grade performance with precision and provide actionable feedback. Output strictly JSON."
    );
}

export {
    generateInterviewReport,
    generateMockInterviewQuestions,
    evaluateInterviewPerformance,
};