// src/pages/TwoFactorForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; 
import "../styles/twofactorform.css";

export default function TwoFactorFormPage() {
  const navigate = useNavigate();
  const [jawaban1, setJawaban1] = useState("");
  const [jawaban2, setJawaban2] = useState("");
  const [jawaban3, setJawaban3] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true); // tampilkan modal
  };

  const handleConfirm = async () => {
    const id_karyawan = localStorage.getItem("id_karyawan");

    try {
      const response = await fetch("http://localhost:8000/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_karyawan: parseInt(id_karyawan),
          jawaban1,
          jawaban2,
          jawaban3,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Gagal simpan 2FA: " + data.detail);
        return;
      }

      alert("2FA berhasil disimpan!");
      setShowModal(false);
      navigate("/twofactor/active"); // pindah ke beranda
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi ke server");
    }
  };

  return (
    <div className="twofactor-form-wrapper">
      <div className="form-container">
        {/* Tombol kembali */}
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft size={28} />
        </button>

        <h1 className="title">Verifikasi Dua Langkah</h1>
        <p className="description">
          Untuk keamanan tambahan akun anda, nyalakan verifikasi dua langkah.
          Anda dapat mengatur jawaban berdasarkan pertanyaan yang sudah disediakan.
          Verifikasi langkah tersebut digunakan ketika anda lupa password.
        </p>

        <form className="form-box" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>1. Siapa nama hewan peliharaan pertama Anda?</label>
              <input
                type="text"
                required
                value={jawaban1}
                onChange={(e) => setJawaban1(e.target.value)}
              />
          </div>

          <div className="form-group">
            <label>2. Apa nama sekolah dasar Anda?</label>
              <input
                type="text"
                required
                value={jawaban2}
                onChange={(e) => setJawaban2(e.target.value)}
              />
          </div>

          <div className="form-group">
            <label>3. Di kota mana ibu Anda lahir?</label>
              <input
                type="text"
                required
                value={jawaban3}
                onChange={(e) => setJawaban3(e.target.value)}
              />
          </div>

          <div className="button-container">
            <button type="submit" className="btn-save">Simpan</button>
          </div>
        </form>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Apakah anda yakin ingin menyimpan jawaban anda saat ini?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn-confirm" onClick={handleConfirm}>Iya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}