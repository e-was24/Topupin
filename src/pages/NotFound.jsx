import React from "react";
import { Link } from "react-router-dom";
import "./pages-style.css";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="svg-wrapper">
          {/* Ilustrasi SVG 404 */}
          <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#f0f0f0"
              d="M100,200 Q150,100 200,200 T300,200"
              stroke="#6C63FF"
              strokeWidth="2"
              className="floating-path"
            />
            <circle cx="300" cy="150" r="80" fill="#6C63FF" opacity="0.1" />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".3em"
              className="notfound-text"
            >
              404
            </text>
          </svg>
        </div>

        <h1>Halaman Hilang di Angkasa</h1>
        <p>
          Sepertinya tautan yang Anda ikuti sudah tidak ada atau berpindah ke
          dimensi lain.
        </p>

        <Link to="/" className="home-button">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
