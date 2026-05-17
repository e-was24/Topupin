import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Version from "./components/Version";
import Dashboard from "./pages/Dashboard";
import BrandProduk from "./pages/BrandProduk";
import Payment from "./pages/Payment";
import CekId from "./pages/CekId";
import HargaList from "./pages/HargaList";
import Notfound from "./pages/NotFound";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Button from "./components/Button";
import Popup from "./components/Popup";
import LogoImg from "./assets/TOPUPIN.png";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const menus = [
    { text: "Beranda", link: "/" },
    { text: "Cek ID", link: "/cek-id" },
    { text: "Lihat Produk", link: "/produk" },
  ];

  return (
    <Router>
      <Navbar
        menus={menus}
        NavigationName="navbar"
        navContainer="nav-container"
        navLogo="nav-logo"
        navMenu="nav-menu"
        navMenuItem="nav-menu-item"
        navMenuList="nav-menu-list"
        navButton="nav-button"
        logo={LogoImg}
      />
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
      </Routes>
      <Button
        className="btn btn-cs"
        text={
          <>
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
          </>
        }
        onClick={() => setIsOpen(true)}
      />
      <Popup isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div style={{ textAlign: "center", padding: "10px" }}>
          <p style={{ marginBottom: "25px" }}>
            Anda dapat memasukkan teks, form, atau komponen React lainnya di
            sini.
          </p>
        </div>
      </Popup>
      <Version />
    </Router>
  );
}

export default App;
