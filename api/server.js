import express from "express";
import cors from "cors";
import "dotenv/config";
import { createRequire } from "module";

// Solusi aman membaca JSON di lingkungan ES Modules Node.js
const require = createRequire(import.meta.url);
const products = require("./src/data/digiflazzProduct.json");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Pakasir dari Environment Variables Vercel / .env lokal
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;

// Endpoint Pembuatan Tagihan (Invoice)
app.post("/api/pembayaran", async (req, res) => {
  const { amount, email, game_id, method } = req.body;

  // 1. Validasi Input Lengkap
  if (!amount || !method) {
    return res.status(400).json({
      success: false,
      message: "Data input (amount atau method) tidak lengkap.",
    });
  }

  if (!PAKASIR_API_KEY || !PAKASIR_PROJECT) {
    return res.status(500).json({
      success: false,
      message: "Konfigurasi server salah: PAKASIR_PROJECT atau PAKASIR_API_KEY tidak terbaca di Vercel.",
    });
  }

  try {
    const payload = {
      project: PAKASIR_PROJECT,
      api_key: PAKASIR_API_KEY,
      order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: Number(amount),
      redirect_url: process.env.REDIRECT_URL || "https://website-kamu.com/selesai",
    };

    console.log("Mengirim payload ke Pakasir:", payload); // Log untuk debugging di Vercel

    const response = await fetch(`https://pakasir.com/api/payment/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json" // Tambahkan header ini
      },
      body: JSON.stringify(payload),
    });

    // Cek jika response status dari Pakasir bukan 2xx
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error dari API Pakasir (Status ${response.status}):`, errorText);
      return res.status(response.status).json({
        success: false,
        message: `Pakasir merespon dengan status ${response.status}`,
        detail: errorText
      });
    }

    const result = await response.json();

    if (result && (result.payment_url || result.url)) {
      return res.json({
        success: true,
        checkout_url: result.payment_url || result.url,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message || "Gagal mendapatkan URL pembayaran dari Pakasir",
      });
    }
  } catch (err) {
    // Menangkap jika network error / website Pakasir down
    console.error("Error fatal pada Create Invoice:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan koneksi internal server.",
      error: err.message 
    });
  }
});
/**
 * Endpoint Webhook Callback Pakasir
 */
app.post("/webhook/pakkasir", async (req, res) => {
  const data = req.body;

  if (data && data.status === "completed") {
    console.log(`✅ PEMBAYARAN LUNAS: ${data.order_id}`);
    try {
      // Tempat peletakan logika integrasi API suplier otomatis (API Digiflazz Anda)
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Gagal memproses pengiriman produk:", error);
      return res.status(500).send("Internal Error");
    }
  }

  console.log(`⚠️ Status transaksi ${data.order_id}: ${data.status}`);
  res.status(200).send("Notification Received");
});

// Jalankan server lokal jika di lingkungan development
if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Lokal server backend aktif di: http://localhost:${PORT}`)
  );
}

// Ekspor default khusus kebutuhan deployment arsitektur Vercel Serverless
export default app;