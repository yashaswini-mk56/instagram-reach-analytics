import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8134af', '#dd2a7b', '#f58529', '#515bd4'];

function Dashboard({ history }) {
  if (history.length === 0) {
    return (
      <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '60px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '50px' }}>📊</p>
          <h3 style={{ color: '#8134af', marginTop: '10px' }}>No Data Yet!</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>
            Go to Predictor, make some predictions, then come back here to see your analytics dashboard!
          </p>
        </div>
      </div>
    );
  }

  const avgReach = Math.round(history.reduce((a, b) => a + b.predicted_reach, 0) / history.length);
  const maxReach = Math.round(Math.max(...history.map(h => h.predicted_reach)));
  const minReach = Math.round(Math.min(...history.map(h => h.predicted_reach)));
  const avgFollowers = Math.round(history.reduce((a, b) => a + parseInt(b.follower_count), 0) / history.length);

  const lineData = history.slice().reverse().map((h, i) => ({
    name: `#${i + 1}`,
    reach: Math.round(h.predicted_reach)
  }));

  const bestTimeCount = {};
  history.forEach(h => {
    bestTimeCount[h.best_time] = (bestTimeCount[h.best_time] || 0) + 1;
  });
  const pieData = Object.entries(bestTimeCount).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '10px', textShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}>
        📊 Your Analytics Dashboard
      </h2>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', marginBottom: '30px', fontWeight: '500' }}>
        Summary of all your predictions
      </p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: '📈 Avg Reach', value: avgReach.toLocaleString() },
          { label: '🏆 Max Reach', value: maxReach.toLocaleString() },
          { label: '📉 Min Reach', value: minReach.toLocaleString() },
          { label: '👥 Avg Followers', value: avgFollowers.toLocaleString() },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#888', fontSize: '13px' }}>{stat.label}</p>
            <p style={{ color: '#8134af', fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#8134af', marginBottom: '20px' }}>📈 Reach Over Predictions</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="reach" stroke="#8134af" strokeWidth={3} dot={{ fill: '#dd2a7b', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#8134af', marginBottom: '20px' }}>⏰ Best Posting Times Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;