import {Router} from 'express'
import { authUser } from '../middlewares/auth.middleware.js';
import { generateInterviewReportController } from '../controllers/interview.controller.js';
import {upload} from '../middlewares/file.middleware.js';


const interviewRouter = Router();

/**
 * @route POST api/v1/interview/
 * @description generate interview report based on self description, job description and resume pdf
 * @access private
 */
interviewRouter.post('/', authUser, upload.single("resume"), generateInterviewReportController);

export default interviewRouter;