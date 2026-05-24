import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto"; // Gunakan module native untuk MD5

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Supabase Admin (Gunakan Service Role Key untuk bypass RLS jika perlu)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY,
);

// Membaca JSON dengan metode aman Serverless Vercel (Menghindari Crash)
const jsonPath = path.join(
  process.cwd(),
  "src",
  "data",
  "digiflazzProduct.json",
);
let products = [];

try {
  if (fs.existsSync(jsonPath)) {
    products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    console.log("✅ Data digiflazzProduct.json berhasil dimuat.");
  } else {
    console.warn(
      "⚠️ File digiflazzProduct.json tidak ditemukan di path:",
      jsonPath,
    );
  }
} catch (error) {
  console.error("❌ Gagal membaca atau memparsing JSON:", error.message);
}

// Konfigurasi Pakasir dari Environment Variables Vercel
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;

// Konfigurasi Digiflazz
const DIGIFLAZZ_USERNAME = process.env.VITE_DIGIFLAZZ_USERNAME;
const DIGIFLAZZ_API_KEY = process.env.VITE_DIGIFLAZZ_API_KEY;

// Endpoint Pembuatan Tagihan (Invoice)
app.post("/api/pembayaran", async (req, res) => {
  const { amount, email, game_id, method, product_name, product_sku } =
    req.body;

  // 1. Validasi Input Body dari Frontend
  if (!amount || !method || !game_id || !product_sku) {
    return res.status(400).json({
      success: false,
      message: "Data input tidak lengkap.",
    });
  }

  // 2. Proteksi Kebocoran / Ketiadaan Environment Variable di Vercel
  if (!PAKASIR_API_KEY || !PAKASIR_PROJECT) {
    return res.status(422).json({
      success: false,
      message:
        "Konfigurasi API Key atau Project Slug Pakasir belum diisi di Environment Variables Vercel.",
    });
  }

  try {
    const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simpan rincian transaksi ke Supabase
    const { error: dbError } = await supabase.from("transactions").insert([
      {
        order_id,
        user_email: email,
        product_sku: product_sku,
        product_name: product_name,
        amount: Number(amount),
        target_id: game_id,
        payment_method: method,
        status: "pending",
      },
    ]);

    if (dbError) {
      console.error("❌ Gagal menyimpan transaksi ke Supabase:", dbError);
      return res
        .status(500)
        .json({ success: false, message: "Gagal membuat order." });
    }

    // Gunakan Status Page sebagai redirect URL
    const BASE_URL =
      process.env.BASE_URL || "https://topupin-id-simple.vercel.app";
    const redirect_url = `${BASE_URL}/status-transaksi/${order_id}`;

    // Gunakan struktur Hosted Link Pakasir yang sudah terverifikasi (Status 200)
    const checkout_url = `https://app.pakasir.com/pay/${PAKASIR_PROJECT}/${Number(amount)}/?order_id=${order_id}&redirect=${redirect_url}`;

    console.log("✅ Hosted Payment Link Generated:", checkout_url);

    return res.json({
      success: true,
      checkout_url: checkout_url,
    });
  } catch (err) {
    // Penanganan apabila terjadi kegagalan jaringan/server pihak ketiga down
    return res.status(500).json({
      success: false,
      message: "Gagal terhubung ke API Pakasir (Network Error)",
      error: err.message,
    });
  }
});

/**
 * Endpoint Webhook Callback Pakasir (Dipanggil oleh server Pakasir secara berkala)
 */
app.post("/webhook/pakkasir", async (req, res) => {
  const data = req.body;

  // Pakasir biasanya mengirim payload: { order_id, amount, status, signature }
  if (data && data.status === "completed") {
    console.log(`✅ PEMBAYARAN LUNAS DITERIMA: ${data.order_id}`);

    try {
      // 1. Ambil data transaksi dari Supabase
      const { data: trx, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("order_id", data.order_id)
        .single();

      if (fetchError || !trx) {
        console.error("⚠️ Transaksi tidak ditemukan di DB:", data.order_id);
        return res.status(404).send("Transaction not found");
      }

      // Pastikan status belum diproses (idempotency)
      if (trx.status === "completed") {
        return res.status(200).send("Already processed");
      }

      // 2. Jalankan Top-up Otomatis via Digiflazz
      console.log(
        `🚀 Memproses Top-up Digiflazz untuk SKU: ${trx.product_sku}`,
      );

      const digiflazzSignature = crypto
        .createHash("md5")
        .update(`${DIGIFLAZZ_USERNAME}${DIGIFLAZZ_API_KEY}${trx.order_id}`)
        .digest("hex");

      const digiResponse = await fetch(
        "https://api.digiflazz.com/v1/transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: DIGIFLAZZ_USERNAME,
            buyer_sku_code: trx.product_sku,
            customer_no: trx.target_id,
            ref_id: trx.order_id,
            sign: digiflazzSignature,
          }),
        },
      );

      const digiResult = await digiResponse.json();
      console.log("📦 Respon Digiflazz:", JSON.stringify(digiResult));

      // 3. Update Status di Supabase
      const newStatus =
        digiResult.data &&
        (digiResult.data.status === "Success" ||
          digiResult.data.status === "Pending")
          ? "completed"
          : "failed";

      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: newStatus, raw_response: JSON.stringify(digiResult) })
        .eq("order_id", trx.order_id);

      if (updateError) {
        console.error("❌ Gagal update status transaksi:", updateError);
      }

      return res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Gagal memproses pengiriman produk:", error);
      return res.status(500).send("Internal Error");
    }
  }

  console.log(
    `⚠️ Status transaksi dari Pakasir ${data.order_id}: ${data.status}`,
  );
  res.status(200).send("Notification Received");
});

// Ekspor default agar dapat dibaca sebagai serverless function oleh handler Node.js Vercel
export default app;
