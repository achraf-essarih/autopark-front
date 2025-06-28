import React from 'react';
import { ClipboardList } from 'lucide-react';

const OrdresMissions = () => {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Ordres des missions</h1>
      </div>
      <div className="table-container">
        <div className="empty-state">
          <ClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p>Aucun ordre de mission</p>
        </div>
      </div>
    </div>
  );
};

export default OrdresMissions; 