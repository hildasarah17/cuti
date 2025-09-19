import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [showDropdown, setShowDropdown] = useState(false);

  // state untuk tanggal dan jumlah
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jumlah, setJumlah] = useState(0);

  // fungsi hitung otomatis
  const calculateDays = (start, end) => {
    if (start && end) {
      const startObj = new Date(start);
      const endObj = new Date(end);
      if (endObj >= startObj) {
        const diff =
          Math.ceil((endObj - startObj) / (1000 * 60 * 60 * 24)) + 1;
        setJumlah(diff);
      } else {
        setJumlah(0);
      }
    } else {
      setJumlah(0);
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
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label>ID Karyawan</label>
                    <p>1002387651</p>
                  </div>
                  <div className="form-group">
                    <label>Nama Karyawan</label>
                    <p>Samsul Sodiqin</p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Divisi</label>
                    <p>Marketing</p>
                  </div>
                  <div className="form-group">
                    <label>Jenis Cuti</label>
                    <select>
                      <option>--- Pilih Jenis Cuti ---</option>
                      <option>Cuti Tahunan</option>
                      <option>Cuti Sakit</option>
                      <option>Cuti Melahirkan</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        calculateDays(e.target.value, endDate);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Selesai</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        calculateDays(startDate, e.target.value);
                      }}
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
                    <input type="text" />
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