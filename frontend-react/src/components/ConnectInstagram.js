import React, { useState } from 'react';

function ConnectInstagram({ onConnect }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleConnect = () => {
    if (!username) {
      setError('Please enter your Instagram username!');
      return;
    }
    if (username.includes(' ')) {
      setError('Username cannot have spaces!');
      return;
    }
    onConnect(username);
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
        width: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>📸</div>
        <h2 style={{ color: '#8134af', marginBottom: '5px' }}>Connect Instagram</h2>
        <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>
          Enter your Instagram username to personalize your analytics
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid #ddd',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '15px'
        }}>
          <span style={{
            padding: '14px',
            background: '#f5f5f5',
            color: '#888',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>@</span>
          <input
            type="text"
            placeholder="your_instagram_username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>
        )}

        <button
          onClick={handleConnect}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(45deg, #f58529, #dd2a7b, #8134af)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          📸 Connect Instagram
        </button>

        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '15px' }}>
          We only use your username to personalize your experience
        </p>
      </div>
    </div>
  );
}

export default ConnectInstagram;