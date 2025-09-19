import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaUser,
  FaClipboardList,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../styles/ApprovalPage.css";

// ✅ Import komponen dropdown
import UserDropdown from "../components/UserDropDown.jsx";

// ✅ Import asset lokal
import Logo from "../assets/logo_blitz.png";
import TravelImg from "../assets/travel.png";
import UserAvatar from "../assets/user1.png";

const dataBar = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 25 },
  { name: "Mar", value: 15 },
  { name: "Apr", value: 30 },
  { name: "May", value: 18 },
  { name: "Jun", value: 22 },
  { name: "Jul", value: 28 },
  { name: "Aug", value: 40 },
  { name: "Sep", value: 25 },
  { name: "Oct", value: 30 },
  { name: "Nov", value: 18 },
  { name: "Dec", value: 12 },
];

const dataPie = [
  { name: "Finance", value: 30 },
  { name: "Marketing", value: 20 },
  { name: "IT", value: 15 },
  { name: "Others", value: 35 },
];

const COLORS = ["#FFBB28", "#8884d8", "#FF8042", "#00C49F"];

export default function BerandaApproval() {
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
            {/* 🔔 Lonceng */}
            <Link to="/notifikasi">
              <FaBell className="notif-icon" />
            </Link>

            {/* 👤 Avatar + Nama Approval jadi tombol */}
            <div
              className="user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img src={UserAvatar} alt="user" />
              <span>Approval</span>
            </div>

            {/* Dropdown */}
            {showDropdown && <UserDropdown />}
          </div>
        </header>

        {/* Main Body */}
        <div className="main-content">
          {/* Greeting Section */}
          <div className="greeting-section">
            <div className="greeting">
              <img src={TravelImg} alt="travel" />
              <div>
                <h3>Halo Approval 👋</h3>
                <p>
                  Cek dan proses pengajuan cuti karyawan di sini.
                  Pastikan keputusanmu bantu jaga ritme kerja tim!
                </p>
              </div>
            </div>

            <div className="total-card">
              <p>Total</p>
              <h2>50</h2>
              <span>Pengajuan Cuti</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="card yellow">
              <FaInfoCircle />
              <div>
                <p>Diproses</p>
                <h2>55</h2>
              </div>
            </div>
            <div className="card green">
              <FaCheckCircle />
              <div>
                <p>Disetujui</p>
                <h2>20</h2>
              </div>
            </div>
            <div className="card red">
              <FaTimesCircle />
              <div>
                <p>Ditolak</p>
                <h2>25</h2>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts">
            <div className="chartBox">
              <h4>Pengajuan Cuti Perbulan</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataBar}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chartBox">
              <h4>Pengajuan Cuti Per-Divisi</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {dataPie.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
