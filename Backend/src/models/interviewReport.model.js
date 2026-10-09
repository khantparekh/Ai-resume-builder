import mongoose from 'mongoose';

const technicalQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Technical Question is required"]
        },
        intention: {
            type: String,
            required: [true, "Intention is required"]
        },
        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    { _id: false }
);

const behavioralQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, "Behavioral Question is required"]
        },
        intention: {
            type: String,
            required: [true, "Intention is required"]
        },
        answer: {
            type: String,
            required: [true, "Answer is required"]
        }
    },
    { _id: false }
);

const skillGapSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: [true, "Skill is required"]
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: [true, "Severity is required"]
        },
        recommendation: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const preparationPlanSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: [true, "Day is required"]
        },
        focus: {
            type: String,
            required: [true, "Focus is required"]
        },
        tasks: [{
            type: String,
            required: [true, "Task is required"]
        }]
    },
    { _id: false }
);

const atsOptimizationSchema = new mongoose.Schema(
    {
        atsScore: {
            type: Number,
            default: 70
        },
        matchingKeywords: [{
            type: String
        }],
        missingKeywords: [{
            keyword: { type: String },
            importance: { type: String, enum: ['critical', 'recommended', 'bonus'], default: 'recommended' },
            context: { type: String, default: "" }
        }],
        suggestedSummary: {
            type: String,
            default: ""
        },
        experienceBulletPoints: [{
            originalOrRole: { type: String, default: "" },
            improvedBullet: { type: String, required: true },
            rationale: { type: String, default: "" }
        }],
        skillsSectionRecommendation: {
            hardSkills: [{ type: String }],
            toolsAndFrameworks: [{ type: String }],
            softSkills: [{ type: String }]
        },
        actionableTips: [{
            category: { type: String },
            tip: { type: String },
            impact: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
        }],
        optimizedResumeMarkdown: {
            type: String,
            default: ""
        }
    },
    { _id: false }
);

const interviewReportSchema = new mongoose.Schema(
    {
        jobDescription: {
            type: String,
            required: [true, "Job description is required"]
        },
        resume: {
            type: String,
            default: ""
        },
        selfDescription: {
            type: String,
            default: ""
        },
        roleTitle: {
            type: String,
            default: "Target Role"
        },
        summary: {
            type: String,
            default: ""
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 50
        },
        technicalQuestions: [ technicalQuestionSchema ],
        behavioralQuestions: [ behavioralQuestionSchema ],
        skillGaps: [ skillGapSchema ],
        preparationPlan: [ preparationPlanSchema ],
        atsOptimization: atsOptimizationSchema,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, 
    { timestamps: true }
);

export const InterviewReport = mongoose.model("InterviewReport", interviewReportSchema);