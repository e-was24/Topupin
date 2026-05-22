import express from "express";
import cors from "cors";
import "dotenv/config";
// Jika server.js ingin mengambil data dari src/data/
const products = require("../src/data/digiflazzProduct.json");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Konfigurasi Pakasir dari Environment Variables Vercel
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;

app.post("/api/pembayaran", async (req, res) => {
  const { amount, email, game_id, method } = req.body;

  // Validasi input sederhana
  if (!amount || !method || !PAKASIR_API_KEY) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap atau API Key belum disetting di Vercel",
    });
  }

  try {
    // Menggunakan native fetch (Node.js 18+)
    const response = await fetch(`https://pakasir.com/api/payment/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: PAKASIR_PROJECT,
        api_key: PAKASIR_API_KEY,
        order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: amount,
        // Gunakan URL dinamis atau hardcoded untuk redirect setelah bayar
        redirect_url:
          process.env.REDIRECT_URL || "https://website-kamu.com/selesai",
      }),
    });

    const result = await response.json();

    if (result && (result.payment_url || result.url)) {
      res.json({
        success: true,
        checkout_url: result.payment_url || result.url,
      });
    } else {
      res.status(400).json({
        success: false,
        message:
          result.message || "Gagal mendapatkan URL pembayaran dari Pakasir",
      });
    }
  } catch (err) {
    console.error("Error Create Invoice:", err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan pada server" });
  }
});

/**
 * 2. ENDPOINT: WEBHOOK CALLBACK
 * URL Akses: https://domain-kamu.vercel.app/webhook/pakkasir
 */
app.post("/webhook/pakkasir", async (req, res) => {
  const data = req.body;

  // Cek status dari body request Pakasir
  if (data && data.status === "completed") {
    console.log(`✅ PEMBAYARAN LUNAS: ${data.order_id}`);

    try {
      // --- LOGIKA PENGIRIMAN DIAMOND DISINI ---
      // Contoh: await kirimDiamondKeSupplier(data.order_id, data.amount);

      // Kirim respon sukses ke Pakasir
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Gagal memproses pengiriman produk:", error);
      return res.status(500).send("Internal Error");
    }
  }

  // Jika status bukan completed, tetap beri respon agar tidak di-retry terus menerus
  console.log(`⚠️ Status transaksi ${data.order_id}: ${data.status}`);
  res.status(200).send("Notification Received");
});

// Jalankan server lokal jika bukan di Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Lokal server: http://localhost:${PORT}`),
  );
}

// WAJIB UNTUK VERCEL
export default app;
