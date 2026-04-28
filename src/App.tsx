/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import ChatPage from './pages/ChatPage';
import ActiveUsersPage from './pages/ActiveUsersPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AgeVerification from './components/AgeVerification';
import { useState, useEffect } from 'react';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') setAgeVerified(true);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-pink-light">
        <div className="animate-bounce">
          <div className="w-16 h-16 bg-pink-primary rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ageVerified) {
    return <AgeVerification onVerify={() => {
        setAgeVerified(true);
        localStorage.setItem('age_verified', 'true');
      }} />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/chat" /> : <LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      <Route element={<Layout />}>
        <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/" />} />
        <Route path="/active" element={user ? <ActiveUsersPage /> : <Navigate to="/" />} />
        <Route path="/friends" element={user ? <FriendsPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
