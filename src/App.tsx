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

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
<Route path='/consultants' element={<ConsultantsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/waiting-list" element={<WaitingListPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
