import React, { useState } from 'react';
import Predictor from './components/Predictor';
import History from './components/History';
import './App.css';

function App() {
  const [page, setPage] = useState('predictor');
  const [history, setHistory] = useState([]);

  const addToHistory = (entry) => {
    setHistory(prev => [entry, ...prev]);
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={{
        background: 'linear-gradient(45deg, #dd2a7b, #8134af)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <h2>📊 InstaAnalytics</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setPage('predictor')} style={{
            background: page === 'predictor' ? 'white' : 'transparent',
            color: page === 'predictor' ? '#8134af' : 'white',
            border: '2px solid white',
            padding: '8px 18px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>🚀 Predictor</button>
          <button onClick={() => setPage('history')} style={{
            background: page === 'history' ? 'white' : 'transparent',
            color: page === 'history' ? '#8134af' : 'white',
            border: '2px solid white',
            padding: '8px 18px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>📜 History</button>
        </div>
      </nav>

      {/* Pages */}
      {page === 'predictor' && <Predictor addToHistory={addToHistory} />}
      {page === 'history' && <History history={history} />}
    </div>
  );
}

export default App;