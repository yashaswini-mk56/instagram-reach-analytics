import React, { useState } from 'react';
import Predictor from './components/Predictor';
import History from './components/History';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [page, setPage] = useState('predictor');
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const addToHistory = (entry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const handleLogin = (username) => {
    setUser(username);
    setPage('predictor');
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setPage('predictor');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h2 style={{ textShadow: '0px 2px 8px rgba(0,0,0,0.2)' }}>📊 InstaAnalytics</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {['predictor', 'history', 'dashboard'].map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? 'white' : 'transparent',
              color: page === p ? '#8134af' : 'white',
              border: '2px solid white',
              padding: '8px 18px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}>
              {p === 'predictor' ? '🚀 Predictor' : p === 'history' ? '📜 History' : '📊 Dashboard'}
            </button>
          ))}
          <span style={{ marginLeft: '10px', opacity: 0.9 }}>👤 {user}</span>
          <button onClick={handleLogout} style={{
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            padding: '8px 18px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>🚪 Logout</button>
        </div>
      </nav>

      {page === 'predictor' && <Predictor addToHistory={addToHistory} />}
      {page === 'history' && <History history={history} />}
      {page === 'dashboard' && <Dashboard history={history} />}
    </div>
  );
}

export default App;