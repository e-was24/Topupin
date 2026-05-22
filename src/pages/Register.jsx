// Register.jsx
import React, { useState } from "react";
import Button from "../components/Button";
import "./pages-style.css";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { formData, errors, isSubmitting, handleChange, sendData } =
    useRegister({
      username: "",
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
    });

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    try {
      const result = await sendData();

      if (result.success) {
        // Simpan email dan nomor HP untuk kebutuhan halaman OTP
        localStorage.setItem("email_for_otp", result.email || formData.email);
        localStorage.setItem(
          "phone_for_otp",
          result.phone_number || formData.phone_number,
        ); // Tambahkan ini

        alert("Registrasi Berhasil! Silakan verifikasi nomor Anda.");
        navigate("/Login");
      } else {
        setServerError(result.msg);
      }
    } catch (error) {
      console.error("Error saat registrasi:", error);
      setServerError(
        "Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.",
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <h2>Register</h2>
        </div>
        <div className="register-body">
          {serverError && (
            <div style={styles.errorBox}>
              <p>{serverError}</p>
            </div>
          )}
          <form onSubmit={handleRegister}>
            <div className="register-form-group">
              <label htmlFor="full_name">Full Name</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name"
              />
              {errors.full_name && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {errors.full_name}
                </p>
              )}
            </div>
            <div className="register-form-group-cover">
              <div className="register-form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                />
                {errors.username && (
                  <p
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.username}
                  </p>
                )}
              </div>
              <div className="register-form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
                {errors.phone_number && (
                  <p
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {errors.phone_number}
                  </p>
                )}
              </div>
            </div>
            <div className="register-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@topupin.com"
              />
              {errors.email && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {errors.email}
                </p>
              )}
            </div>
            <div className="register-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
              {errors.password && (
                <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                  {errors.password}
                </p>
              )}
            </div>
            <div className="register-form-group">
              <Button
                type="submit"
                text={isSubmitting ? "Registering..." : "Register"}
                className="btn btn-register"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  errorBox: {
    backgroundColor: "#fff2f0",
    border: "1px solid #ffccc7",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "#ff4d4f",
    fontSize: "14px",
    textAlign: "center",
    animation: "fadeIn 0.3s ease-in-out",
  },
};
export default Register;
