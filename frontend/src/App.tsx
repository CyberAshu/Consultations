import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/homepage/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { ConsultantsPage } from './components/pages/ConsultantsPage';
import { FAQPage } from './components/pages/FAQPage';
import { BecomeConsultantPage } from './components/pages/BecomeConsultantPage';
import { BlogPage } from './components/pages/BlogPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsOfUsePage } from './components/pages/TermsOfUsePage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { ForgotPassword } from './components/pages/ForgotPassword';
import { ResetPassword } from './components/pages/ResetPassword';
import { EmailConfirm } from './components/pages/EmailConfirm';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { ClientDashboard } from './components/pages/ClientDashboard';
import { RCICDashboard } from './components/pages/RCICDashboard';
import { BookingFlow } from './components/pages/BookingFlow';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GlobalDisclaimerModal, useGlobalDisclaimerModal } from './components/shared/GlobalDisclaimerModal';

function App() {
  const { isOpen: showGlobalDisclaimer, handleClose: handleCloseGlobalDisclaimer } = useGlobalDisclaimerModal();

  return (
    <Router>
      <div className="min-h-screen">
        {/* Global Disclaimer Modal */}
        <GlobalDisclaimerModal 
          isOpen={showGlobalDisclaimer} 
          onClose={handleCloseGlobalDisclaimer} 
        />
        <Routes>
          {/* Public routes with header/footer */}
          <Route path="/" element={
            <div>
              <Header />
              <main><HomePage /></main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div>
              <Header />
              <main><AboutPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/services" element={
            <div>
              <Header />
              <main><ServicesPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/consultants" element={
            <div>
              <Header />
              <main><ConsultantsPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/faq" element={
            <div>
              <Header />
              <main><FAQPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/become-partner" element={
            <div>
              <Header />
              <main><BecomeConsultantPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/blog" element={
            <div>
              <Header />
              <main><BlogPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/privacy-policy" element={
            <div>
              <Header />
              <main><PrivacyPolicyPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/terms-of-use" element={
            <div>
              <Header />
              <main><TermsOfUsePage /></main>
              <Footer />
            </div>
          } />
          
          {/* Auth routes without header/footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/confirm" element={<EmailConfirm />} />
          {/* Handle recovery URLs that might come with different paths */}
          <Route path="/auth/callback" element={<ResetPassword />} />
          
          {/* Dashboard routes without header/footer */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client-dashboard" element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/rcic-dashboard" element={
            <ProtectedRoute allowedRoles={['rcic']}>
              <RCICDashboard />
            </ProtectedRoute>
          } />
          
          {/* Booking flow without header/footer */}
          <Route path="/book" element={
            <ProtectedRoute>
              <BookingFlow />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
