import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ActivateAccountPage } from './pages/ActivateAccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { VideoUploadPage } from './pages/VideoUploadPage';
import { VideoResultsPage } from './pages/VideoResultsPage';
import { AssessmentsListPage } from './pages/AssessmentsListPage';
import { ReportPage } from './pages/ReportPage';
import { AthleteProfilePage } from './pages/AthleteProfilePage';
import { AnalysesHistoryPage } from './pages/AnalysesHistoryPage';
import { ProfileModal } from './components/ProfileModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeRouteWrapper = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <HomePage />;
};

const ProfileRouteWrapper = () => {
  const [open, setOpen] = useState(true);
  return (
    <ProtectedRoute>
      <DashboardPage />
      <ProfileModal isOpen={open} onClose={() => setOpen(false)} />
    </ProtectedRoute>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/activate" element={<ActivateAccountPage />} />
                
                <Route path="/" element={<HomeRouteWrapper />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/athlete/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <AthleteProfilePage />
                  </ProtectedRoute>
                } />

                <Route path="/athlete/profile" element={
                  <ProtectedRoute>
                    <AthleteProfilePage />
                  </ProtectedRoute>
                } />

                <Route path="/athlete/analyses" element={
                  <ProtectedRoute>
                    <AnalysesHistoryPage />
                  </ProtectedRoute>
                } />

                <Route path="/upload" element={
                  <ProtectedRoute>
                    <VideoUploadPage />
                  </ProtectedRoute>
                } />

                <Route path="/videos" element={
                  <ProtectedRoute>
                    <AssessmentsListPage />
                  </ProtectedRoute>
                } />

                <Route path="/results/:videoId" element={
                  <ProtectedRoute>
                    <VideoResultsPage />
                  </ProtectedRoute>
                } />

                <Route path="/reports" element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } />

                <Route path="/reports/:videoId" element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
