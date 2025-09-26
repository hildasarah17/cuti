import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/twofactor.css";

export default function TwoFactorActive({ onVerify }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (onVerify) {
      onVerify();
    }
    localStorage.setItem("twoFactorVerified", "true");
    navigate("/beranda");  // ⬅️ otomatis masuk dashboard sesuai role
  }, [onVerify, navigate]);

  const handleDisable = () => {
    localStorage.removeItem("twoFactorVerified");
    navigate("/twofactor");
  };

  return (
    <div className="twofactor-container">
      <button className="back-button" onClick={() => navigate("/beranda")}>
        <ArrowLeft size={22} />
      </button>

      <div className="content-box">
        <h1 className="title">Verifikasi Dua Langkah</h1>
        <p className="description">
          Verifikasi dua langkah dinyalakan, akun anda sudah dilindungi dengan
          keamanan tambahan.
        </p>

        <button className="btn-disable" onClick={handleDisable}>
          Matikan
        </button>
      </div>
    </div>
  );
}
