import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import "./App.css";
import "./components/version.css";

// 1. Komponen biasa & Asset Tetap Di-import Normal
import Version from "./components/Version";
import Navbar from "./components/Navbar";
import Button from "./components/Button";
import Popup from "./components/Popup";
import Notfound from "./pages/NotFound";
import LogoImg from "./assets/TOPUPIN.png";

// 2. Lazy Imports
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BrandProduk = lazy(() => import("./pages/BrandProduk"));
const Payment = lazy(() => import("./pages/Payment"));
const CekId = lazy(() => import("./pages/CekId"));
const HargaList = lazy(() => import("./pages/HargaList"));
const About = lazy(() => import("./pages/About"));

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Efek untuk memantau status login secara real-time dari local storage / Supabase token
  useEffect(() => {
    const checkLoginStatus = () => {
      // Menggunakan trik deteksi serbaguna token auth yang kita bahas sebelumnya
      const hasToken = Object.keys(localStorage).some(key => key.includes("auth-token")) || !!localStorage.getItem("token");
      setIsLoggedIn(hasToken);
    };

    checkLoginStatus();

    // Opsional: Listen jika ada perubahan storage dari tab lain atau event custom
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // Menu bawaan yang HANYA muncul jika user BELUM login
  const menus = [
    { text: "Beranda", link: "/" },
    { text: "Cek ID", link: "/cek-id" },
    { text: "Lihat Produk", link: "/produk" },
  ];

  return (
    <Router>
      {/* Oper data isLoggedIn ke Navbar agar kondisi penayangan list menu bekerja sempurna */}
      <Navbar
        menus={menus}
        user={isLoggedIn} // Mengirim status login sebagai props 'user' ke Navbar Anda
        NavigationName="navbar"
        navContainer="nav-container"
        navLogo="nav-logo"
        navMenu="nav-menu"
        navMenuItem="nav-menu-item"
        navMenuList="nav-menu-list"
        navButton="nav-button"
        logo={LogoImg}
      />

      {/* 3. BUNGKUS ROUTES DENGAN SUSPENSE */}
      {/* BUNGKUS ROUTES DENGAN SUSPENSE LOADER YANG BARU */}
      <Suspense fallback={
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          color: "#e3e3e3",
          gap: "15px"
        }}>
          <div className="page-loader-spinner"></div>
          <span style={{ fontSize: "0.9rem", color: "#94a3b8", letterSpacing: "1px" }}>
            MEMUAT HALAMAN...
          </span>
        </div>
      }>
        <Routes>
          <Route path="*" element={<Notfound />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/brand/:brandName" element={<BrandProduk />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cek-id" element={<CekId />} />
          <Route path="/produk" element={<HargaList />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>

      {/* Tombol Hubungi Kami / CS */}
      <Button
        className="btn btn-cs"
        text={
          <span className="material-symbols-outlined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M440-120v-80h320v-284q0-117-81.5-198.5T480-764q-117 0-198.5 81.5T200-484v244h-40q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v49q0 33-23.5 56.5T760-120H440ZM331.5-411.5Q320-423 320-440t11.5-28.5Q343-480 360-480t28.5 11.5Q400-457 400-440t-11.5 28.5Q377-400 360-400t-28.5-11.5Zm240 0Q560-423 560-440t11.5-28.5Q583-480 600-480t28.5 11.5Q640-457 640-440t-11.5 28.5Q617-400 600-400t-28.5-11.5ZM241-462q-7-106 64-182t177-76q89 0 156.5 56.5T720-519q-91-1-167.5-49T435-698q-16 80-67.5 142.5T241-462Z" />
            </svg>
          </span>
        }
        onClick={() => setIsOpen(true)}
      />

      <Popup isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div style={{ textAlign: "center", padding: "10px" }}>
          <h3 style={{ marginBottom: "20px" }}>Hubungi Kami</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href="https://wa.me/6281227347103"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                backgroundColor: "#25D366",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              WhatsApp
            </a>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                backgroundColor: "#2FA6D9",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              Telegram
            </a>
            <a
              href="https://discord.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                backgroundColor: "#5865F2",
                color: "white",
                textDecoration: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              Discord
            </a>
          </div>
        </div>
      </Popup>
      <Version />
    </Router>
  );
}

export default App;