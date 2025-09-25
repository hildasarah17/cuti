// src/pages/TwoFactorFormReset.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/twofactorformreset.css";

export default function TwoFactorFormReset() {
  const navigate = useNavigate();
  const [idKaryawan, setIdKaryawan] = useState(localStorage.getItem("forgotId") || "");
  const [jawaban1, setJawaban1] = useState("");
  const [jawaban2, setJawaban2] = useState("");
  const [jawaban3, setJawaban3] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!idKaryawan) {
        setError("ID Karyawan wajib diisi.");
        return;
      }

      const res = await fetch("http://localhost:8000/auth/forgot-password/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_karyawan: idKaryawan, jawaban1, jawaban2, jawaban3 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Verifikasi gagal");
        return;
      }

      const data = await res.json();
      localStorage.setItem("resetId", data.id_karyawan);

      navigate("/resetpassword");
    } catch (err) {
      setError("Terjadi kesalahan server");
    }
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
            <label>ID Karyawan</label>
            <input
              type="text"
              required
              value={idKaryawan}
              onChange={(e) => setIdKaryawan(e.target.value)}
            />
          </div>

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

          {error && <p className="error-message">{error}</p>}

          <div className="button-container">
            <button type="submit" className="btn-save">
              Lanjutkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
