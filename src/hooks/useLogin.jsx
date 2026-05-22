import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useLogin = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const login = async () => {
    setIsSubmitting(true);
    try {
      const { identifier, password } = formData;
      let emailForAuth = identifier;

      // Jika identifier bukan email, cari email dari username
      if (!identifier.includes("@")) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("username", identifier)
          .single();

        if (userError || !userData) throw new Error("Username tidak ditemukan");
        emailForAuth = userData.email;
      }

      // Login ke Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password: password,
      });

      if (authError) {
        // Tangani error email belum dikonfirmasi secara spesifik
        if (authError.message.toLowerCase().includes("confirmed") || authError.message.toLowerCase().includes("verification")) {
          return {
            success: false,
            emailNotConfirmed: true,
            email: emailForAuth,
            msg: "Email kamu belum dikonfirmasi. Silakan masukkan kode OTP untuk memverifikasi akun Anda.",
          };
        }
        throw authError;
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, msg: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kirim ulang kode OTP/verifikasi
  const resendVerification = async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    if (error) return { success: false, msg: error.message };
    return { success: true, msg: "Kode verifikasi baru telah dikirim ke email Anda." };
  };

  return { formData, handleChange, login, isSubmitting, resendVerification };
};
