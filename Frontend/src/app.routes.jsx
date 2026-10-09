import { createBrowserRouter, Navigate } from 'react-router';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Protected from './features/auth/components/Protected';

import Dashboard from './features/interview/pages/Dashboard';
import AnalysisSetup from './features/interview/pages/AnalysisSetup';
import AnalysisReport from './features/interview/pages/AnalysisReport';
import AtsResumeStudio from './features/interview/pages/AtsResumeStudio';
import MockInterviewRoom from './features/interview/pages/MockInterviewRoom';
import LandingPage from './features/interview/pages/LandingPage';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Dashboard /></Protected>
    },
    {
        path: "/setup",
        element: <Protected><AnalysisSetup /></Protected>
    },
    {
        path: "/report/:id",
        element: <Protected><AnalysisReport /></Protected>
    },
    {
        path: "/ats-studio",
        element: <Protected><AtsResumeStudio /></Protected>
    },
    {
        path: "/mock-interview",
        element: <Protected><MockInterviewRoom /></Protected>
    },
    {
        path: "/mock-interview/:sessionId",
        element: <Protected><MockInterviewRoom /></Protected>
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);