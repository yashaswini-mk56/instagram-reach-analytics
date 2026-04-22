import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Predictor({ addToHistory, instagramUsername }) {
  const [form, setForm] = useState({
    follower_count: '',
    hashtags_count: '',
    likes: '',
    comments: '',
    shares: '',
    saves: '',
    caption_length: '',
    content_type: 'Post'
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
        engagement_rate: response.data.engagement_rate,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      setError('Backend not running! Please start Flask.');
    }
    setLoading(false);
  };

  const chartData = result ? [
    { name: 'Followers', value: parseInt(form.follower_count) || 0 },
    { name: 'Likes', value: parseInt(form.likes) || 0 },
    { name: 'Comments', value: parseInt(form.comments) || 0 },
    { name: 'Shares', value: parseInt(form.shares) || 0 },
    { name: 'Saves', value: parseInt(form.saves) || 0 },
  ] : [];

  const contentTypes = ['Post', 'Reel', 'Story', 'Carousel'];

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '5px', color: 'white', textShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}>
        🚀 Predict Your Instagram Reach
      </h2>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', marginBottom: '5px', fontWeight: '500' }}>
        @{instagramUsername} — Enter your post details for AI-powered prediction
      </p>

      {/* Content Type Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {contentTypes.map(type => (
          <button
            key={type}
            onClick={() => setForm({ ...form, content_type: type })}
            style={{
              padding: '10px 22px',
              borderRadius: '20px',
              border: '2px solid white',
              background: form.content_type === type ? 'white' : 'transparent',
              color: form.content_type === type ? '#8134af' : 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {type === 'Post' ? '🖼️' : type === 'Reel' ? '🎬' : type === 'Story' ? '⭕' : '🔄'} {type}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {[
            { name: 'follower_count', placeholder: '👥 Number of Followers' },
            { name: 'hashtags_count', placeholder: '#️⃣ Number of Hashtags' },
            { name: 'likes', placeholder: '❤️ Avg Likes per Post' },
            { name: 'comments', placeholder: '💬 Avg Comments per Post' },
            { name: 'shares', placeholder: '↗️ Avg Shares per Post' },
            { name: 'saves', placeholder: '🔖 Avg Saves per Post' },
            { name: 'caption_length', placeholder: '📝 Caption Length (characters)' },
          ].map((input) => (
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
                border: '1.5px solid #ddd',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
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
              background: 'linear-gradient(45deg, #f58529, #dd2a7b, #8134af)',
              color: 'white',
              border: 'none',
              padding: '14px 50px',
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
          background: 'linear-gradient(45deg, #f58529, #dd2a7b, #8134af)',
          borderRadius: '16px',
          padding: '30px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '25px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>📊 Prediction Results for {form.content_type}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '13px', opacity: 0.85 }}>Predicted Reach</p>
              <p style={{ fontSize: '38px', fontWeight: 'bold' }}>
                {result.predicted_reach.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', opacity: 0.85 }}>Best Time to Post</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold' }}>⏰ {result.best_time}</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', opacity: 0.85 }}>Engagement Rate</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold' }}>📈 {result.engagement_rate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {result && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
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