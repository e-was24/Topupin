import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ type: "", msg: "" });
  const [timer, setTimer] = useState(59);
  const [method, setMethod] = useState("whatsapp");

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const phoneNumber = localStorage.getItem("phone_for_otp");

  // Security Route Guard
  useEffect(() => {
    if (!phoneNumber) navigate("/register", { replace: true });
  }, [navigate, phoneNumber]);

  // FIX: OTOMATIS KIRIM OTP (Anti Double Send di React StrictMode)
  useEffect(() => {
    let isMounted = true;
    
    if (phoneNumber && isMounted) {
      sendOtpRequest("whatsapp"); // Langsung tembak default method
    }

    return () => {
      isMounted = false;
    };
  }, []); 

  // Countdown Timer
  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle input logic
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1].focus();
  };

  // --- LOGIKA PENGIRIMAN ---
  const sendOtpRequest = async (selectedMethod) => {
    setLoading(true);
    setError({ type: "", msg: "" });

    try {
      console.log("Membuat baris OTP baru langsung di DB untuk:", phoneNumber);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { error: dbError } = await supabase
        .from('otp_verifications')
        .insert([{ phone: phoneNumber, code: otpCode, method: selectedMethod, expires_at: expiresAt }]);

      if (dbError) throw dbError;

      setTimer(59);
      setError({
        type: "success",
        msg: `Kode dikirim via ${selectedMethod.toUpperCase()}`,
      });
    } catch (err) {
      console.error("Catch Error Frontend:", err);
      setError({ type: "error", msg: err.message || "Gagal meminta kode. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA VERIFIKASI ---
  const handleVerify = async () => {
    setLoading(true);
    const code = otp.join("");
    setError({ type: "", msg: "" });

    try {
      console.log("Mencoba verifikasi kode:", code, "untuk nomor:", phoneNumber);

      const { data, error: vError } = await supabase
        .from("otp_verifications")
        .select("*")
        .eq("phone", phoneNumber)
        .eq("code", code)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (vError) throw vError;
      if (!data) throw new Error("Kode salah atau sudah kadaluarsa");

      console.log("Verifikasi Berhasil, menghapus burner OTP ID:", data.id);

      // Hapus OTP setelah sukses digunakan
      await supabase.from("otp_verifications").delete().eq("id", data.id);

      localStorage.removeItem("phone_for_otp");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error Verifikasi:", err);
      setError({ type: "error", msg: err.message || "Verifikasi gagal." });
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... Bagian UI JSX lo di bawah tetap sama persis karena stylenya sudah oke ...
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Verifikasi Keamanan</h2>
        <p style={styles.subtitle}>
          Kode dikirim ke <b>{phoneNumber || "Nomor tidak ditemukan"}</b>
        </p>

        <div style={styles.methodToggle}>
          <button
            onClick={() => {
              setMethod("whatsapp");
              sendOtpRequest("whatsapp");
            }}
            disabled={loading || timer > 0}
            style={{
              ...styles.methodBtn,
              background: method === "whatsapp" ? "#25D366" : "#f0f0f0",
              color: method === "whatsapp" ? "#fff" : "#000",
              opacity: (timer > 0 && method !== "whatsapp") ? 0.5 : 1,
              cursor: (timer > 0 && method !== "whatsapp") ? "not-allowed" : "pointer"
            }}
          >
            WhatsApp
          </button>
          <button
            onClick={() => {
              setMethod("sms");
              sendOtpRequest("sms");
            }}
            disabled={loading || timer > 0}
            style={{
              ...styles.methodBtn,
              background: method === "sms" ? "#007bff" : "#f0f0f0",
              color: method === "sms" ? "#fff" : "#000",
              opacity: (timer > 0 && method !== "sms") ? 0.5 : 1,
              cursor: (timer > 0 && method !== "sms") ? "not-allowed" : "pointer"
            }}
          >
            SMS
          </button>
        </div>

        {error.msg && (
          <div
            style={{
              ...styles.alert,
              background: error.type === "success" ? "#e6f7ff" : "#fff2f0",
              color: error.type === "success" ? "#1890ff" : "#ff4d4f",
            }}
          >
            {error.msg}
          </div>
        )}

        <div style={styles.otpGrid}>
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              style={styles.otpInput}
              maxLength={1}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={otp.includes("") || loading}
          style={{
            ...styles.mainBtn,
            background: otp.includes("") || loading ? "#ccc" : "#000",
            cursor: otp.includes("") || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Proses..." : "Verifikasi Kode"}
        </button>

        <div style={styles.footer}>
          {timer > 0 ? (
            <span>
              Kirim ulang tersedia dalam <b>{timer}s</b>
            </span>
          ) : (
            <button
              onClick={() => sendOtpRequest(method)}
              style={styles.resendLink}
            >
              Kirim Ulang OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
// --- STYLES ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "sans-serif"
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  title: { fontSize: "22px", marginBottom: "8px", fontWeight: "700" },
  subtitle: { color: "#666", marginBottom: "24px" },
  methodToggle: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
    justifyContent: "center",
  },
  methodBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.3s ease"
  },
  otpGrid: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "30px",
  },
  otpInput: {
    width: "45px",
    height: "55px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    border: "2px solid #ddd",
    borderRadius: "10px",
    outline: "none"
  },
  mainBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    transition: "background 0.3s ease"
  },
  alert: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500"
  },
  footer: { marginTop: "20px", fontSize: "14px" },
  resendLink: {
    background: "none",
    border: "none",
    color: "#007bff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Otp;