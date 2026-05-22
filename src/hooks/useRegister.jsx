import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useRegister = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Bersihkan nomor telepon hanya angka jika name adalah phone_number
    let cleanValue = name === "phone_number" ? value.replace(/\D/g, "") : value;

    // OTOMATIS FORMAT KE INDONESIA (Contoh: 0812 -> 62812)
    if (name === "phone_number" && cleanValue.startsWith("0")) {
      cleanValue = "62" + cleanValue.slice(1);
    }

    setFormData({ ...formData, [name]: cleanValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.username.trim()) tempErrors.username = "Username wajib diisi";
    if (!formData.full_name.trim()) tempErrors.full_name = "Nama lengkap wajib diisi";
    if (!formData.email || !formData.email.includes("@")) tempErrors.email = "Email tidak valid";
    if (formData.password.length < 6) tempErrors.password = "Password minimal 6 karakter";
    if (!formData.phone_number || formData.phone_number.length < 10) {
      tempErrors.phone_number = "Nomor telepon tidak valid";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

const sendData = async () => {
    if (!validate())
      return { success: false, msg: "Tolong perbaiki kesalahan input." };

    setIsSubmitting(true);
    
    // --- TAMBAHAN LOG DEBUG ---
    console.group("DEBUG: Proses Registrasi");
    console.log("Data Form:", formData);
    console.log("Format Nomor HP (62xx...):", formData.phone_number);
    console.groupEnd();
    // --------------------------

    try {
      // 1. Daftarkan ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
          },
        },
      });

      if (authError) throw authError;

      // 2. Simpan profil ke tabel public.users
      if (authData?.user) {
        const userData = {
            id: authData.user.id,
            username: formData.username,
            email: formData.email,
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            password: formData.password,
            role: "user",
            balance: 0,
            status: "active",
        };

        console.log("DEBUG: Data yang akan di-insert ke tabel users:", userData);

        const { error: dbError } = await supabase.from("users").insert([userData]);

        if (dbError) {
            console.error("DEBUG: Error saat insert ke tabel users:", dbError);
            throw dbError;
        }

        // 3. TRIGGER OTP
        const payload = { phone: formData.phone_number, method: "whatsapp" };
        console.log("DEBUG: Mengirim payload ke Edge Function (send-otp-v1):", payload);

        await supabase.functions.invoke("send-otp-v1", {
          body: payload,
        });
      }

      return {
        success: true,
        email: formData.email,
        phone_number: formData.phone_number, 
        msg: "Registrasi berhasil!",
      };
    } catch (err) {
      console.error("DEBUG: Error di Catch Block useRegister:", err);
      return { success: false, msg: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, errors, isSubmitting, handleChange, sendData };
};