import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";
import "../styles/BerandaKaryawan.css";

// component dropdown (pastikan file ada)
import UserDropdown from "../components/UserDropDown.jsx";

// asset lokal (pastikan path benar)
import Logo from "../assets/logo_blitz.png";
import TravelImg from "../assets/travel.png";
import UserAvatar from "../assets/user1.png";

export default function Beranda() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img src={Logo} alt="logo" />
        </div>
        <ul>
          <li className={location.pathname === "/beranda" ? "active" : ""}>
            <Link to="/berandakaryawan"><FaHome /> Beranda</Link>
          </li>
          <li className={location.pathname === "/ajukancuti" ? "active" : ""}>
            <Link to="/ajukancuti"><FaPaperPlane /> Ajukan Cuti</Link>
          </li>
          <li className={location.pathname === "/profil" ? "active" : ""}>
            <Link to="/profil"><FaUser /> Profil</Link>
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
              className="user"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={UserAvatar} alt="user" />
            </div>

            {showDropdown && <UserDropdown />}
          </div>
        </header>

        {/* Main Body */}
        <div className="main-content">
          {/* PAGE TITLE (di atas welcome card) */}
          <h1 className="page-title">Beranda</h1>

          {/* Greeting Section */}
          <div className="greeting-section">
            <div className="greeting">
              <img src={TravelImg} alt="travel" />
              <div>
                <h3>Halo Karyawan 👋</h3>
                <p>
                  Merasa lelah dengan rutinitas harian yang padat? Tidak ada salahnya
                  mengambil jeda sejenak untuk memulihkan energi dan menjaga keseimbangan
                  hidup. Ajukan cuti sekarang juga dengan mudah dan cepat melalui
                  dashboard ini!
                </p>
              </div>
            </div>

            <div className="total-card">
              <p>Total Cuti</p>
              <h2>5</h2>
              <span>Yang Diajukan</span>
            </div>
          </div>

          {/* SECTION TITLE (di luar table, sesuai permintaan) */}
          <h3 className="section-title">Data Cuti Saya</h3>

          {/* Table container */}
          <div className="approval-table">
            <table>
              <thead>
                <tr>
                  <th>ID Cuti</th>
                  <th>Jenis Cuti</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th>Jumlah</th>
                  <th>Keterangan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2998789287</td>
                  <td>Cuti Tahunan</td>
                  <td>01-08-2025</td>
                  <td>05-08-2025</td>
                  <td>5 Hari</td>
                  <td>Keperluan pribadi</td>
                  <td className="status-menunggu">Menunggu</td>
                </tr>
                <tr>
                  <td>9829038756</td>
                  <td>Cuti Sakit</td>
                  <td>03-08-2025</td>
                  <td>05-08-2025</td>
                  <td>3 Hari</td>
                  <td>Pemulihan sakit</td>
                  <td className="status-disetujui">Disetujui</td>
                </tr>
                <tr>
                  <td>8376732872</td>
                  <td>Cuti Bulanan</td>
                  <td>05-08-2025</td>
                  <td>15-08-2025</td>
                  <td>11 Hari</td>
                  <td>Izin rutin bulanan</td>
                  <td className="status-ditolak">Ditolak</td>
                </tr>
                <tr>
                  <td>2787653687</td>
                  <td>Cuti Sakit</td>
                  <td>07-08-2025</td>
                  <td>09-08-2025</td>
                  <td>3 Hari</td>
                  <td>Rawat inap</td>
                  <td className="status-disetujui">Disetujui</td>
                </tr>
                <tr>
                  <td>2781762786</td>
                  <td>Cuti Melahirkan</td>
                  <td>15-08-2025</td>
                  <td>20-08-2025</td>
                  <td>6 Hari</td>
                  <td>Pasca melahirkan</td>
                  <td className="status-disetujui">Disetujui</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
