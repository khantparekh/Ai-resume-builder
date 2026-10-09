import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true
});

/**
 * Generate Report and ATS analysis
 */
export const generateReport = async ({ file, resumeText, selfDescription, jobDescription }) => {
    if (file) {
        const formData = new FormData();
        formData.append("resume", file);
        if (selfDescription) formData.append("selfDescription", selfDescription);
        if (jobDescription) formData.append("jobDescription", jobDescription);

        const response = await api.post('/interview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } else {
        const response = await api.post('/interview', {
            resumeText,
            selfDescription,
            jobDescription
        });
        return response.data;
    }
};

/**
 * Fetch all past reports for the user
 */
export const getReports = async () => {
    const response = await api.get('/interview/reports');
    return response.data;
};

/**
 * Fetch single report by ID
 */
export const getReportById = async (id) => {
    const response = await api.get(`/interview/report/${id}`);
    return response.data;
};

/**
 * Delete a report
 */
export const deleteReport = async (id) => {
    const response = await api.delete(`/interview/report/${id}`);
    return response.data;
};

/**
 * Start an AI Mock Interview session
 */
export const startMockInterview = async ({ reportId, jobDescription, resume, selfDescription, roleTitle }) => {
    const response = await api.post('/interview/mock/start', {
        reportId,
        jobDescription,
        resume,
        selfDescription,
        roleTitle
    });
    return response.data;
};

/**
 * Get all mock interview sessions
 */
export const getMockSessions = async () => {
    const response = await api.get('/interview/mock/sessions');
    return response.data;
};

/**
 * Get mock interview session details
 */
export const getMockSession = async (sessionId) => {
    const response = await api.get(`/interview/mock/session/${sessionId}`);
    return response.data;
};

/**
 * Autosave answers during mock interview
 */
export const saveMockProgress = async (sessionId, answers) => {
    const response = await api.post(`/interview/mock/${sessionId}/save`, { answers });
    return response.data;
};

/**
 * Finish & evaluate mock interview
 */
export const evaluateMockInterview = async (sessionId, answers) => {
    const response = await api.post(`/interview/mock/${sessionId}/evaluate`, { answers });
    return response.data;
};
