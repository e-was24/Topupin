import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../api/productApi';
import ErrorRobot from '../components/ErrorRobot';
import { Link } from 'react-router-dom';

function HargaList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchWord, setSearchWord] = useState('');
  
  // Sort States
  const [sortConfig, setSortConfig] = useState({ key: 'brand', direction: 'ascending' });

  useEffect(() => {
    const cachedData = localStorage.getItem("lastPricelist");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          setLoading(false);
        }
      } catch (e) {}
    }

    const getAllProducts = async () => {
      try {
        if (!localStorage.getItem("lastPricelist")) setLoading(true);
        const fetched = await fetchProducts();
        setData(Array.isArray(fetched) ? fetched : []);
        setError(null);
      } catch (err) {
        if (!localStorage.getItem("lastPricelist")) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getAllProducts();
  }, []);

  // Sorting Function
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let sortableItems = [...data];
    
    // 1. Filter by Search
    if (searchWord) {
      sortableItems = sortableItems.filter((item) => 
        item.product_name?.toLowerCase().includes(searchWord.toLowerCase()) || 
        item.brand?.toLowerCase().includes(searchWord.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchWord.toLowerCase())
      );
    }

    // 2. Sort Logic
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig, searchWord]);

  if (loading) return <div className="Dashboard-container"><h2 style={{ color: "white" }}>Memuat database produk...</h2></div>;
  if (error) return <ErrorRobot message={error} onRetry={() => window.location.reload()} />;

  const getSortIcon = (colKey) => {
    if (sortConfig.key !== colKey) return '↕';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ color: 'white', margin: '0 0 10px', fontSize: '2.5rem' }}>Daftar Harga Produk</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>Cek kelengkapan seluruh katalog digital secara transparan.</p>
          </div>
          
          <input 
            type="text" 
            placeholder="Cari nama, brand, tipe..." 
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            style={{ 
              padding: '15px 20px', borderRadius: '30px', border: '1px solid #3b82f6', 
              background: '#1e293b', color: 'white', outline: 'none', minWidth: '300px'
            }}
          />
        </div>

        {/* Tabel */}
        <div style={{ background: '#1e293b', borderRadius: '15px', border: '1px solid #334155', overflowX: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'white', minWidth: '800px' }}>
            <thead style={{ background: '#0f172a' }}>
              <tr>
                <th onClick={() => handleSort('product_name')} style={{ padding: '20px', cursor: 'pointer', borderBottom: '2px solid #334155' }}>
                  Nama Produk <span style={{ color: '#64748b', marginLeft: '5px' }}>{getSortIcon('product_name')}</span>
                </th>
                <th onClick={() => handleSort('brand')} style={{ padding: '20px', cursor: 'pointer', borderBottom: '2px solid #334155' }}>
                  Brand <span style={{ color: '#64748b', marginLeft: '5px' }}>{getSortIcon('brand')}</span>
                </th>
                <th onClick={() => handleSort('category')} style={{ padding: '20px', cursor: 'pointer', borderBottom: '2px solid #334155' }}>
                  Kategori <span style={{ color: '#64748b', marginLeft: '5px' }}>{getSortIcon('category')}</span>
                </th>
                <th onClick={() => handleSort('price')} style={{ padding: '20px', cursor: 'pointer', borderBottom: '2px solid #334155' }}>
                  Harga Retail <span style={{ color: '#64748b', marginLeft: '5px' }}>{getSortIcon('price')}</span>
                </th>
                <th onClick={() => handleSort('seller_product_status')} style={{ padding: '20px', cursor: 'pointer', borderBottom: '2px solid #334155' }}>
                  Status <span style={{ color: '#64748b', marginLeft: '5px' }}>{getSortIcon('seller_product_status')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.length > 0 ? processedData.map((d, i) => {
                const isAvailable = d.buyer_product_status && d.seller_product_status;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px 20px', fontWeight: '500' }}>{d.product_name}</td>
                    <td style={{ padding: '15px 20px', color: '#94a3b8' }}>{d.brand}</td>
                    <td style={{ padding: '15px 20px' }}>
                       <span style={{ background: '#334155', padding: '5px 10px', borderRadius: '5px', fontSize: '0.85rem' }}>{d.category}</span>
                    </td>
                    <td style={{ padding: '15px 20px', color: '#10b981', fontWeight: 'bold' }}>Rp {d.price.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: isAvailable ? '#10b981' : '#ef4444', 
                        padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' 
                      }}>
                        {isAvailable ? 'Tersedia' : 'Gangguan'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Data produk tidak ditemukan berdasarkan filter/pencarian Anda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default HargaList;
