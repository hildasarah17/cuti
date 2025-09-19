import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/twofactor.css";

export default function TwoFactorPage() {
  const navigate = useNavigate();

  const handleEnable = () => {
    navigate("/twofactor/form");
  };

  return (
    <div className="twofactor-container">
      {/* Back arrow */}
      <button className="back-button" onClick={() => window.history.back()}>
        <ArrowLeft size={22} />
      </button>

      {/* Content box */}
      <div className="content-box">
        <h1 className="title">Verifikasi Dua Langkah</h1>
        <p className="description">
          Untuk keamanan tambahan akun anda, anda diharuskan menyalakan verifikasi dua langkah. 
          Anda dapat mengatur jawaban berdasarkan pertanyaan yang sudah disediakan, 
          verifikasi dua langkah tersebut digunakan verifikasi diri ketika anda lupa password
        </p>

        <button className="btn-enable" onClick={handleEnable}>
          Nyalakan
        </button>
      </div>
    </div>
  );
}