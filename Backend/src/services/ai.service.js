import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema'

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("The match score between the candidate's profile and the job description, ranging from 0 to 100, where 0 means no match and 100 means perfect match"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("how to answer this question in interview, what points to cover, what approach to take etc."),
    })).describe("Technical questions that can be asked in the interview, along with the intention behind asking the question and how to answer it"),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("how to answer this question in interview, what points to cover, what approach to take etc."),
    })).describe("Behavioral questions that can be asked in the interview, along with the intention behind asking the question and how to answer it"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill that is missing"),
        severity: z.enum(['low', 'medium','high']).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances"),
    })).describe("List of skill gaps in the candidate's profile along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string().describe("A task to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
});

async function generateInterviewReport({resume, selfDescription, jobDescription}) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}`;

    

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text);
}

export {
    generateInterviewReport,
}