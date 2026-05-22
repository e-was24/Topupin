import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import ErrorRobot from "../components/ErrorRobot";
import { fetchProducts } from "../api/productApi.js";

function Dashboard() {
  const navigate = useNavigate();

  // State Management
  const [user, setUser] = useState(null);
  const [dataProduk, setDataProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [showAlphabet, setShowAlphabet] = useState(false);

  // 1. Gabungkan Pengecekan Autentikasi
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [navigate]);

  // 2. Fetch Data Produk dengan Caching & Background Refresh
  useEffect(() => {
    // Ambil data dari cache localstorage terlebih dahulu agar UI cepat muncul
    const cachedData = localStorage.getItem("lastPricelist");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDataProduk(parsed);
          setLoading(false);
        }
      } catch (e) {
        console.error("Gagal membaca cache:", e);
      }
    }

    const getProducts = async (isBackground = false) => {
      try {
        if (!isBackground && !localStorage.getItem("lastPricelist")) {
          setLoading(true);
        }

        const data = await fetchProducts();
        const validData = Array.isArray(data) ? data : [];

        setDataProduk(validData);
        setError(null);

        // Update Cache
        localStorage.setItem("lastPricelist", JSON.stringify(validData));

        // Export JSON fisik hanya saat development (Vite Middleware)
        if (import.meta.env.DEV) {
          fetch("/api/save-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validData, null, 2),
          }).catch(() => null); // Silent catch
        }
      } catch (err) {
        if (!localStorage.getItem("lastPricelist")) {
          setError(err.message);
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    getProducts();
    const intervalId = setInterval(() => getProducts(true), 1800000); // 30 menit

    return () => clearInterval(intervalId);
  }, [retryTrigger]);

  // 3. Logic Grouping & Alfabet (Memoized untuk Performa)
  const { groupedByCategory, sortedCategories, validLetters } = useMemo(() => {
    // Grouping per Brand
    const groupedBrands = dataProduk.reduce((acc, product) => {
      const bName = product.brand || "Lainnya";
      if (!acc[bName]) {
        acc[bName] = {
          brand: bName,
          category: product.category || "General",
          img: product.img || "https://via.placeholder.com/150",
          count: 0,
        };
      }
      acc[bName].count++;
      return acc;
    }, {});

    const uniqueBrands = Object.values(groupedBrands);

    // Grouping per Kategori untuk "Rak"
    const byCategory = uniqueBrands.reduce((acc, brandInfo) => {
      if (!acc[brandInfo.category]) acc[brandInfo.category] = [];
      acc[brandInfo.category].push(brandInfo);
      return acc;
    }, {});

    const sortedCats = Object.keys(byCategory).sort();
    const letters = new Set(sortedCats.map((c) => c[0].toUpperCase()));

    return {
      groupedByCategory: byCategory,
      sortedCategories: sortedCats,
      validLetters: letters,
    };
  }, [dataProduk]);

  // Early Returns
  if (!user)
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Loading session...</h2>
      </div>
    );
  if (loading && dataProduk.length === 0)
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Loading products...</h2>
      </div>
    );

  if (error && dataProduk.length === 0) {
    return (
      <ErrorRobot
        message={error}
        onRetry={() => setRetryTrigger((prev) => prev + 1)}
      />
    );
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const seenLetters = new Set();

  return (
    <div
      className="Dashboard-container"
      style={{ padding: "40px 20px", minHeight: "100vh", position: "relative" }}
    >
      {/* Tombol Toggle Menu Alfabet */}
      <div
        className={`menu-btn-real ${showAlphabet ? "active" : ""}`}
        style={{
          zIndex: 101,
          background: showAlphabet ? "#ef4444" : "#3b82f6",
          color: "white",
        }}
        onClick={() => setShowAlphabet(!showAlphabet)}
      >
        {showAlphabet ? (
          "✖ Tutup"
        ) : (
          <span style={{ display: "flex" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            &nbsp; Cari
          </span>
        )}
      </div>

      {/* Sidebar Alfabet Navigasi */}
      <div
        className="hide-scrollbar"
        style={{
          position: "fixed",
          right: "20px",
          top: "50dvh",
          transform: `translateY(-50%) ${showAlphabet ? "translateX(0)" : "translateX(150%)"}`,
          display: "flex",
          flexDirection: "column",
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(10px)",
          padding: "15px 8px",
          borderRadius: "30px",
          zIndex: 100,
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          opacity: showAlphabet ? 1 : 0,
          height: "70dvh",
        }}
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {alphabet.map((letter) => {
          const isValid = validLetters.has(letter);
          return (
            <div
              key={letter}
              onClick={() => {
                if (isValid) {
                  document
                    .getElementById(`rak-${letter}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                  if (window.innerWidth < 768) setShowAlphabet(false);
                }
              }}
              style={{
                color: isValid ? "#3b82f6" : "#475569",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: isValid ? "pointer" : "default",
                padding: "0 5px",
                textAlign: "center",
                transition: "0.2s",
                transform: isValid ? "scale(1.1)" : "scale(1)",
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      {/* Header Section */}
      <div
        style={{
          textAlign: "left",
          width: "100%",
          maxWidth: "1200px",
          marginBottom: "50px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", color: "white" }}>
          Halo,{" "}
          <span style={{ color: "#3b82f6" }}>
            {user.user_metadata?.full_name || user.user_metadata?.username || "Pemain"}
          </span>
          !
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Pilih kategori game yang ingin kamu top-up hari ini.
        </p>
      </div>

      {/* Katalog Per Kategori */}
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
              style={{ marginBottom: "50px", scrollMarginTop: "100px" }}
            >
              <h2
                style={{
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  fontSize: "1.5rem",
                  borderBottom: "2px solid #1e293b",
                  paddingBottom: "15px",
                  marginBottom: "25px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#3b82f6" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#255290"><path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z"/></svg>
                </span>
                {category}
              </h2>

              <div
                className="dashboard-catalog-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "20px",
                }}
              >
                {brands.map((brandInfo, index) => (
                  <Card
                    key={brandInfo.brand}
                    title={brandInfo.brand}
                    text={`${brandInfo.count} Pilihan`}
                    buttonText="Beli"
                    img={brandInfo.img || "https://picsum.photos/150"}
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
