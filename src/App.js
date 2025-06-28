import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ParcAuto from './pages/ParcAuto';
import Consommations from './pages/Consommations';
import Interventions from './pages/Interventions';
import OrdresMissions from './pages/OrdresMissions';
import Rapports from './pages/Rapports';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Header />
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parc-auto" element={<ParcAuto />} />
            <Route path="/consommations" element={<Consommations />} />
            <Route path="/interventions" element={<Interventions />} />
            <Route path="/ordres-missions" element={<OrdresMissions />} />
            <Route path="/rapports" element={<Rapports />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
