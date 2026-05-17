import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import ErrorRobot from "../components/ErrorRobot";
import { fetchProducts } from "../api/productApi";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [dataProduk, setDataProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [showAlphabet, setShowAlphabet] = useState(false);

  // Di dalam Dashboard.jsx
  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      console.log("Data Lengkap User:", data);
    }
  };
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // Jika tidak ada session, lempar balik ke login
        navigate("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    // 1. Coba ambil cache (format JSON) dari LocalStorage saat komponen berjalan
    const cachedData = localStorage.getItem("lastPricelist");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDataProduk(parsed);
          setLoading(false); // Matikan loading jika cache tersedia
        }
      } catch (e) {
        console.error("Gagal membaca cache JSON:", e);
      }
    }

    const getProducts = async (isBackground = false) => {
      try {
        // Hindari animasi loading jika background fetch berjalan ATAU data cache sudah ada
        if (!isBackground && !localStorage.getItem("lastPricelist")) {
          setLoading(true);
        }

        const data = await fetchProducts();
        const validData = Array.isArray(data) ? data : [];

        setDataProduk(validData);
        setError(null);

        // 2. Simpan data terbaru sebagai stringify JSON persisten
        localStorage.setItem("lastPricelist", JSON.stringify(validData));
        localStorage.setItem("lastUpdateTime", new Date().getTime().toString());

        // 3. Simpan fisik file JSON ke server lokal (Vite Middleware) untuk backup codebase
        if (import.meta.env.DEV) {
          fetch("/api/save-products", {
            method: "POST",
            body: JSON.stringify(validData, null, 2),
          }).catch((e) => console.error("Gagal mengekspor JSON fisik:", e));
        }
      } catch (err) {
        // Jika data utama belum pernah ada (cache kosong), tampilkan layar animasi robot error.
        // Sebaliknya jika ini perbaruan rutin yang gagal, abaikan dan tampilkan cache lama
        if (!localStorage.getItem("lastPricelist")) {
          setError(err.message);
        } else {
          console.warn(
            "Background update tertunda (menggunakan cache):",
            err.message,
          );
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    getProducts();

    const intervalId = setInterval(() => {
      getProducts(true);
    }, 1800000); // 30 minutes in milliseconds

    return () => clearInterval(intervalId);
  }, [retryTrigger]);

  if (!user)
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Loading user...</h2>
      </div>
    );
  if (loading)
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Loading products...</h2>
      </div>
    );

  if (error) {
    return (
      <ErrorRobot
        message={error}
        onRetry={() => {
          setError(null);
          setRetryTrigger((prev) => prev + 1);
        }}
      />
    );
  }

  const groupedBrands = dataProduk.reduce((acc, product) => {
    if (!acc[product.brand]) {
      acc[product.brand] = {
        brand: product.brand,
        category: product.category, // Tangkap category
        img:
          product.img ||
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png",
        count: 1,
      };
    } else {
      acc[product.brand].count++;
    }
    return acc;
  }, {});

  const uniqueBrands = Object.values(groupedBrands);

  // Group brands by category as "shelves"
  const groupedByCategory = uniqueBrands.reduce((acc, brandInfo) => {
    if (!acc[brandInfo.category]) acc[brandInfo.category] = [];
    acc[brandInfo.category].push(brandInfo);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedByCategory).sort();
  const validLetters = new Set(sortedCategories.map(c => c[0].toUpperCase()));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const seenLetters = new Set();

  return (
    <div
      className="Dashboard-container"
      style={{ padding: "40px 20px", minHeight: "100dvh", position: "relative" }}
    >
      {/* Button Menu Kiri as Alphabet Toggle */}
      <div 
        className={`menu-btn-real ${showAlphabet ? 'active' : ''}`}
        onClick={() => setShowAlphabet(!showAlphabet)}
      >
        {showAlphabet ? 'Tutup' : 'Menus'}
      </div>

      {/* Sidebar Alphabet */}
      <div 
        className="hide-scrollbar"
        style={{
        position: 'fixed',
        right: '15px',
        top: '100px', 
        bottom: '100px', // Jaga jarak dengan tombol toggle
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Jangan dipaksa ke 'center' yang dapat memotong item saat ter-overflow 
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '10px 5px',
        borderRadius: '25px',
        zIndex: 100,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        overflowY: 'auto',
        transform: showAlphabet ? 'translateX(0)' : 'translateX(150%)',
        opacity: showAlphabet ? 1 : 0,
        pointerEvents: showAlphabet ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' // Efek membal / bouncy
      }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        {alphabet.map(letter => {
          const isValid = validLetters.has(letter);
          return (
            <div 
              key={letter}
              onClick={() => {
                if (isValid) {
                  document.getElementById(`rak-${letter}`)?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                color: isValid ? '#ffffff' : '#334155',
                fontSize: '0.75rem', // Ukuran diperkecil untuk menghemat tinggi layar vertikal
                fontWeight: isValid ? 'bold' : 'normal',
                cursor: isValid ? 'pointer' : 'default',
                margin: '1px 0',
                padding: '3px 8px',
                transition: 'all 0.2s ease',
                textShadow: isValid ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
              }}
              onMouseOver={e => { if (isValid) e.target.style.transform = 'scale(1.4)' }}
              onMouseOut={e => { if (isValid) e.target.style.transform = 'scale(1)' }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <h1 style={{ marginBottom: "40px" }}>
        Selamat Datang, {user.user_metadata.username}!
      </h1>

      <div style={{ width: "100%", maxWidth: "1200px" }}>
        {sortedCategories.map((category) => {
          const brands = groupedByCategory[category];
          const firstChar = category[0].toUpperCase();
          const isFirstOfLetter = !seenLetters.has(firstChar);
          if (isFirstOfLetter) seenLetters.add(firstChar);

          return (
            <div 
              key={category} 
              id={isFirstOfLetter ? `rak-${firstChar}` : undefined}
              style={{ marginBottom: "25px", scrollMarginTop: "80px" }}
            >
            <h2
              style={{
                color: "white",
                textAlign: "left",
                borderBottom: "3px solid #3b82f6",
                paddingBottom: "10px",
                marginBottom: "25px",
                fontSize: "1.8rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#60a5fa" }}
              >
                category
              </span>
              : {category}
            </h2>

            <div className="dashboard-catalog-grid">
              {brands.map((brandInfo, index) => (
                <Card
                  key={brandInfo.brand}
                  title={brandInfo.brand}
                  text={`${brandInfo.count} Produk`}
                  buttonText="Lihat Detail"
                  img={brandInfo.img}
                  link={`/dashboard/brand/${encodeURIComponent(brandInfo.brand)}`}
                  index={index}
                />
              ))}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
