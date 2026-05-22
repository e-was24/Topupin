import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// 1. Deklarasikan Header CORS secara lengkap
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 2. JAWAB REQUEST OPTIONS DARI BROWSER LO DENGAN HTTP 200 OK (Kunci Sembuh CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Ambil data dari frontend React lo
    const { phone, method } = await req.json();

    console.log("[send-otp-v1] incoming payload:", { phone, method });

    if (!phone) throw new Error("Nomor HP kosong atau tidak terkirim!");

    // Generate 6 Digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Tembak API Fonnte menggunakan format JSON murni yang diminta sistem lo
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': '4GgWL1gjtdKgCQEfLWhu',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Fonnte sering lebih suka data dikirim dalam bentuk URLSearchParams daripada JSON
      body: new URLSearchParams({
        target: phone,
        message: `Kode OTP TopupinID lo adalah: ${otpCode}. Berlaku 5 menit ya!`
      }).toString()
    })

    const resData = await response.json()

    // Kembalikan respon sukses ke Frontend React lo
    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // JIKA TERJADI EROR, TETAP KIRIM CORS HEADERS BIAR TIDAK DIBLOKIR BROWSER
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})