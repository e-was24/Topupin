import Button from "./Button";
import Card from "./Card";
import { useState, useEffect, useMemo } from "react";
import { fetchProducts } from "../api/productApi.js";
import DefaultImg from "../assets/default.png";

function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [dataProduk, setDataProduk] = useState([]);
  const [error, setError] = useState(null);

  const { groupedByCategory, sortedCategories } = useMemo(() => {
    const groupedBrands = dataProduk.reduce((acc, product) => {
      const bName = product.brand || "Lainnya";
      if (!acc[bName]) {
        acc[bName] = {
          brand: bName,
          category: product.category || "General",
          img: product.img || DefaultImg,
          count: 0,
        };
      }
      acc[bName].count++;
      return acc;
    }, {});

    const uniqueBrands = Object.values(groupedBrands);

    const byCategory = uniqueBrands.reduce((acc, brandInfo) => {
      if (!acc[brandInfo.category]) acc[brandInfo.category] = [];
      acc[brandInfo.category].push(brandInfo);
      return acc;
    }, {});

    const sortedCats = Object.keys(byCategory).sort();

    return { groupedByCategory: byCategory, sortedCategories: sortedCats };
  }, [dataProduk]);

  const seenLetters = new Set();

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

  useEffect(() => {
    getProducts();
    const intervalId = setInterval(() => getProducts(true), 1800000); // 30 menit
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && dataProduk.length === 0) {
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Loading products...</h2>
      </div>
    );
  }

  if (error && dataProduk.length === 0) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Top Up Aman, Dompet Tenang di TopupinID.
            </h1>
            <p className="hero-description">
              Platform terpercaya untuk pulsa dan voucher game dengan metode
              pembayaran terlengkap.
            </p>
            <div className="hero-buttons">
              <Button
                text="Belanja Sekarang"
                className="btn btn-primary"
                onClick={() => {
                  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
                }}
              ></Button>
            </div>
          </div>
        </div>
      </section>

      <div className="aboutUs">
        <div className="menu-cover">

        <h2 className="about-title">Mengapa Memilih Topupin?</h2>
        <Button to="/about" className="btn btn-secondary" text="about"/>
        </div>
      </div>

      <div id="products" className="products-section">
        <h2 className="products-title">Produk Unggulan Kami</h2>
        <div className="products-grid">
          <div className="product-card">
            <h3 className="product-name">Pulsa Reguler</h3>
            <p className="product-description">
              Pulsa untuk semua operator dengan harga kompetitif.
            </p>
            <span className="status">Tersedia</span>
          </div>
          <div className="product-card">
            <h3 className="product-name">Voucher Game</h3>
            <p className="product-description">
              Voucher untuk berbagai game populer dengan diskon menarik.
            </p>
            <span className="status">Tersedia</span>
          </div>
          <div className="product-card">
            <h3 className="product-name">Paket Data</h3>
            <p className="product-description">
              Paket data untuk semua operator dengan harga terbaik.
            </p>
            <span className="status">Tersedia</span>
          </div>
        </div>
      </div>

      <div className="LandingPage-listProduk">
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
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#255290"><path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z" /></svg>
                </span>
                {category}
              </h2>

              <div
                className="dashboard-catalog-grid"
              >
                {brands.map((brandInfo, index) => (
                  <Card
                    key={brandInfo.brand}
                    title={brandInfo.brand}
                    text={`${brandInfo.count} Pilihan`}
                    buttonText="Terseedia"
                    img={brandInfo.img || DefaultImg}
                    index={index}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default LandingPage;
