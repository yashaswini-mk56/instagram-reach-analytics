import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Predictor({ addToHistory }) {
  const [form, setForm] = useState({
    follower_count: '',
    hashtags_count: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    caption_length: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    if (!form.follower_count || !form.hashtags_count) {
      setError('Please enter at least Followers and Hashtags!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', form);
      setResult(response.data);
      addToHistory({
        ...form,
        predicted_reach: response.data.predicted_reach,
        best_time: response.data.best_time,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      setError('Backend not running! Please start Flask.');
    }
    setLoading(false);
  };

  const chartData = result ? [
    { name: 'Followers', value: parseInt(form.follower_count) },
    { name: 'Likes', value: parseInt(form.likes) || 0 },
    { name: 'Comments', value: parseInt(form.comments) || 0 },
    { name: 'Shares', value: parseInt(form.shares) || 0 },
    { name: 'Saves', value: parseInt(form.saves) || 0 },
  ] : [];

  const inputs = [
    { name: 'follower_count', placeholder: '👥 Number of Followers', required: true },
    { name: 'hashtags_count', placeholder: '#️⃣ Number of Hashtags', required: true },
    { name: 'likes', placeholder: '❤️ Avg Likes per Post' },
    { name: 'comments', placeholder: '💬 Avg Comments per Post' },
    { name: 'shares', placeholder: '↗️ Avg Shares per Post' },
    { name: 'saves', placeholder: '🔖 Avg Saves per Post' },
    { name: 'caption_length', placeholder: '📝 Caption Length (characters)' },
  ];

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'white', textShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}>
  🚀 Predict Your Instagram Reach
    </h2>
    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', marginBottom: '30px', fontWeight: '500' }}>
      Enter your post details below to get an AI-powered reach prediction
    </p>

      {/* Input Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {inputs.map((input) => (
            <input
              key={input.name}
              type="number"
              name={input.name}
              placeholder={input.placeholder}
              value={form[input.name]}
              onChange={handleChange}
              style={{
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                outline: 'none',
                width: '100%'
              }}
            />
          ))}
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              background: 'linear-gradient(45deg, #dd2a7b, #8134af)',
              color: 'white',
              border: 'none',
              padding: '14px 40px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '⏳ Predicting...' : '🔮 Predict Reach'}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div style={{
          background: 'linear-gradient(45deg, #dd2a7b, #8134af)',
          borderRadius: '16px',
          padding: '30px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📊 Prediction Results</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>Predicted Reach</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {result.predicted_reach.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>Best Time to Post</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>⏰ {result.best_time}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {result && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#8134af' }}>📈 Your Engagement Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8134af" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Predictor;