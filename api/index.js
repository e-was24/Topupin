import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

// Membaca file JSON produk secara aman (Serverless safe)
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

// Konfigurasi Variabel Environment Vercel
const PAKASIR_PROJECT = process.env.PAKASIR_PROJECT_SLUG;
const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
const DIGIFLAZZ_USERNAME = process.env.VITE_DIGIFLAZZ_USERNAME;
const DIGIFLAZZ_API_KEY = process.env.VITE_DIGIFLAZZ_API_KEY;

/**
 * Endpoint Pembuatan Tagihan (Invoice) - Menggunakan Halaman Pilih Metode Pakasir
 */
app.post("/api/pembayaran", async (req, res) => {
  // Menerima data tanpa properti 'method'
  const { amount, email, game_id, product_name, product_sku } = req.body;

  // 1. Validasi Input Body
  if (!amount || !game_id || !product_sku) {
    return res.status(400).json({
      success: false,
      message:
        "Data input tidak lengkap. Pastikan SKU produk terkirim dari frontend.",
    });
  }

  // 2. Validasi Kesiapan API Key Backend
  if (!PAKASIR_API_KEY || !PAKASIR_PROJECT) {
    return res.status(422).json({
      success: false,
      message:
        "Konfigurasi API Key atau Project Slug Pakasir belum diisi di Environment Variables Vercel.",
    });
  }

  try {
    const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Simpan rincian transaksi ke Supabase dengan nilai default untuk payment_method
    const { error: dbError } = await supabase.from("transactions").insert([
      {
        order_id,
        user_email: email,
        product_sku: product_sku,
        product_name: product_name,
        amount: Number(amount),
        target_id: game_id,
        payment_method: "hosted_pakasir", // Ditandai 'hosted_pakasir' karena konsumen memilih di halaman Pakasir
        status: "pending",
      },
    ]);

    if (dbError) {
      console.error("❌ Detail Error Supabase:", dbError);
      return res.status(500).json({
        success: false,
        message: `Database Menolak: ${dbError.message}. Periksa kembali kecocokan kolom tabel Supabase Anda.`,
      });
    }

    // 4. Bangun URL Redirect Status & URL Pembayaran Pakasir
    const BASE_URL =
      process.env.BASE_URL || "https://topupin-id-simple.vercel.app";
    const redirect_url = encodeURIComponent(
      `${BASE_URL}/status-transaksi/${order_id}`,
    );

    // FORMAT BERSIH TANPA PARAMETER METODE: Memaksa Pakasir menampilkan semua opsi pembayarannya sendiri
    const checkout_url = `https://app.pakasir.com/pay/${PAKASIR_PROJECT}/${Number(amount)}/?order_id=${order_id}&redirect=${redirect_url}`;

    console.log("✅ Hosted Payment Link Generated:", checkout_url);

    return res.json({
      success: true,
      checkout_url: checkout_url,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal terhubung ke API Pakasir (Network Error)",
      error: err.message,
    });
  }
});

/**
 * Endpoint Webhook Callback Pakasir (Automated Fulfillment Digiflazz)
 */
app.post("/webhook/pakkasir", async (req, res) => {
  const data = req.body;

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

      // Idempotency check (mencegah proses ganda untuk order yang sama)
      if (trx.status === "completed") {
        return res.status(200).send("Already processed");
      }

      console.log(
        `🚀 Memproses Top-up Digiflazz untuk SKU: ${trx.product_sku}`,
      );

      // 2. Buat MD5 Signature untuk API Digiflazz
      const digiflazzSignature = crypto
        .createHash("md5")
        .update(`${DIGIFLAZZ_USERNAME}${DIGIFLAZZ_API_KEY}${trx.order_id}`)
        .digest("hex");

      // 3. Tembak API Digiflazz
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

      // 4. Update Status Akhir di Supabase berdasarkan respons Digiflazz
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

export default app;
