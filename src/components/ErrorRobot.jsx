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
        <svg 
          width="320" 
          height="320" 
          viewBox="0 0 200 200" 
          xmlns="http://www.w3.org/2000/svg" 
          style={{ filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.5))' }}
        >
          {/* Head Outline */}
          <rect x="50" y="30" width="100" height="70" rx="15" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
          
          {/* Antenna Base */}
          <line x1="100" y1="30" x2="100" y2="10" stroke="#3b82f6" strokeWidth="4" />
          
          {/* Blinking Antenna Red Bulb */}
          <circle cx="100" cy="10" r="6" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="r" values="6;8;6" dur="0.8s" repeatCount="indefinite" />
          </circle>

          {/* Eyes (Dead/Xs) */}
          <path d="M 65 50 L 75 60 M 75 50 L 65 60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M 125 50 L 135 60 M 135 50 L 125 60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

          {/* Small electric sparks */}
          <path d="M 70 70 L 70 80" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
          </path>

          {/* Broken mouth */}
          <path d="M 80 85 Q 100 75 120 85" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />

          {/* Neck connecting to Body */}
          <rect x="90" y="100" width="20" height="15" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />

          {/* Body */}
          <rect x="40" y="115" width="120" height="85" rx="20" fill="#0f172a" stroke="#3b82f6" strokeWidth="4" />
          
          {/* Shoulders / Broken arm bases */}
          <circle cx="40" cy="135" r="10" fill="#1e293b" stroke="#2563eb" strokeWidth="3"/>
          <circle cx="160" cy="135" r="10" fill="#1e293b" stroke="#2563eb" strokeWidth="3"/>
          
          {/* Loose swinging arm wires */}
          <path d="M 35 145 C 20 160 30 180 20 190" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2">
             <animate attributeName="d" values="M 35 145 C 20 160 30 180 20 190; M 35 145 C 10 165 40 175 25 185; M 35 145 C 20 160 30 180 20 190" dur="2s" repeatCount="indefinite"/>
          </path>
          
          {/* Digital Belly Screen for the Countdown */}
          <rect x="60" y="130" width="80" height="45" rx="5" fill="#000000" stroke="#1e293b" strokeWidth="3" />
          
          {/* Inject React State Text directly inside SVG screen */}
          <text 
            x="100" 
            y="158" 
            fill="#ef4444" 
            fontSize="18" 
            fontWeight="bold" 
            fontFamily="'Courier New', Courier, monospace"
            textAnchor="middle"
            style={{ textShadow: '0 0 10px rgba(239,68,68,0.9)' }}
          >
            00:{countdown < 10 ? `0${countdown}` : countdown}
          </text>
        </svg>
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
