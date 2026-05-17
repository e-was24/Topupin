import Button from "../components/Button";
import "./pages-style.css";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const { formData, errors, isSubmitting, handleChange, sendData } =
    useRegister({
      username: "",
      email: "",
      password: "",
    });

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Tombol Register ditekan, mengirimkan data....", formData);

    try {
      // 3. KAMU HARUS MEMANGGIL FUNGSINYA DAN MENYIMPANNYA DI 'result'
      const result = await sendData();

      if (result.success) {
        alert("Success: " + result.msg);
        navigate("/login");
      } else {
        alert("Failed: " + result.msg);
      }
    } catch (error) {
      console.error("Error saat registrasi:", error);
      alert("Terjadi kesalahan sistem.");
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-wrapper">
          <div className="register-header">
            <h2>Register</h2>
          </div>
          <div className="register-body">
            <form action="" onSubmit={handleRegister}>
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
                  <p style={{ color: "red" }}>{errors.username}</p>
                )}
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
                {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
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
                  <p style={{ color: "red" }}>{errors.password}</p>
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
    </>
  );
}
export default Register;
