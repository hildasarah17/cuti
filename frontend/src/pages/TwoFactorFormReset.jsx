// src/pages/TwoFactorFormReset.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/twofactorformreset.css";

export default function TwoFactorFormReset() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    navigate("/resetpassword");
  };

  return (
    <div className="twofactorreset-wrapper">
      <div className="form-container">
        {/* Tombol kembali */}
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="title">Verifikasi Dua Langkah</h1>
        <p className="description">
          Untuk keamanan tambahan akun Anda, sebelum mengganti password dengan
          yang baru, anda harus verifikasi diri anda terlebih dahulu dengan
          menjawab beberapa pertanyaan berikut
        </p>

        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>1. Siapa nama hewan peliharaan pertama Anda?</label>
            <input type="text" required />
          </div>
          <div className="form-group">
            <label>2. Apa nama sekolah dasar Anda?</label>
            <input type="text" required />
          </div>
          <div className="form-group">
            <label>3. Di kota mana ibu Anda lahir?</label>
            <input type="text" required />
          </div>

          <div className="button-container">
            <button type="submit" className="btn-save">
              Lanjutkan
            </button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Apakah anda yakin ingin menyimpan jawaban anda saat ini?</p>
            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button className="btn-confirm" onClick={handleConfirm}>
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
