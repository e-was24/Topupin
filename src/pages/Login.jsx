import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import Button from "../components/Button";
import "./pages-style.css";

function Login() {
  const navigate = useNavigate();
  const { formData, handleChange, login, isSubmitting, resendVerification } =
    useLogin();

  // Jalur logika handleLogin di dalam komponen Login.jsx kamu:
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login();

    if (result.success) {
      alert("Login berhasil!");
      navigate("/dashboard", { replace: true });
    // } else if (result.emailNotConfirmed) {
    //   // Simpan email ke localStorage untuk kebutuhan OTP
    //   localStorage.setItem("email_for_otp", result.email);

    //   const resend = window.confirm(
    //     "Akun Anda belum diverifikasi.\n\nKlik OK jika Anda ingin kami mengirimkan kode verifikasi baru ke email Anda (" + result.email + ")."
    //   );

    //   if (resend) {
    //     const resendResult = await resendVerification(result.email);
    //     alert(resendResult.msg);
    //   }
      
    //   // Arahkan pengguna ke halaman OTP
    //   navigate("/otp", { replace: true });
    } else {
      alert("Gagal Login: " + result.msg);
    }
  };

  return (
    <div className="login-container">
      {/* Wrapper sebagai kartu utama */}
      <div className="login-wrapper">
        {/* Bagian Header */}
        <div className="login-header">
          <h2>Login</h2>
        </div>

        {/* Bagian Body Form */}
        <div className="login-body">
          <form onSubmit={handleLogin}>
            {/* Group Input Username/Email */}
            <div className="login-form-group">
              <label htmlFor="identifier">Email atau Username</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Email atau Username"
                required
              />
            </div>

            {/* Group Input Password */}
            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>

            {/* Tombol Login */}
            <div className="login-form-group">
              <Button
                type="submit"
                className="btn btn-login" // Pastikan class ini ada di CSS kamu
                disabled={isSubmitting}
                text={isSubmitting ? "Loading..." : "Login"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
