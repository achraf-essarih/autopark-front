import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ParcAuto from './pages/ParcAuto';
import Consommations from './pages/Consommations';
import Interventions from './pages/Interventions';
import OrdresMissions from './pages/OrdresMissions';
import Rapports from './pages/Rapports';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route de connexion publique */}
          <Route 
            path="/login" 
            element={
              authService.isAuthenticated() ? (
                authService.isAdmin() ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Login />
              )
            } 
          />
          
          {/* Routes admin protégées */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes principales protégées */}
          <Route path="/*" element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
