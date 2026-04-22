import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('Please verify your email first! Check your inbox.');
          await auth.signOut();
        } else {
          onLogin(userCredential.user.email);
        }
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('Account not found! Please sign up.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password!');
      else if (err.code === 'auth/invalid-credential') setError('Wrong email or password!');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered! Please login.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters!');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address!');
      else setError(err.message);
    }
    setLoading(false);
  };

  if (verificationSent) {
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
          <div style={{ fontSize: '60px' }}>📧</div>
          <h2 style={{ color: '#8134af', margin: '15px 0 10px' }}>Verify Your Email!</h2>
          <p style={{ color: '#555', marginBottom: '10px' }}>
            We sent a verification link to:
          </p>
          <p style={{ color: '#8134af', fontWeight: 'bold', marginBottom: '20px' }}>{email}</p>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '25px' }}>
            Click the link in the email, then come back and login!
          </p>
          <button
            onClick={() => { setVerificationSent(false); setIsSignup(false); }}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(45deg, #dd2a7b, #8134af)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔑 Go to Login
          </button>
        </div>
      </div>
    );
  }

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
          {isSignup ? 'Create your account' : 'Login to your account'}
        </p>

        <input
          type="email"
          placeholder="📧 Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          placeholder="🔒 Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
          onClick={handleSubmit}
          disabled={loading}
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
            marginTop: '10px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '⏳ Please wait...' : isSignup ? '🚀 Create Account' : '🔑 Login'}
        </button>

        <p style={{ color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#8134af', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;