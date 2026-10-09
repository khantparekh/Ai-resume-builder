import mongoose from 'mongoose';

const interviewQuestionItemSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['technical', 'resume-based', 'behavioral'],
            required: true
        },
        question: {
            type: String,
            required: true
        },
        context: {
            type: String,
            default: ""
        },
        expectedKeyPoints: [{
            type: String
        }],
        userAnswer: {
            type: String,
            default: ""
        },
        score: {
            type: Number,
            default: null
        },
        feedback: {
            type: String,
            default: ""
        },
        idealAnswer: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const overallEvaluationSchema = new mongoose.Schema(
    {
        overallScore: {
            type: Number,
            default: 0
        },
        technicalScore: {
            type: Number,
            default: 0
        },
        communicationScore: {
            type: Number,
            default: 0
        },
        behavioralScore: {
            type: Number,
            default: 0
        },
        verdict: {
            type: String,
            enum: ['Strong Hire', 'Hire', 'Borderline', 'Needs Improvement'],
            default: 'Needs Improvement'
        },
        strengths: [{
            type: String
        }],
        improvements: [{
            type: String
        }],
        summary: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewReport'
        },
        roleTitle: {
            type: String,
            default: "Target Role"
        },
        jobDescription: {
            type: String,
            default: ""
        },
        resume: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress'
        },
        questions: [ interviewQuestionItemSchema ],
        overallEvaluation: overallEvaluationSchema
    },
    { timestamps: true }
);

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
