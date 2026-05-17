import { useState, useEffect } from "react";
import "./components.css";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Button from "./Button";

function Navbar(props) {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

        // Match both exact product names and parent Brands
        const matched = parsed.filter(
          (p) =>
            (p.product_name && p.product_name.toLowerCase().includes(term)) ||
            (p.brand && p.brand.toLowerCase().includes(term)),
        );

        // Group by Brand to avoid spamming 100 identical Diamond nominals
        const uniqueBrands = [];
        const seen = new Set();
        for (let p of matched) {
          if (!seen.has(p.brand)) {
            seen.add(p.brand);
            uniqueBrands.push({ brand: p.brand, category: p.category });
          }
        }
        // Take top 5 results for dropdown
        setSearchResults(uniqueBrands.slice(0, 5));
      } catch (e) {}
    }
  }, [searchTerm]);

  useEffect(() => {
    // Cek session awal saat dimuat
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

    // Pastikan Navbar selalu memperbarui tombol jika status login berubah
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <nav className={props.NavigationName}>
        <div className={props.navContainer} style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <div className={props.navLogo}>
            <Link to="/">
              <img src={props.logo} alt="" />
            </Link>
          </div>
          
          <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? (
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
              {props.menus.map((item, index) => (
                <li key={index} className={props.navMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to={item.link}>{item.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`${props.navButton} ${isMobileMenuOpen ? 'active' : ''}`} style={{ gap: "15px", alignItems: "center" }}>
          {/* Real-time Search Block */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(15, 23, 42, 0.6)",
                borderRadius: "30px",
                border: "1px solid #334155",
                padding: "4px 10px 4px 15px",
                minWidth: "260px",
                transition: "all 0.3s",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#94a3b8", fontSize: "20px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#FFFFFF"
                >
                  <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari Game / Produk..."
                className="input-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  width: "100%",
                  padding: "8px 10px",
                  outline: "none",
                }}
              />
            </div>

            {/* Dropdown Results Overlay */}
            {showDropdown && searchTerm.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 15px)",
                  left: 0,
                  right: 0,
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  overflow: "hidden",
                  zIndex: 1000,
                  boxShadow: "0 15px 40px rgba(0,0,0,0.8)",
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <div
                      key={res.brand + i}
                      onClick={() => {
                        setSearchTerm("");
                        navigate(
                          `/dashboard/brand/${encodeURIComponent(res.brand)}`,
                        );
                      }}
                      style={{
                        padding: "12px 15px",
                        color: "white",
                        borderBottom: "1px solid #334155",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(59, 130, 246, 0.2)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          color: "#f1f5f9",
                        }}
                      >
                        {res.brand}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#94a3b8",
                          background: "#0f172a",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          width: "fit-content",
                        }}
                      >
                        {res.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      color: "#94a3b8",
                      textAlign: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "32px",
                        display: "block",
                        margin: "0 auto 10px",
                        color: "#475569",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#CCCCCC"
                      >
                        <path d="M138.5-138.5Q80-197 80-280t58.5-141.5Q197-480 280-480t141.5 58.5Q480-363 480-280t-58.5 141.5Q363-80 280-80t-141.5-58.5ZM824-120 568-376q-12-13-25.5-26.5T516-428q38-24 61-64t23-88q0-75-52.5-127.5T420-760q-75 0-127.5 52.5T240-580q0 6 .5 11.5T242-557q-18 2-39.5 8T164-535q-2-11-3-22t-1-23q0-109 75.5-184.5T420-840q109 0 184.5 75.5T680-580q0 43-13.5 81.5T629-428l251 252-56 56Zm-615-61 71-71 70 71 29-28-71-71 71-71-28-28-71 71-71-71-28 28 71 71-71 71 28 28Z" />
                      </svg>
                    </span>
                    Produk tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Render tombol secara bersyarat berdasarkan state user */}
          {user ? (
            <Button
              text="Keluar Akun"
              className="btn btn-register"
              onClick={handleLogout}
            />
          ) : (
            <>
              <Button
                text="Register"
                className="btn btn-register"
                to="/register"
              />
              <Button text="Login" className="btn btn-login" to="/login" />
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
