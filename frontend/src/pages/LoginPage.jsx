import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function LoginPage({ onLogin }) {
  const [idKaryawan, setIdKaryawan] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // reset error

    // ✅ Validasi ID Karyawan
    if (!idKaryawan && !password) {
      setErrorMessage("⚠️ Mohon isi ID Karyawan dan Password");
      return;
    } else if (!idKaryawan) {
      setErrorMessage("⚠️ ID Karyawan wajib diisi");
      return;
    } else if (!/^[0-9]+$/.test(idKaryawan)) {
      setErrorMessage("⚠️ ID Karyawan hanya boleh angka");
      return;
    } else if (idKaryawan.length > 10) {
      setErrorMessage("⚠️ ID Karyawan maksimal 10 digit");
      return;
    }

    // ✅ Validasi Password
    if (!password) {
      setErrorMessage("⚠️ Password wajib diisi");
      return;
    } else if (password.length < 8) {
      setErrorMessage("⚠️ Password minimal 8 karakter");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_karyawan: parseInt(idKaryawan),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage("❌ Login gagal: " + (data.detail || "Terjadi kesalahan"));
        return;
      }

      console.log("Login sukses:", data);

      // Simpan id_karyawan & login status
      localStorage.setItem("id_karyawan", data.user.id_karyawan);
      localStorage.setItem("isLoggedIn", "true");

      if (onLogin) onLogin();

      // 🔑 Ikuti instruksi backend
      if (data.next_step === "dashboard") {
        localStorage.setItem("twoFactorVerified", "true");
        navigate("/beranda");
      } else if (data.next_step === "2fa") {
        localStorage.removeItem("twoFactorVerified");
        navigate("/twofactor/form");
      }

    } catch (err) {
      console.error("Error koneksi:", err);
      setErrorMessage("🚨 Terjadi kesalahan koneksi ke server");
    }
  };

  const togglePassword = (e) => {
    e.preventDefault();
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-container">
      <aside className="login-left">
        <div className="left-inner">
          <h1 className="brand-title">PT Cybers Blitz Nusantara</h1>
          <p className="brand-sub">Jalanin Proyek, Nikmatin Hidup.</p>
        </div>
      </aside>

      <main className="login-right">
        <div className="right-inner">
          <div className="login-box">
            <h2 className="hello-title">Halooo!</h2>
            <p className="hello-sub">Selamat Datang Kembali</p>

            <form onSubmit={handleLogin} className="form">
              {/* Input ID */}
              <label className="input-wrap">
                <input
                  className="text-input"
                  type="text"
                  placeholder="ID Karyawan"
                  value={idKaryawan}
                  onChange={(e) => setIdKaryawan(e.target.value)}
                  maxLength={10} // biar user ga bisa lebih dari 10 digit
                />
                <Mail className="input-icon" size={18} />
              </label>

              {/* Input Password */}
              <label className="input-wrap">
                <input
                  className="text-input"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="input-icon lock-icon" size={18} />
                <button
                  className="icon-button"
                  onClick={togglePassword}
                  aria-label="toggle password"
                  type="button"
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>

              {/* Feedback Error */}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              {/* Tombol Login */}
              <button type="submit" className="btn-login">
                Masuk
              </button>

              {/* Link Lupa Password */}
              <button
                type="button"
                className="forgot"
                onClick={() => navigate("/twofactor/reset")}
              >
                Lupa password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
