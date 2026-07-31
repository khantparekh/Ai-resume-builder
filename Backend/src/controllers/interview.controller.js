import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { InterviewReport } from '../models/interviewReport.model.js';
import { PDFParse } from 'pdf-parse';
import {generateInterviewReport} from '../services/ai.service.js';

/**
 * @name generateInterviewReportController
 * @description generates the interview report based on the resume, self description and jod description
 * @access public
 */

const generateInterviewReportController = asyncHandler(async(req, res) => {

    const resumeContent = await (new PDFParse(new Uint8Array(req.file.buffer))).getText();
    const {selfDescription, jobDescription } = req.body;
    
    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    });

    const interviewReport = await InterviewReport.create({
        user: req.user?.id,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    });

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        interviewReport,
        "Interview Report generated successfully"
    ));
})

export {
    generateInterviewReportController,
}