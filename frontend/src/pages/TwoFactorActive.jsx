import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/twofactor.css";

export default function TwoFactorActive({ onVerify }) {
  const navigate = useNavigate();

  useEffect(() => {
    // otomatis set verified ketika sampai sini
    if (onVerify) {
      onVerify();
    }
  }, [onVerify]);

  const handleDisable = () => {
    navigate("/twofactor"); // balik ke halaman nyalakan
  };

  return (
    <div className="twofactor-container">
      {/* Panah ke beranda */}
      <button className="back-button" onClick={() => navigate("/beranda")}>
        <ArrowLeft size={22} />
      </button>

      <div className="content-box">
        <h1 className="title">Verifikasi Dua Langkah</h1>
        <p className="description">
          Verifikasi dua langkah dinyalakan, akun anda sudah dilindungi dengan
          keamanan tambahan. Anda dapat menggunakan verifikasi ini untuk
          mengidentifikasi diri saat lupa password.
        </p>

        <button className="btn-disable" onClick={handleDisable}>
          Matikan
        </button>
      </div>
    </div>
  );
}
