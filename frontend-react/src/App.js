import React, { useState, useEffect } from 'react';
import Predictor from './components/Predictor';
import History from './components/History';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ConnectInstagram from './components/ConnectInstagram';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

function App() {
  const [page, setPage] = useState('predictor');
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [instagramUsername, setInstagramUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToHistory = (entry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setInstagramUsername('');
    setHistory([]);
    setPage('predictor');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        ⏳ Loading...
      </div>
    );
  }

  if (!user) return <Login onLogin={() => {}} />;
  if (!instagramUsername) return <ConnectInstagram onConnect={setInstagramUsername} />;

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['predictor', 'history', 'dashboard'].map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? 'white' : 'transparent',
              color: page === p ? '#8134af' : 'white',
              border: '2px solid white',
              padding: '8px 18px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              {p === 'predictor' ? '🚀 Predictor' : p === 'history' ? '📜 History' : '📊 Dashboard'}
            </button>
          ))}
          <span style={{ opacity: 0.9, fontSize: '13px' }}>📸 @{instagramUsername}</span>
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

      {page === 'predictor' && <Predictor addToHistory={addToHistory} instagramUsername={instagramUsername} />}
      {page === 'history' && <History history={history} />}
      {page === 'dashboard' && <Dashboard history={history} />}
    </div>
  );
}

export default App;