import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function StatusTransaksi() {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("order_id", order_id)
        .single();

      if (data) {
        setTransaction(data);
        if (data.status === "completed" || data.status === "failed") {
          setLoading(false);
        }
      } else {
        console.error("Order not found", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [order_id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#94a3b8";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Berhasil";
      case "failed":
        return "Gagal";
      case "pending":
        return "Menunggu Pembayaran / Proses";
      default:
        return "Memuat...";
    }
  };

  return (
    <div className="Dashboard-container" style={{ padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "15px",
          border: "1px solid #334155",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "25px" }}>Status Transaksi</h2>
        
        {transaction ? (
          <div style={{ textAlign: "left", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "15px", padding: "15px", background: "#0f172a", borderRadius: "10px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#94a3b8" }}>Order ID</p>
              <p style={{ margin: "5px 0", fontWeight: "bold", fontSize: "1.1rem" }}>{transaction.order_id}</p>
            </div>

            <div style={{ marginBottom: "15px", padding: "15px", background: "#0f172a", borderRadius: "10px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#94a3b8" }}>Produk</p>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>{transaction.product_name}</p>
            </div>

            <div style={{ marginBottom: "15px", padding: "15px", background: "#0f172a", borderRadius: "10px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#94a3b8" }}>Target ID</p>
              <p style={{ margin: "5px 0", fontWeight: "bold" }}>{transaction.target_id}</p>
            </div>

            <div style={{ marginBottom: "15px", padding: "15px", background: "#0f172a", borderRadius: "10px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#94a3b8" }}>Status</p>
              <p style={{ 
                margin: "5px 0", 
                fontWeight: "bold", 
                fontSize: "1.2rem",
                color: getStatusColor(transaction.status) 
              }}>
                {getStatusText(transaction.status)}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "20px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <div style={{ color: "#94a3b8" }}>
            <p>Memuat rincian transaksi...</p>
            <div className="page-loader-spinner" style={{ margin: "20px auto" }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusTransaksi;
