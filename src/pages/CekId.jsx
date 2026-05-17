import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function CekId() {
  const [game, setGame] = useState('Mobile Legends');
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setResult(null);

    // Simulasi delay pengecekan API
    setTimeout(() => {
      setLoading(false);
      // Fake logic:
      if (userId.length < 5) {
        setResult({ error: true, message: 'ID tidak valid atau tidak ditemukan.' });
      } else {
        setResult({ 
          error: false, 
          message: 'Valid!', 
          details: { 
            game: game, 
            ign: 'Player_' + userId.slice(0, 4).toUpperCase(), 
            id: userId 
          }
        });
      }
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', paddingBottom: '40px' }}>
      {/* Jika ada navbar global, biarkan App.jsx yang handle, namun kita bisa pakai manual link */}
      <div className="Dashboard-container" style={{ padding: '40px 20px', minHeight: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          
          <Link 
            to="/dashboard" 
            style={{
              marginBottom: '20px', background: 'rgba(255, 255, 255, 0.1)', padding: '10px 20px', 
              borderRadius: '10px', color: 'white', textDecoration: 'none', display: 'inline-block',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            ← Kembali ke Dashboard
          </Link>

          <div style={{ background: '#1e293b', borderRadius: '15px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #334155', marginTop: '20px' }}>
            <h1 style={{ color: 'white', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: '#3b82f6', fontSize: '32px' }}>person_search</span>
              Cek ID Game
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Validasi In-Game Name (IGN) Anda berdasarkan User ID dan Zone ID sebelum melakukan top-up.</p>
            
            <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: 'white', fontWeight: 600 }}>Pilih Game</label>
                <select 
                  value={game} 
                  onChange={(e) => setGame(e.target.value)}
                  style={{ padding: '15px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #475569', outline: 'none' }}
                >
                  <option value="Mobile Legends">Mobile Legends</option>
                  <option value="Free Fire">Free Fire</option>
                  <option value="PUBG Mobile">PUBG Mobile</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Genshin Impact">Genshin Impact</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2 }}>
                  <label style={{ color: 'white', fontWeight: 600 }}>User ID</label>
                  <input 
                    type="number" 
                    placeholder="Contoh: 12345678" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    style={{ padding: '15px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #475569', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ color: 'white', fontWeight: 600 }}>Zone ID</label>
                  <input 
                    type="number" 
                    placeholder="(1234)" 
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    style={{ padding: '15px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #475569', outline: 'none' }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !userId}
                style={{ 
                  padding: '16px', borderRadius: '10px', border: 'none', 
                  background: loading || !userId ? '#475569' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                  color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: loading || !userId ? 'not-allowed' : 'pointer',
                  marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}
              >
                {loading ? 'Mengecek...' : 'Cek Profil Sekarang'}
                {!loading && <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>}
              </button>
            </form>

            {/* Hasil Pengecekan */}
            {result && (
              <div style={{ 
                marginTop: '30px', padding: '20px', borderRadius: '10px', 
                background: result.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${result.error ? '#ef4444' : '#10b981'}`
              }}>
                {result.error ? (
                  <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="material-symbols-outlined">error</span>
                    {result.message}
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: '#10b981', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined">check_circle</span>
                      Akun Ditemukan!
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>Game:</span>
                      <strong style={{ color: 'white' }}>{result.details.game}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#94a3b8' }}>UserID:</span>
                      <strong style={{ color: 'white' }}>{result.details.id}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Nickname (IGN):</span>
                      <strong style={{ color: '#3b82f6' }}>{result.details.ign}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default CekId;
