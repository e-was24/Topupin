import React, { useState, useEffect } from 'react';

const ErrorRobot = ({ message, onRetry }) => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      onRetry();
    }
  }, [countdown, onRetry]);

  return (
    <div className="Dashboard-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px', minHeight: '100dvh' }}>
      <div style={{ position: 'relative', display: 'inline-block', animation: 'float 4s ease-in-out infinite' }}>
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
          `}
        </style>
        <img 
          src="/sad_robot_error.png" 
          alt="Error Robot" 
          style={{ width: '320px', borderRadius: '24px', filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.4)) border(1px solid white)' }} 
        />
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ef4444',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '2.5rem',
          fontWeight: '900',
          textShadow: '0 0 15px rgba(239, 68, 68, 0.9)',
          background: 'rgba(0,0,0,0.5)',
          padding: '5px 15px',
          borderRadius: '10px'
        }}>
          00:{countdown < 10 ? `0${countdown}` : countdown}
        </div>
      </div>
      <div>
        <h2 style={{ color: 'white', marginBottom: '12px', fontSize: '2rem' }}>Waduh, Robot Kewalahan! 🤖💥</h2>
        <p style={{ color: '#94a3b8', maxWidth: '550px', margin: '0 auto', lineHeight: '1.7', fontSize: '1.1rem' }}>
          {message}
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px' }}>
          Jaringan akan otomatis menyegarkan kembali saat hitungan mundur selesai.
        </p>
      </div>
      <button 
        onClick={onRetry}
        style={{
          marginTop: '15px',
          padding: '14px 28px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.6)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.4)';
        }}
      >
        Coba Akses Sekarang
      </button>
    </div>
  );
};

export default ErrorRobot;
