import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaPaperPlane,
  FaUser,
  FaBell,
  FaSearch,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import "../styles/DataCuti.css";

import UserDropdown from "../components/UserDropDown.jsx";
import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

export default function DataCuti() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ data dummy cuti
  const dataCuti = Array.from({ length: 706 }, (_, i) => ({
    id: `ID-${i + 1}`,
    idKaryawan: `K-${1000 + i}`,
    nama: `Karyawan ${i + 1}`,
    mulai: "01-08-2025",
    selesai: "05-08-2025",
    jumlah: "5 Hari",
    jenis: "Cuti Tahunan",
    status: i % 3 === 0 ? "Menunggu" : i % 3 === 1 ? "Disetujui" : "Ditolak",
    ket: "Keterangan contoh",
  }));

  // ✅ Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(dataCuti.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = dataCuti.slice(startIndex, endIndex);

  // ✅ generate tahun (5 tahun terakhir)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // ✅ daftar bulan
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="dashboard">
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

      {/* Main Content */}
      <main className="content">
        {/* Header */}
        <header className="header">
          <h2>PT Cyber Blitz Nusantara</h2>
          <div className="header-right">
            <Link to="/notifikasi">
              <FaBell className="notif-icon" />
            </Link>
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

        {/* Content */}
        <div className="main-content">
          <h3>Data Cuti Karyawan</h3>

          {/* Search & Filter */}
          <div className="filter-bar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Cari Data Karyawan" />
            </div>
            <div className="filters">
              <select>
                <option disabled selected>Pilih Tahun</option>
                {years.map((year, idx) => (
                  <option key={idx}>{year}</option>
                ))}
              </select>
              <select>
                <option disabled selected>Pilih Bulan</option>
                {months.map((month, idx) => (
                  <option key={idx}>{month}</option>
                ))}
              </select>
              <select>
                <option disabled selected>Pilih Status</option>
                <option>Menunggu</option>
                <option>Disetujui</option>
                <option>Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="approval-table">
            <table>
              <thead>
                <tr>
                  <th>ID Cuti</th>
                  <th>ID Karyawan</th>
                  <th>Nama Karyawan</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th>Jumlah</th>
                  <th>Jenis Cuti</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.id}</td>
                    <td>{row.idKaryawan}</td>
                    <td>{row.nama}</td>
                    <td>{row.mulai}</td>
                    <td>{row.selesai}</td>
                    <td>{row.jumlah}</td>
                    <td>{row.jenis}</td>
                    <td>{row.status}</td>
                    <td>{row.ket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="rows-per-page">
              Rows per page:{" "}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="page-info">
              {startIndex + 1}-{Math.min(endIndex, dataCuti.length)} of {dataCuti.length}
            </div>

            <div className="page-controls">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <FaAngleDoubleLeft />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <FaAngleLeft />
              </button>
              <span>Halaman {currentPage} dari {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                <FaAngleRight />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="export-buttons">
            <button className="btn-export excel">Cetak Excel</button>
            <button className="btn-export pdf">Cetak PDF</button>
          </div>
        </div>
      </main>
    </div>
  );
}
