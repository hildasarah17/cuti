import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaPaperPlane, FaBell } from "react-icons/fa";
import "../styles/notifikasikaryawan.css";

import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";
import UserDropdown from "../components/UserDropDown.jsx";

export default function Notifikasi() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  // dummy data notifikasi
  const notifications = [
    {
      id: 1,
      status: "warning",
      title: "Pengajuan cuti ditolak",
      message:
        "Maaf, pengajuan cuti Anda telah ditolak. Silakan periksa komentar atau alasan penolakan di halaman pengajuan.",
      date: "25 Juli 2025, 10:23",
    },
    {
      id: 2,
      status: "success",
      title: "Pengajuan cuti diproses",
      message:
        "Pengajuan cuti Anda sedang dalam proses verifikasi oleh atasan. Mohon tunggu hingga proses selesai.",
      date: "15 Juli 2025, 18:00",
    },
    {
      id: 3,
      status: "danger",
      title: "Pengajuan cuti ditolak",
      message:
        "Maaf, pengajuan cuti Anda telah ditolak. Silakan periksa komentar atau alasan penolakan di halaman pengajuan.",
      date: "15 Juli 2025, 16:23",
    },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <img src={Logo} alt="logo" />
        </div>
        <ul>
          <li className={location.pathname === "/beranda" ? "active" : ""}>
            <Link to="/beranda">
              <FaHome /> Beranda
            </Link>
          </li>
          <li className={location.pathname === "/ajukancuti" ? "active" : ""}>
            <Link to="/ajukancuti">
              <FaPaperPlane /> Ajukan Cuti
            </Link>
          </li>
          <li className={location.pathname === "/profil" ? "active" : ""}>
            <Link to="/profil">
              <FaUser /> Profil
            </Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">
        {/* Header */}
        <header className="header">
          <h2>PT Cyber Blitz Nusantara</h2>
          <div className="header-right">
            <FaBell className="notif-icon active" />
            <div
              className="user"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={UserAvatar} alt="user" />
              {showDropdown && <UserDropdown />}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="main-content">
          <h1 className="page-title">Pemberitahuan</h1>

          <div className="notif-container">
            {notifications.map((notif) => (
              <div key={notif.id} className={`notif-card ${notif.status}`}>
                <div className="notif-icon">
                  {notif.status === "success" && "✅"}
                  {notif.status === "danger" && "❌"}
                  {notif.status === "warning" && "⚠️"}
                </div>
                <div className="notif-body">
                  <h3>{notif.title}</h3>
                  <p>{notif.message}</p>
                </div>
                <div className="notif-date">{notif.date}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
