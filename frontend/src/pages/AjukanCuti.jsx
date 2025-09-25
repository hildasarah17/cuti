import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaUser,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";

import UserDropdown from "../components/UserDropDown.jsx";

import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

import "../styles/AjukanCuti.css";

export default function AjukanCuti() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [idKaryawan] = useState(localStorage.getItem("id_karyawan") || "");
  const [nama, setNama] = useState("");
  const [divisi, setDivisi] = useState("");

  const [jenisCuti, setJenisCuti] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idKaryawan) return;
    // fetch profile
    fetch("http://localhost:8000/cuti/me", {
      headers: { "X-Id-Karyawan": idKaryawan },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.karyawan) {
          setNama(d.karyawan.nama);
          setDivisi(d.karyawan.divisi);
        }
      })
      .catch((e) => {
        console.error("Error fetch profile:", e);
      });
  }, [idKaryawan]);

  // hitung via backend agar konsisten
  const calculateDaysBackend = async (start, end) => {
    if (!start || !end) {
      setJumlah(0);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:8000/cuti/hitung", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Id-Karyawan": idKaryawan,
        },
        body: JSON.stringify({
          tanggal_mulai: start,
          tanggal_akhir: end,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.status === "success") {
        setJumlah(data.jumlah);
      } else {
        setJumlah(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // onchange tanggal -> hitung backend
  const onStartChange = (e) => {
    const s = e.target.value;
    setStartDate(s);
    calculateDaysBackend(s, endDate);
  };
  const onEndChange = (e) => {
    const en = e.target.value;
    setEndDate(en);
    calculateDaysBackend(startDate, en);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!jenisCuti) { setError("Pilih jenis cuti"); return; }
    if (!startDate || !endDate) { setError("Isi tanggal mulai & selesai"); return; }
    if (jumlah <= 0) { setError("Jumlah hari cuti harus > 0"); return; }

    try {
      const resp = await fetch("http://localhost:8000/cuti/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Id-Karyawan": idKaryawan,
        },
        body: JSON.stringify({
          id_jenis_cuti: parseInt(jenisCuti),
          tanggal_mulai: startDate,
          tanggal_akhir: endDate,
          keterangan,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.detail || "Gagal mengajukan cuti");
        return;
      }
      alert("Pengajuan cuti berhasil. ID: " + data.data.id_cuti);
      // redirect ke Data Cuti atau reset form
      navigate("/data-cuti");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="ajukan-cuti-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img src={Logo} alt="logo" />
        </div>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/"><FaHome /> Beranda</Link>
          </li>
          <li className={location.pathname === "/persetujuan-cuti" ? "active" : ""}>
            <Link to="/persetujuan-cuti"><FaClipboardList /> Persetujuan Cuti</Link>
          </li>
          <li className={location.pathname === "/profile" ? "active" : ""}>
            <Link to="/profile"><FaUser /> Profile</Link>
          </li>
          <li className={location.pathname === "/data-cuti" ? "active" : ""}>
            <Link to="/data-cuti"><FaClipboardList /> Data Cuti Karyawan</Link>
          </li>
          <li className={location.pathname === "/ajukan-cuti" ? "active" : ""}>
            <Link to="/ajukan-cuti"><FaPaperPlane /> Ajukan Cuti</Link>
          </li>
        </ul>
      </aside>

      {/* Content */}
      <main className="content">
        <div className="content-inner">
          <header className="header">
            <h2>PT Cyber Blitz Nusantara</h2>
            <div className="header-right">
              <FaBell className="notif-icon" />
              <div
                className="user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img src={UserAvatar} alt="user" />
                <span>Approval</span>
              </div>
              {showDropdown && <UserDropdown />}
            </div>
          </header>

          {/* Form Ajukan Cuti */}
          <div className="form-wrapper">
            <h3>Ajukan Cuti</h3>
            <div className="form-card">
              <h4>Form Pengajuan Cuti</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>ID Karyawan</label>
                    <p>{idKaryawan || "-"}</p>
                  </div>
                  <div className="form-group">
                    <label>Nama Karyawan</label>
                    <p>{nama || "-"}</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Divisi</label>
                    <p>{divisi || "-"}</p>
                  </div>
                  <div className="form-group">
                    <label>Jenis Cuti</label>
                    <select
                      value={jenisCuti}
                      onChange={(e) => setJenisCuti(e.target.value)}
                      name="jenis_cuti"
                      id="jenis_cuti"
                    >
                      <option value="">--- Pilih Jenis Cuti ---</option>
                      <option value="1">Cuti Tahunan</option>
                      <option value="2">Cuti Sakit</option>
                      <option value="3">Cuti Melahirkan</option>
                      <option value="4">Cuti Menikah</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={onStartChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Selesai</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={onEndChange}
                    />
                  </div>
                  <div className="form-group small">
                    <label>Jumlah</label>
                    <input type="number" value={jumlah} readOnly />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group full">
                    <label>Keterangan</label>
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      name="keterangan"
                      id="keterangan"
                    />                  
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel">Batal</button>
                  <button type="submit" className="btn-submit">Kirim</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}