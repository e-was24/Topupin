import { useEffect, useState } from "react";
import "./components.css";
import { Link, useNavigate } from "react-router-dom"; // <-- useLocation dihapus karena dipindahkan ke App.jsx/Suspense
import { supabase } from "../lib/supabaseClient";
import Button from "./Button";
import DefaultImg from "../assets/icon.png";

function Navbar(props) {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // State khusus untuk menangani loading internal pemicu hamburger menu mobile
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  // Steam-style Realtime Search Pipeline
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const cachedData = localStorage.getItem("lastPricelist");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const term = searchTerm.toLowerCase();

        const matched = parsed.filter(
          (p) =>
            (p.product_name && p.product_name.toLowerCase().includes(term)) ||
            (p.brand && p.brand.toLowerCase().includes(term)),
        );

        const uniqueBrands = [];
        const seen = new Set();
        for (let p of matched) {
          if (!seen.has(p.brand)) {
            seen.add(p.brand);
            uniqueBrands.push({ brand: p.brand, category: p.category });
          }
        }
        setSearchResults(uniqueBrands.slice(0, 5));
      } catch (e) { }
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.warn("Supabase auth checks suspended due to missing VERCEL config.");
      }
    };
    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false); // Tutup menu mobile saat logout
    navigate("/");
  };

  // Fungsi interaksi tombol hamburger dengan delay loading instan khusus mobile
  const handleHamburgerClick = () => {
    if (!isMobileMenuOpen) {
      setIsMenuLoading(true);

      // Simulasi loading selama 400 milidetik sebelum menu benar-benar dibuka
      setTimeout(() => {
        setIsMobileMenuOpen(true);
        setIsMenuLoading(false);
      }, 400);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={props.NavigationName}>
        <div className={props.navContainer} style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <div className={props.navLogo}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={props.logo} alt="Logo" />
            </Link>
          </div>

          {/* Real-time Search Block */}
          <div className="navbar-searchbar" style={{ position: "relative", display: "flex", alignItems: "center", flex: 1, justifyContent: "flex-end", margin: "0 15px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(15, 23, 42, 0.6)", borderRadius: "30px", border: "1px solid #334155", padding: "4px 10px", width: "100%", maxWidth: "300px", transition: "all 0.3s" }}>
              <span className="material-symbols-outlined" style={{ color: "#94a3b8", fontSize: "20px", marginLeft: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#CCCCCC">
                  <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari Game / Produk..."
                className="input-search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{ background: "transparent", border: "none", color: "white", width: "100%", padding: "5px 8px", outline: "none", fontSize: '0.85rem' }}
              />
            </div>

            {/* Dropdown Results Overlay */}
            {showDropdown && searchTerm.length > 1 && (
              <div style={{ position: "absolute", top: "calc(100% + 15px)", left: "auto", right: "50%", transform: "translateX(50%)", width: "100%", minWidth: "250px", maxWidth: "400px", background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden", zIndex: 1000, boxShadow: "0 15px 40px rgba(0,0,0,0.8)", maxHeight: "400px", overflowY: "auto" }}>
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => {
                    // Pengecekan ketat untuk gambar (antisipasi string kosong dari DB)
                    const hasImage = res.img && res.img.trim() !== "";
                    const finalSrc = hasImage ? res.img : DefaultImg;

                    return (
                      <div
                        key={res.brand + i}
                        onClick={() => {
                          setSearchTerm("");
                          navigate(`/dashboard/brand/${encodeURIComponent(res.brand)}`);
                        }}
                        style={{
                          padding: "10px 15px",
                          color: "white",
                          borderBottom: "1px solid #334155",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "row", // Mengubah ke row agar gambar di samping teks
                          alignItems: "center",
                          gap: "12px",
                          transition: "background 0.2s"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Tag Gambar dimasukkan di sini dengan ukuran proporsional */}
                        <img
                          src={finalSrc}
                          alt={res.brand}
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            backgroundColor: "#1e293b" // Background cadangan saat memuat
                          }}
                        />

                        {/* Pembungkus Teks (Brand & Category) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#f1f5f9" }}>
                            {res.brand}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8", background: "#0f172a", padding: "2px 6px", borderRadius: "4px", width: "fit-content" }}>
                            {res.category}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "15px", color: "#94a3b8", textAlign: "center", fontSize: "0.8rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "28px", display: "block", margin: "0 auto 8px", color: "#475569" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 24px" fill="#CCCCCC"><path d="M138.5-138.5Q80-197 80-280t58.5-141.5Q197-480 280-480t141.5 58.5Q480-363 480-280t-58.5 141.5Q363-80 280-80t-141.5-58.5ZM824-120 568-376q-12-13-25.5-26.5T516-428q38-24 61-64t23-88q0-75-52.5-127.5T420-760q-75 0-127.5 52.5T240-580q0 6 .5 11.5T242-557q-18 2-39.5 8T164-535q-2-11-3-22t-1-23q0-109 75.5-184.5T420-840q109 0 184.5 75.5T680-580q0 43-13.5 81.5T629-428l251 252-56 56Zm-615-61 71-71 70 71 29-28-71-71 71-71-28-28-71 71-71-71-28 28 71 71-71 71 28 28Z" /></svg>
                    </span>
                    Produk tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Menu Mobile Toggle */}
          <div className="hamburger" onClick={handleHamburgerClick}>
            {isMenuLoading ? (
              <div className="menu-spinner"></div>
            ) : isMobileMenuOpen ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </div>

          <div className={`${props.navMenu} ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul className={props.navMenuList}>
              {user ? (
                <>
                  {/* Menu Khusus User yang Sudah Login */}
                  <li className={props.navMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li className={props.navMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/cek-id">Cek Id</Link>
                  </li>
                  <li className={props.navMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/produk">List Produk</Link>
                  </li>
                </>
              ) : (
                <>
                  {/* Menu Khusus Guest / Belum Login */}
                  {props.menus.map((item, index) => (
                    <li
                      key={`menu-${index}`}
                      className={props.navMenuItem}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to={item.link}>{item.text}</Link>
                    </li>
                  ))}
                </>
              )}
            </ul>

            {/* Menyimpan div tombol di luar <ul> agar struktur HTML tetap valid */}
            <div className={`${props.navButton} ${isMobileMenuOpen ? 'active' : ''}`} style={{ gap: "15px", alignItems: "center" }}>
              {user ? (
                <Button
                  text="Keluar"
                  className="btn btn-logout"
                  style={{ color: "#ef4444", borderColor: "#ef4444" }}
                  onClick={handleLogout}
                />
              ) : (
                <>
                  <Button
                    text="Register"
                    className="btn btn-register"
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <Button
                    text="Login"
                    className="btn btn-login"
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Auth (Login / Register / Logout)
        <div className={`${props.navButton} ${isMobileMenuOpen ? 'active' : ''}`} style={{ gap: "15px", alignItems: "center" }}>
          {user ? (
            <Button
              text="Keluar"
              className="btn btn-logout"
              style={{ color: "#ef4444", borderColor: "#ef4444" }}
              onClick={handleLogout}
            />
          ) : (
            <>
              <Button
                text="Register"
                className="btn btn-register"
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <Button
                text="Login"
                className="btn btn-login"
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </>
          )}
        </div> */}
      </nav>
    </>
  );
}

export default Navbar;