import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer, ProtectedRoute } from './layouts';
import { 
  HomePage, 
  AboutPage, 
  ServicesPage, 
  ConsultantsPage, 
  FAQPage, 
  BecomeConsultantPage, 
  BlogPage 
} from './features/public-pages';
import { PrivacyPolicyPage } from './features/public-pages/legal/PrivacyPolicyPage';
import { TermsOfUsePage } from './features/public-pages/legal/TermsOfUsePage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ForgotPassword } from './features/auth/pages/ForgotPasswordPage';
import { ResetPassword } from './features/auth/pages/ResetPasswordPage';
import { EmailConfirm } from './features/auth/pages/EmailConfirmPage';
import { AdminDashboard } from './features/dashboard/admin/pages/AdminDashboardPage';
import { ClientDashboard } from './features/dashboard/client/pages/ClientDashboardPage';
import { RCICDashboard } from './features/dashboard/rcic/pages/RCICDashboardPage';
import { BookingFlow } from './features/booking/pages/BookingFlowPage';
import { IntakeFlow } from './features/intake/pages/IntakeFlowPage';
import { GlobalDisclaimerModal, useGlobalDisclaimerModal } from './components/common/GlobalDisclaimerModal';
import { ScrollToTop } from './components/common/ScrollToTop';

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
          
          {/* Intake flow without header/footer (clients only) */}
          <Route path="/intake" element={
            <ProtectedRoute allowedRoles={['client']}>
              <IntakeFlow />
            </ProtectedRoute>
          } />
        </Routes>
        {/* Global ScrollToTop button */}
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
