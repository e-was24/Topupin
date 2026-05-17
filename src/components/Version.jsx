import React from "react";
import "./Version.css"; // Jika ingin memisahkan CSS-nya

function Version() {
  // Kamu bisa mengubah nomor versi dan tanggal di sini secara berkala
  const currentVersion = "v1.4.2";
  const lastUpdated = "Mei 2026";

  return (
    <footer className="version-footer">
      <div className="version-container">
        <p className="version-text">
          © {new Date().getFullYear()} Topupin . All rights reserved.
        </p>
        <div className="version-badge-wrapper">
          <span className="version-label">Beta Version:</span>
          <span className="version-badge">{currentVersion}</span>
          <span className="version-date">({lastUpdated})</span>
        </div>
      </div>
    </footer>
  );
}

// Latest Version

export default Version;
