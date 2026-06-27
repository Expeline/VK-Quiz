import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import OrganizerQuizzes from "../pages/Dashboard/pages/OrganizerQuizzes/OrganizerQuizzes";
import CreateQuiz from "../pages/Dashboard/pages/CreateQuiz/CreateQuiz";
import OrganizerHistory from "../pages/Dashboard/pages/OrganizerHistory/OrganizerHistory";
import JoinQuiz from "../pages/Dashboard/pages/JoinQuiz/JoinQuiz";
import ParticipantHistory from "../pages/Dashboard/pages/ParticipantHistory/ParticipantHistory";
import Profile from "../pages/Dashboard/pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <MainLayout>
                            <Login />
                        </MainLayout>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <MainLayout>
                            <Register />
                        </MainLayout>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<OrganizerQuizzes />} />
                    <Route path="organizer/quizzes" element={<OrganizerQuizzes />} />
                    <Route path="organizer/create" element={<CreateQuiz />} />
                    <Route path="organizer/history" element={<OrganizerHistory />} />
                    <Route path="participant/join" element={<JoinQuiz />} />
                    <Route path="participant/history" element={<ParticipantHistory />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
