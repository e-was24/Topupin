import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import fs from "fs";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Membaca JSON dengan metode aman Serverless Vercel (Menghindari Crash)
const jsonPath = path.join(process.cwd(), "src", "data", "digiflazzProduct.json");
let products = [];

try {
  if (fs.existsSync(jsonPath)) {
    products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    console.log("✅ Data digiflazzProduct.json berhasil dimuat.");
  } else {
    console.warn("⚠️ File digiflazzProduct.json tidak ditemukan di path:", jsonPath);
  }
} catch (error) {
  console.error("❌ Gagal membaca atau memparsing JSON:", error.message);
}

// Konfigurasi Pakasir dari Environment Variables Vercel
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;

// Endpoint Pembuatan Tagihan (Invoice)
app.post("/api/pembayaran", async (req, res) => {
  const { amount, email, game_id, method } = req.body;

  // 1. Validasi Input Body dari Frontend
  if (!amount || !method) {
    return res.status(400).json({
      success: false,
      message: "Data input (amount atau method) tidak lengkap.",
    });
  }

  // 2. Proteksi Kebocoran / Ketiadaan Environment Variable di Vercel
  if (!PAKASIR_API_KEY || !PAKASIR_PROJECT) {
    return res.status(422).json({
      success: false,
      message: "Konfigurasi API Key atau Project Slug Pakasir belum diisi di Environment Variables Vercel.",
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

    // Integrasi HTTP Fetch ke Gateway Pakasir
    const response = await fetch(`https://pakasir.com/api/payment/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Pastikan status API pihak ketiga sukses dan mengembalikan URL transaksi
    if (response.ok && result && (result.payment_url || result.url)) {
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
    // Penanganan apabila terjadi kegagalan jaringan/server pihak ketiga down
    return res.status(500).json({ 
      success: false, 
      message: "Gagal terhubung ke API Pakasir (Network Error)",
      error: err.message 
    });
  }
});

/**
 * Endpoint Webhook Callback Pakasir (Dipanggil oleh server Pakasir secara berkala)
 */
app.post("/webhook/pakkasir", async (req, res) => {
  const data = req.body;
  
  if (data && data.status === "completed") {
    console.log(`✅ PEMBAYARAN LUNAS: ${data.order_id}`);
    try {
      // Jalankan logika penjualan otomatis (API Digiflazz Anda) di sini
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Gagal memproses pengiriman produk:", error);
      return res.status(500).send("Internal Error");
    }
  }

  console.log(`⚠️ Status transaksi ${data.order_id}: ${data.status}`);
  res.status(200).send("Notification Received");
});

// Ekspor default agar dapat dibaca sebagai serverless function oleh handler Node.js Vercel
export default app;