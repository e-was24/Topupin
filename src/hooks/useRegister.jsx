import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useRegister = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.username) tempErrors.username = "Username is required";
    if (!formData.email || !formData.email.includes("@"))
      tempErrors.email = "Valid email is required";
    if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const sendData = async () => {
    if (!validate()) return { success: false, msg: "Please fix errors" };

    setIsSubmitting(true);
    try {
      // 1. Register ke Supabase Auth menggunakan password ASLI
      //    (Supabase Auth mengelola hashing-nya sendiri secara internal)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Handle kasus email confirmation aktif (authData.user bisa null)
      if (!authData.user) {
        return {
          success: true,
          msg: "Register berhasil! Silakan cek email kamu untuk verifikasi akun.",
        };
      }

      // 3. Simpan data tambahan ke tabel public.users
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          username: formData.username,
          email: formData.email,
          password: "", // placeholder jika kolom NOT NULL — auth asli di Supabase Auth
          full_name: formData.username,
          balance: 0,
          status: "active",
        },
      ]);

      if (dbError) {
        console.error("DB Insert Error:", dbError);
        throw new Error(dbError.message || JSON.stringify(dbError));
      }

      return {
        success: true,
        msg: "Register success! Please check your email for verification.",
      };
    } catch (err) {
      return { success: false, msg: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, errors, isSubmitting, handleChange, sendData };
};
