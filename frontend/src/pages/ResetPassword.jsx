// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/resetpassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Ambil id dari localStorage yang di-set di TwoFactorFormReset
  const [idKaryawan] = useState(localStorage.getItem("resetId") || "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idKaryawan) {
      setError("ID Karyawan tidak ditemukan. Silakan ulangi proses.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_karyawan: idKaryawan,
          password_baru: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Gagal reset password");
        return;
      }

      // Jika sukses
      setShowPopup(true);
      localStorage.removeItem("resetId"); // hapus biar aman
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
  };

  return (
    <div className="login-container">
      {/* Bagian kiri */}
      <aside className="login-left">
        <div className="left-inner">
          <h1 className="brand-title">PT Cybers Blitz Nusantara</h1>
          <p className="brand-sub">Jalanin Proyek, Nikmatin Hidup.</p>
        </div>
      </aside>

      {/* Bagian kanan (formulir) */}
      <div className="reset-right">
        <form className="reset-form" onSubmit={handleSubmit}>
          <h2 className="reset-title">Tetapkan sandi baru!</h2>
          <p className="reset-desc">
            Buat kata sandi baru. Pastikan kata sandi berbeda dari kata sandi
            sebelumnya demi keamanan.
          </p>

          {/* ID Karyawan (read-only biar user tahu ID nya) */}
          <div className="input-wrapper">
            <input
              type="text"
              value={idKaryawan}
              readOnly
            />
          </div>

          {/* Kata sandi baru */}
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi baru"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPassword ? (
              <EyeOff
                className="right-icon"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="right-icon"
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          {/* Konfirmasi kata sandi */}
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi kata sandi baru"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {showConfirmPassword ? (
              <EyeOff
                className="right-icon"
                onClick={() => setShowConfirmPassword(false)}
              />
            ) : (
              <Eye
                className="right-icon"
                onClick={() => setShowConfirmPassword(true)}
              />
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="reset-btn">
            Perbarui
          </button>
        </form>
      </div>

      {/* Popup Sukses */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="success-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a6eff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h2 className="popup-title">Berhasil</h2>
            <p className="popup-desc">
              Selamat! Kata sandi Anda telah diubah. Klik lanjutkan untuk masuk.
            </p>
            <button className="btn-continue" onClick={() => navigate("/")}>
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
