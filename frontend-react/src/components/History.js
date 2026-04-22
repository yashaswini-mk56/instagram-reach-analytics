import React from 'react';

function History({ history }) {
  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'white', textShadow: '0px 2px 8px rgba(0,0,0,0.3)' }}>
      📜 Prediction History
    </h2>
    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', marginBottom: '30px', fontWeight: '500' }}>
      All your previous predictions in one place
    </p>

      {history.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '50px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '40px' }}>📭</p>
          <p style={{ color: '#888', marginTop: '10px' }}>
            No predictions yet! Go to Predictor and make your first prediction.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.map((entry, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px 25px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderLeft: '5px solid #8134af'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <p style={{ color: '#888', fontSize: '13px' }}>🕐 {entry.date}</p>
                  <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#8134af', marginTop: '5px' }}>
                    🚀 {entry.predicted_reach.toLocaleString()} Reach
                  </p>
                  <p style={{ color: '#555', marginTop: '4px' }}>⏰ Best Time: {entry.best_time}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: '👥 Followers', value: entry.follower_count },
                    { label: '#️⃣ Hashtags', value: entry.hashtags_count },
                    { label: '❤️ Likes', value: entry.likes || 0 },
                    { label: '💬 Comments', value: entry.comments || 0 },
                  ].map((item, i) => (
                    <div key={i} style={{
                      background: '#f8f0ff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#888' }}>{item.label}</p>
                      <p style={{ fontWeight: 'bold', color: '#8134af' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;