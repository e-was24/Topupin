import React from 'react';

const ProductCard = ({ title, sku, price, isSelected, onClick }) => {
  return (
    <div 
      className={`product-nominal-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : '#0f172a', /* Lebih gelap dr wrapper step2 */
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(6px, 1.5vw, 12px) clamp(5px, 1.5vw, 10px)',
        textAlign: 'center',
        minHeight: 'clamp(60px, 15vw, 80px)',
        width: '300px',
        borderRadius: '10px',
        boxShadow: isSelected ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none'
      }}
    >
      <h3 style={{ 
        margin: 0, 
        fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', 
        color: isSelected ? '#60a5fa' : '#f1f5f9',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.2'
      }}>
        {title}
      </h3>
      <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)', fontWeight: 600 }}>{sku}</p>
      <p style={{ margin: '6px 0 0', fontWeight: 'bold', color: isSelected ? '#34d399' : '#10b981', fontSize: 'clamp(0.7rem, 2vw, 0.95rem)' }}>
        Rp {price ? price.toLocaleString('id-ID') : '0'}
      </p>
    </div>
  );
};

export default ProductCard;
