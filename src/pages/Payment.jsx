import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  if (!location.state || !location.state.product) {
    return (
      <div className="Dashboard-container">
        <h2 style={{ color: "white" }}>Data pembayaran tidak ditemukan.</h2>
        <button onClick={() => navigate("/dashboard")}>← Kembali</button>
      </div>
    );
  }

  const { product, gameId, userEmail } = location.state;

  const handleCheckout = async () => {
    if (!paymentMethod) return alert("Pilih metode pembayaran!");

    const methodMapping = {
      "QRIS (All E-Wallet)": "qris",
      "Gopay": "gopay",
      "DANA": "dana",
      "OVO / LinkAja": "ovo",
      "BCA Virtual Account": "bca_va",
    };

    setLoading(true);
    try {
      const response = await fetch("/api/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: methodMapping[paymentMethod],
          amount: product.price,
          email: userEmail,
          game_id: gameId,
          product_name: product.product_name,
        }),
      });

      // Ambil respon dalam bentuk JSON terlebih dahulu
      let result = {};
      try {
        result = await response.json();
      } catch (parseErr) {
        console.error("Gagal memparsing JSON:", parseErr);
      }

      if (!response.ok) {
        // Jika backend mengirimkan pesan error kustom, tampilkan di alert
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      if (result.success && result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan server"));
      }
    } catch (err) {
      console.error("Payment Error:", err);
      // Menampilkan pesan error asli yang ditangkap dari catch block
      alert(`Gagal memproses transaksi: ${err.message}`);
    } finally {
      setLoading(false);
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
    <div
      className="Dashboard-container"
      style={{ display: "flex", justifyContent: "center", padding: "20px" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#1e293b",
          borderRadius: "15px",
          padding: "30px",
          border: "1px solid #334155",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "20px" }}>
          Konfirmasi Pembayaran
        </h2>

        <div
          style={{
            background: "#0f172a",
            padding: "15px",
            borderRadius: "10px",
            color: "#e2e8f0",
            marginBottom: "20px",
          }}
        >
          <p>
            Produk: <strong>{product.product_name}</strong>
          </p>
          <p>
            Target ID: <strong>{gameId}</strong>
          </p>
          <p>
            Total:{" "}
            <strong style={{ color: "#10b981" }}>
              Rp {product.price?.toLocaleString("id-ID")}
            </strong>
          </p>
        </div>

        <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                background: paymentMethod === m ? "#3b82f6" : "#334155",
                color: "white",
                border: "none",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </div>
  );
}

export default Payment;
