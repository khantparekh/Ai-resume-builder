import { Router } from 'express';
import { authUser } from '../middlewares/auth.middleware.js';
import {
    generateInterviewReportController,
    getAllReportsController,
    getReportByIdController,
    deleteReportController,
    startMockInterviewController,
    saveMockInterviewProgressController,
    evaluateMockInterviewController,
    getMockInterviewSessionController,
    getAllMockSessionsController
} from '../controllers/interview.controller.js';
import { upload } from '../middlewares/file.middleware.js';

const interviewRouter = Router();

// Protect all interview routes
interviewRouter.use(authUser);

// Report Generation & Management
interviewRouter.post('/', upload.single("resume"), generateInterviewReportController);
interviewRouter.get('/reports', getAllReportsController);
interviewRouter.get('/report/:id', getReportByIdController);
interviewRouter.delete('/report/:id', deleteReportController);

// AI Mock Interview Lifecyle
interviewRouter.post('/mock/start', startMockInterviewController);
interviewRouter.get('/mock/sessions', getAllMockSessionsController);
interviewRouter.get('/mock/session/:sessionId', getMockInterviewSessionController);
interviewRouter.post('/mock/:sessionId/save', saveMockInterviewProgressController);
interviewRouter.post('/mock/:sessionId/evaluate', evaluateMockInterviewController);

export default interviewRouter;