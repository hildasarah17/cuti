DataCuti.jsx
import React, { useState, useEffect } from "react";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


import UserDropdown from "../components/UserDropDown.jsx";
import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

export default function DataCuti() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // ===============================
  // State
  // ===============================
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataCuti, setDataCuti] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ===============================
  // Pagination
  // ===============================
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = dataCuti; // backend sudah kirim data per page

  // ===============================
  // Tahun & Bulan
  // ===============================
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  // ===============================
  // Fetch data
  // ===============================
  async function fetchData() {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("per_page", rowsPerPage);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedStatus) params.append("status", selectedStatus);

      const resp = await fetch("http://localhost:8000/cuti/list?${params.toString()}");
      const json = await resp.json();
      console.log("fetchData response:", json); // debug
      if (json.status === "success") {
        setDataCuti(json.data.items);
        setTotalRows(json.data.pagination.total);
      }
    } catch (error) {
      console.error("Gagal fetch data:", error);
    }
  }

  // fetch saat state berubah
  useEffect(() => {
    fetchData();
  }, [rowsPerPage, currentPage, selectedYear, selectedMonth, selectedStatus, searchTerm]);

  // ===============================
  // Fungsi export Excel
  // ===============================
  const exportToExcel = () => {
    if (!dataCuti.length) return;
    const wsData = dataCuti.map((row) => ({
      "ID Cuti": row.id_cuti,
      "ID Karyawan": row.id_karyawan,
      "Nama Karyawan": row.nama_karyawan,
      "Tanggal Mulai": row.tanggal_mulai,
      "Tanggal Selesai": row.tanggal_akhir,
      "Jumlah": row.jumlah,
      "Jenis Cuti": row.jenis_cuti,
      "Status": row.status,
      "Keterangan": row.keterangan,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "DataCuti");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), DataCuti.xlsx);
  };

  // ===============================
  // Fungsi export PDF
  // ===============================
const exportToPDF = () => {
  if (!dataCuti.length) return;
  const doc = new jsPDF();
  const tableColumn = ["ID Cuti","ID Karyawan","Nama Karyawan","Tanggal Mulai","Tanggal Selesai","Jumlah","Jenis Cuti","Status","Keterangan"];
  const tableRows = dataCuti.map(row => [
    row.id_cuti,
    row.id_karyawan,
    row.nama_karyawan,
    row.tanggal_mulai,
    row.tanggal_akhir,
    row.jumlah,
    row.jenis_cuti,
    row.status,
    row.keterangan
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
    margin: { top: 10 }
  });

  doc.save("DataCuti.pdf");
};


  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo"><img src={Logo} alt="logo" /></div>
        <ul>
          <li className={location.pathname === "/" ? "active" : ""}><Link to="/"><FaHome /> Beranda</Link></li>
          <li className={location.pathname === "/persetujuan-cuti" ? "active" : ""}><Link to="/persetujuan-cuti"><FaClipboardList /> Persetujuan Cuti</Link></li>
          <li className={location.pathname === "/profile" ? "active" : ""}><Link to="/profile"><FaUser /> Profile</Link></li>
          <li className={location.pathname === "/data-cuti" ? "active" : ""}><Link to="/data-cuti"><FaClipboardList /> Data Cuti Karyawan</Link></li>
          <li className={location.pathname === "/ajukan-cuti" ? "active" : ""}><Link to="/ajukan-cuti"><FaPaperPlane /> Ajukan Cuti</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="header">
          <h2>PT Cyber Blitz Nusantara</h2>
          <div className="header-right">
            <Link to="/notifikasi"><FaBell className="notif-icon" /></Link>
            <div className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
              <img src={UserAvatar} alt="user" /><span>Approval</span>
            </div>
            {showDropdown && <UserDropdown />}
          </div>
        </header>

        <div className="main-content">
          <h3>Data Cuti Karyawan</h3>

          {/* Search & Filter */}
          <div className="filter-bar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Cari Data Karyawan" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="" disabled>Pilih Tahun</option>
                {years.map((year, idx) => <option key={idx} value={year}>{year}</option>)}
              </select>

              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="" disabled>Pilih Bulan</option>
                {months.map((month, idx) => <option key={idx} value={idx+1}>{month}</option>)}
              </select>

              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="" disabled>Pilih Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
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
                    <td>{row.id_cuti}</td>
                    <td>{row.id_karyawan}</td>
                    <td>{row.nama_karyawan}</td>
                    <td>{row.tanggal_mulai}</td>
                    <td>{row.tanggal_akhir}</td>
                    <td>{row.jumlah}</td>
                    <td>{row.jenis_cuti}</td>
                    <td>{row.status}</td>
                    <td>{row.keterangan}</td>
                  </tr>
                ))}
                {currentData.length === 0 && (
                  <tr><td colSpan={9} style={{textAlign:"center"}}>Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="rows-per-page">
              Rows per page:{" "}
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="page-info">
              {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows}
            </div>

            <div className="page-controls">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><FaAngleDoubleLeft /></button>
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}><FaAngleLeft /></button>
              <span>Halaman {currentPage} dari {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><FaAngleRight /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><FaAngleDoubleRight /></button>
            </div>
          </div>

          {/* Buttons */}
          <div className="export-buttons">
            <button className="btn-export excel" onClick={exportToExcel}>Cetak Excel</button>
            <button className="btn-export pdf" onClick={exportToPDF}>Cetak PDF</button>
          </div>
        </div>
      </main>
    </div>
  );
}