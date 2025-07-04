import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { ConsultantsPage } from './components/pages/ConsultantsPage';
import { FAQPage } from './components/pages/FAQPage';
import { WaitingListPage } from './components/pages/WaitingListPage';
import { LoginPage } from './components/pages/LoginPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { ClientDashboard } from './components/pages/ClientDashboard';
import { RCICDashboard } from './components/pages/RCICDashboard';
import { BookingFlow } from './components/pages/BookingFlow';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
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
          <Route path="/waiting-list" element={
            <div>
              <Header />
              <main><WaitingListPage /></main>
              <Footer />
            </div>
          } />
          
          {/* Login route without header/footer */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard routes without header/footer */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/rcic-dashboard" element={<RCICDashboard />} />
          
          {/* Booking flow without header/footer */}
          <Route path="/book" element={<BookingFlow />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
