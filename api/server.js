import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import fs from "fs";

// --- PERBAIKAN MEMBACA JSON AMAN DI VERCEL SERVERLESS ---
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
  console.error("❌ Gagal memparsing file JSON:", error.message);
  // Aplikasi tidak akan crash total, melainkan tetap berjalan dengan array kosong
}
// --------------------------------------------------------

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Pakasir dari Environment Variables Vercel
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
      message: "Konfigurasi server salah: PAKASIR_PROJECT_SLUG atau PAKASIR_API_KEY tidak terbaca di Vercel.",
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

    console.log("Mengirim payload ke Pakasir:", payload);

    const response = await fetch(`https://pakasir.com/api/payment/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

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

// Ekspor default untuk Vercel Serverless
export default app;