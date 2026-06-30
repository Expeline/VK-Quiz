import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import RoleRoute from "../components/RoleRoute/RoleRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import OrganizerQuizzes from "../pages/Dashboard/pages/OrganizerQuizzes/OrganizerQuizzes";
import CreateQuiz from "../pages/Dashboard/pages/CreateQuiz/CreateQuiz";
import EditQuiz from "../pages/Dashboard/pages/EditQuiz/EditQuiz";
import OrganizerHistory from "../pages/Dashboard/pages/OrganizerHistory/OrganizerHistory";
import JoinQuiz from "../pages/Dashboard/pages/JoinQuiz/JoinQuiz";
import ParticipantHistory from "../pages/Dashboard/pages/ParticipantHistory/ParticipantHistory";
import LiveRoom from "../pages/Dashboard/pages/LiveRoom/LiveRoom";
import Profile from "../pages/Dashboard/pages/Profile/Profile";
import NotFound from "../pages/NotFound/NotFound";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

function DashboardIndex() {
    const { user } = useAuth();

    return (
        <Navigate
            to={user?.role === ROLES.ORGANIZER ? "/dashboard/organizer/quizzes" : "/dashboard/participant/join"}
            replace
        />
    );
}

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
                    <Route index element={<DashboardIndex />} />
                    <Route
                        path="organizer/quizzes"
                        element={<RoleRoute allowedRoles={[ROLES.ORGANIZER]}><OrganizerQuizzes /></RoleRoute>}
                    />
                    <Route
                        path="organizer/create"
                        element={<RoleRoute allowedRoles={[ROLES.ORGANIZER]}><CreateQuiz /></RoleRoute>}
                    />
                    <Route
                        path="organizer/quizzes/:id/edit"
                        element={<RoleRoute allowedRoles={[ROLES.ORGANIZER]}><EditQuiz /></RoleRoute>}
                    />
                    <Route
                        path="organizer/history"
                        element={<RoleRoute allowedRoles={[ROLES.ORGANIZER]}><OrganizerHistory /></RoleRoute>}
                    />
                    <Route
                        path="participant/join"
                        element={<RoleRoute allowedRoles={[ROLES.PARTICIPANT]}><JoinQuiz /></RoleRoute>}
                    />
                    <Route
                        path="participant/history"
                        element={<RoleRoute allowedRoles={[ROLES.PARTICIPANT]}><ParticipantHistory /></RoleRoute>}
                    />
                    <Route path="rooms/:id" element={<LiveRoom />} />
                </Route>

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Profile />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
