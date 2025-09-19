import React, { useState } from "react"; 
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaClipboardList,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";

import "../styles/PersetujuanCuti.css";

// ✅ Import komponen dropdown
import UserDropdown from "../components/UserDropDown.jsx";

// ✅ Import asset lokal
import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

export default function PersetujuanCuti() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // State pop-up
  const [popup, setPopup] = useState({ visible: false, type: "" });

  // Dummy data cuti
  const dataCuti = [
    { idCuti: "892817289", idKaryawan: "211233432", nama: "Dadang", mulai: "01-08-2025", selesai: "05-08-2025", jumlah: "5 Hari", jenis: "Cuti Sakit", status: "Menunggu", ket: "Pemulihan sakit" },
    { idCuti: "372873283", idKaryawan: "223345345", nama: "Sarinah", mulai: "03-08-2025", selesai: "05-08-2025", jumlah: "3 Hari", jenis: "Cuti Melahirkan", status: "Menunggu", ket: "Persiapan persalinan" },
    { idCuti: "283728327", idKaryawan: "2114339056", nama: "Olivia Rodrigo", mulai: "05-08-2025", selesai: "15-08-2025", jumlah: "11 Hari", jenis: "Cuti Tahunan", status: "Menunggu", ket: "Keperluan pribadi" },
    { idCuti: "338287728", idKaryawan: "2668176545", nama: "Riko Budiman", mulai: "07-08-2025", selesai: "09-08-2025", jumlah: "3 Hari", jenis: "Cuti Sakit", status: "Menunggu", ket: "Pemulihan sakit" },
    { idCuti: "778372891", idKaryawan: "227878767", nama: "Natasha Wilona", mulai: "15-08-2025", selesai: "20-08-2025", jumlah: "6 Hari", jenis: "Cuti Melahirkan", status: "Menunggu", ket: "Rawat kandungan" },
  ];

  // Handler tombol
  const handleAction = (type) => {
    setPopup({ visible: true, type });
  };

  const confirmAction = () => {
    alert(`Cuti berhasil di${popup.type === "approve" ? "setujui" : "tolak"}.`);
    setPopup({ visible: false, type: "" });
  };

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
          <li className={location.pathname === "/approval" ? "active" : ""}>
            <Link to="/approval"><FaClipboardList /> Persetujuan Cuti</Link>
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

        {/* Main Body - Tabel Persetujuan */}
        <div className="main-content">
          <h3>Persetujuan Cuti</h3>

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
                  <th>Pilih</th>
                </tr>
              </thead>
              <tbody>
                {dataCuti.map((cuti, index) => (
                  <tr key={index}>
                    <td>{cuti.idCuti}</td>
                    <td>{cuti.idKaryawan}</td>
                    <td>{cuti.nama}</td>
                    <td>{cuti.mulai}</td>
                    <td>{cuti.selesai}</td>
                    <td>{cuti.jumlah}</td>
                    <td>{cuti.jenis}</td>
                    <td>{cuti.status}</td>
                    <td>{cuti.ket}</td>
                    <td>
                      <input type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Tombol Aksi */}
          <div className="actions">
            <button className="btn btn-reject" onClick={() => handleAction("reject")}>
              Tolak
            </button>
            <button className="btn btn-approve" onClick={() => handleAction("approve")}>
              Setuju
            </button>
          </div>
        </div>
      </main>

      {/* ✅ Pop-up konfirmasi */}
      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup">
            <p>
              Apakah Anda yakin ingin{" "}
              <strong>{popup.type === "approve" ? "MENYETUJUI" : "MENOLAK"}</strong>{" "}
              cuti ini?
            </p>
            <div className="popup-actions">
              <button className="btn btn-reject" onClick={() => setPopup({ visible: false, type: "" })}>
                Batal
              </button>
              <button className="btn btn-approve" onClick={confirmAction}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
