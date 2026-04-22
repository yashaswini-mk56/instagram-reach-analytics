import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter username and password!');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters!');
      return;
    }
    onLogin(username);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>📊</div>
        <h2 style={{ color: '#8134af', marginBottom: '5px' }}>InstaAnalytics</h2>
        <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>
          AI-Powered Instagram Reach Predictor
        </p>

        <input
          type="text"
          placeholder="👤 Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1.5px solid #ddd',
            fontSize: '15px',
            marginBottom: '15px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: '1.5px solid #ddd',
            fontSize: '15px',
            marginBottom: '10px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {error && (
          <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(45deg, #dd2a7b, #8134af)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🚀 Login
        </button>

        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '20px' }}>
          Any username & password works for demo 😊
        </p>
      </div>
    </div>
  );
}

export default Login;