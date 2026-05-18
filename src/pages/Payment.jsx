import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");

  // Protect route if someone enters the URL directly without selected states
  if (!location.state || !location.state.product) {
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Data pembayaran tidak ditemukan.</h2>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#3b82f6",
            color: "white",
            border: "none",
            fontWeight: "bold",
            marginTop: "20px",
          }}
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const { product, gameId, userEmail } = location.state;

  const handleCheckout = async () => {
    if (!paymentMethod)
      return alert("Pilih metode pembayaran terlebih dahulu!");

    try {
      const response = await fetch("/api/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: product.product_name,
          amount: product.price,
          email: userEmail,
          game_id: gameId,
          method: paymentMethod,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Arahkan user ke halaman pembayaran Pak Kasir
        window.location.href = result.checkout_url;
      } else {
        alert("Gagal membuat pesanan");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server backend kamu belum nyala!");
    }
  };

  const methods = [
    "QRIS (All E-Wallet)",
    "Gopay",
    "DANA",
    "OVO / LinkAja",
    "BCA Virtual Account",
  ];

  return (
    <div className="Dashboard-container">
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#1e293b",
          borderRadius: "15px",
          padding: "30px",
          border: "1px solid #334155",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            color: "white",
            marginTop: 0,
            borderBottom: "1px solid #334155",
            paddingBottom: "15px",
            marginBottom: "20px",
          }}
        >
          Detail Pembayaran
        </h1>

        {/* Rincian Transaksi */}
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "10px",
            color: "#e2e8f0",
            lineHeight: "2",
          }}
        >
          <p
            style={{
              margin: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#94a3b8" }}>Produk:</span>{" "}
            <strong>{product.product_name}</strong>
          </p>
          <p
            style={{
              margin: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#94a3b8" }}>Game ID:</span>{" "}
            <strong>{gameId}</strong>
          </p>
          <p
            style={{
              margin: 0,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#94a3b8" }}>Akun E-mail:</span>{" "}
            <strong>{userEmail}</strong>
          </p>
          <hr
            style={{
              borderColor: "#334155",
              borderTop: "none",
              margin: "15px 0",
            }}
          />
          <p
            style={{
              margin: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#94a3b8" }}>Nominal Bayar:</span>
            <span
              style={{
                color: "#10b981",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              Rp {product.price?.toLocaleString("id-ID")}
            </span>
          </p>
        </div>

        {/* Pilihan Metode Pembayaran */}
        <h3 style={{ color: "white", marginTop: "30px", marginBottom: "15px" }}>
          Pilih Metode Pembayaran
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          {methods.map((method) => (
            <div
              key={method}
              onClick={() => setPaymentMethod(method)}
              style={{
                border:
                  paymentMethod === method
                    ? "2px solid #3b82f6"
                    : "1px solid #475569",
                background:
                  paymentMethod === method
                    ? "rgba(59, 130, 246, 0.15)"
                    : "#0f172a",
                padding: "15px",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: "bold",
                transition: "all 0.2s",
                boxShadow:
                  paymentMethod === method
                    ? "0 0 10px rgba(59, 130, 246, 0.2)"
                    : "none",
              }}
            >
              {method}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1,
              padding: "15px",
              background: "#475569",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "1.05rem",
              fontWeight: "bold",
            }}
          >
            Batalkan
          </button>
          <button
            onClick={handleCheckout}
            style={{
              flex: 2,
              padding: "15px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "1.05rem",
              fontWeight: "bold",
            }}
          >
            Bayar Sekarang Sesuai Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
