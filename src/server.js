import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint untuk buat transaksi
app.post("/api/pembayaran", async (req, res) => {
  const { amount, email, game_id } = req.body;

  try {
    const response = await fetch("https://pakkasir.id/api/v1/create-invoice", {
      method: "POST",
      headers: {
        // AMAN: Secret Key hanya ada di sisi server
        Authorization: `Bearer ${process.env.PAKKASIR_API_KEY || "SIMPAN_API_KEY_DISINI"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: "ORDER-" + Date.now(),
        amount: amount,
        payer_email: email,
        description: `Topup Game ID: ${game_id}`,
      }),
    });

    const result = await response.json();
    // Kirim balik URL pembayaran ke React
    res.json({ success: true, checkout_url: result.data.checkout_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint Webhook (Sesuai permintaanmu tadi)
app.post("/webhook/pakkasir", (req, res) => {
  const data = req.body;

  if (data.status === "PAID") {
    console.log("GAS! Pembayaran masuk. Kirim diamond ke:", data.external_id);
    // Panggil fungsi kirim diamond di sini
    res.status(200).send("OK");
  } else {
    res.status(400).send("Belum bayar");
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Server Backend lari di port 5000"));
}

export default app;
