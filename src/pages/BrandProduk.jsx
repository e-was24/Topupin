import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";
import ErrorRobot from "../components/ErrorRobot";
import { fetchProducts } from "../api/productApi";

function BrandProduk() {
  const { brandName } = useParams();
  const decodedBrand = decodeURIComponent(brandName);
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [dataProduk, setDataProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Steps
  const [userId1, setUserId1] = useState("");
  const [userId2, setUserId2] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // Attempt cache load
    const cachedData = localStorage.getItem("lastPricelist");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDataProduk(parsed);
          setLoading(false);
        }
      } catch (e) {
        console.error("Gagal membaca cache JSON:", e);
      }
    }

    const getProducts = async () => {
      try {
        if (!localStorage.getItem("lastPricelist")) {
          setLoading(true);
        }
        const data = await fetchProducts();
        const validData = Array.isArray(data) ? data : [];
        setDataProduk(validData);
        setError(null);
        
        localStorage.setItem("lastPricelist", JSON.stringify(validData));
        localStorage.setItem("lastUpdateTime", new Date().getTime().toString());
      } catch (err) {
        if (!localStorage.getItem("lastPricelist")) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (!user) return <div className="Dashboard-container"><h2 style={{ color: "white" }}>Loading user...</h2></div>;
  if (loading) return <div className="Dashboard-container"><h2 style={{ color: "white" }}>Loading products...</h2></div>;

  if (error) {
    return <ErrorRobot message={error} onRetry={() => window.location.reload()} />;
  }

  const filteredProd = dataProduk.filter(p => p.brand === decodedBrand);

  const handlePayment = () => {
    if (!userId1 || !selectedProduct) return; // Basic validation
    
    // Jump to Payment page with specific payload
    navigate('/payment', { 
      state: { 
        product: selectedProduct, 
        gameId: `${userId1}${userId2 ? ` (${userId2})` : ''}`, 
        userEmail: user.email 
      }
    });
  };

  return (
    <div className="Dashboard-container" style={{ paddingBottom: selectedProduct ? '120px' : '40px', justifyContent: 'flex-start' }}>
      
      {/* Header Container */}
      <div style={{width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '40px'}}>
        <Link 
          to="/dashboard" 
          style={{
            marginBottom: '20px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '10px 20px', 
            borderRadius: '10px', 
            color: 'white', 
            textDecoration: 'none',
            display: 'inline-block',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          ← Kembali ke Dashboard
        </Link>
        <h1 style={{color: 'white', textAlign: 'left', margin: '0 0 30px 0'}}>Top Up: {decodedBrand}</h1>
        
        {/* STEP 1: ID Input */}
        <div style={{ width: '100%', background: '#1e293b', borderRadius: '15px', padding: '25px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, fontSize: '1.4rem' }}>
            <span style={{ background: '#3b82f6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' }}>1</span>
            Masukkan Data Akun
          </h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
             <input 
               type="text" 
               placeholder="Masukkan Nomor Tujuan / Game ID"
               value={userId1}
               onChange={(e) => setUserId1(e.target.value)}
               style={{ flex: '2', minWidth: '250px', padding: '15px', borderRadius: '10px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none', fontSize: '1rem' }}
             />
             <input 
               type="text" 
               placeholder="Server / Zone ID (Bila Ada)"
               value={userId2}
               onChange={(e) => setUserId2(e.target.value)}
               style={{ flex: '1', minWidth: '200px', padding: '15px', borderRadius: '10px', border: '1px solid #475569', background: '#0f172a', color: 'white', outline: 'none', fontSize: '1rem' }}
             />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '15px' }}>Pastikan data User ID sudah sesuai agar pesanan segera masuk tanpa kendala. Segala bentuk kesalahan input menjadi tanggungjawab pembeli.</p>
        </div>

        {/* STEP 2: Product List */}
        <div style={{ width: '100%', background: '#1e293b', borderRadius: '15px', padding: '25px', marginBottom: '30px', border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, fontSize: '1.4rem', marginBottom: '25px' }}>
            <span style={{ background: '#3b82f6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' }}>2</span>
            Pilih Nominal & Produk
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '22px', width: '100%' }}>
            {filteredProd.map((product) => (
              <ProductCard
                key={product.buyer_sku_code}
                title={product.product_name}
                sku={product.buyer_sku_code}
                price={product.price}
                isSelected={selectedProduct?.buyer_sku_code === product.buyer_sku_code}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
            {filteredProd.length === 0 && <p style={{color: '#94a3b8', fontStyle: 'italic'}}>Tidak ada produk tersedia saat ini.</p>}
          </div>
        </div>

      </div>

      {/* FLOAT FOOTER (STEP 3) */}
      {selectedProduct && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: '25px 50px',
          background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid #334155',
          backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', zIndex: 100, boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
          flexWrap: 'wrap', gap: '20px'
        }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px', fontSize: '14px' }}>Total Harga Pembayaran</p>
            <h2 style={{ margin: 0, color: '#10b981', fontSize: '1.8rem', fontWeight: 800 }}>Rp {selectedProduct.price?.toLocaleString('id-ID')}</h2>
          </div>
          
          {/* Prevent buy if ID is empty */}
          <button 
            onClick={handlePayment}
            disabled={!userId1}
            style={{ 
              padding: '16px 45px', borderRadius: '12px', border: 'none',
              background: userId1 ? 'linear-gradient(135deg, #10b981, #059669)' : '#475569',
              color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
              cursor: userId1 ? 'pointer' : 'not-allowed', transition: 'all 0.3s',
              boxShadow: userId1 ? '0 5px 15px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            {userId1 ? 'Beli Sekarang / Lanjut' : 'Lengkapi ID Game Dulu'}
          </button>
        </div>
      )}
    </div>
  );
}

export default BrandProduk;
