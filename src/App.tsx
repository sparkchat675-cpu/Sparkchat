/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AgeVerification from './components/AgeVerification';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ActiveUsersPage = lazy(() => import('./pages/ActiveUsersPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const DMChatPage = lazy(() => import('./pages/DMChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Loading component
const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-pink-light">
    <div className="animate-bounce">
      <div className="w-16 h-16 bg-pink-primary rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white text-2xl font-bold">P</span>
      </div>
    </div>
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') setAgeVerified(true);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (!ageVerified) {
    return <AgeVerification onVerify={() => {
        setAgeVerified(true);
        localStorage.setItem('age_verified', 'true');
      }} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/chat" /> : <LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        <Route element={<Layout />}>
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/" />} />
          <Route path="/active" element={user ? <ActiveUsersPage /> : <Navigate to="/" />} />
          <Route path="/friends" element={user ? <FriendsPage /> : <Navigate to="/" />} />
          <Route path="/dm/:friendId" element={user ? <DMChatPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Suspense>
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
