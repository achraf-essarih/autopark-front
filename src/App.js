import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ModernNavigation from './components/ModernNavigation';
import Dashboard from './pages/Dashboard';
import ParcAuto from './pages/ParcAuto';
import Consommations from './pages/Consommations';
import Interventions from './pages/Interventions';
import OrdresMissions from './pages/OrdresMissions';
import ListeChauffeurs from './pages/ListeChauffeurs';
import AjouterChauffeur from './pages/AjouterChauffeur';
import Rapports from './pages/Rapports';
import Login from './pages/Login';
import authService from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';
import './styles/glassmorphism.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Route de connexion publique */}
            <Route 
              path="/login" 
              element={
                authService.isAuthenticated() ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login />
                )
              } 
            />
            
            {/* Routes principales protégées */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <ModernNavigation />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/parc-auto" element={<ParcAuto />} />
                    <Route path="/consommations" element={<Consommations />} />
                    <Route path="/interventions" element={<Interventions />} />
                    <Route path="/ordres-missions" element={<OrdresMissions />} />
                    <Route path="/liste-chauffeurs" element={<ListeChauffeurs />} />
                    <Route path="/ajouter-chauffeur" element={<AjouterChauffeur />} />
                    <Route path="/rapports" element={<Rapports />} />
                  </Routes>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
