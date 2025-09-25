BerandaApproval.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaCheckCircle, FaTimesCircle, FaInfoCircle,
  FaUser, FaClipboardList, FaPaperPlane, FaBell,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import "../styles/ApprovalPage.css";
import UserDropdown from "../components/UserDropDown.jsx";
import Logo from "../assets/logo_blitz.png";
import TravelImg from "../assets/travel.png";
import UserAvatar from "../assets/user1.png";

const COLORS = ["#FFBB28", "#8884d8", "#FF8042", "#00C49F"];

export default function BerandaApproval() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const [nama, setNama] = useState("");
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ Diproses: 0, Disetujui: 0, Ditolak: 0 });
  const [dataBar, setDataBar] = useState([]);
  const [dataPie, setDataPie] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const idKaryawan = localStorage.getItem("id_karyawan"); // simpan waktu login
      const res = await fetch("http://localhost:8000/dashboard/", {
        headers: { "X-Id-Karyawan": idKaryawan },
      });
      const json = await res.json();
      if (json.status === "success") {
        setNama(json.data.nama);
        setTotal(json.data.total_all);
        setCounts(json.data.status_counts);
        setDataBar(json.data.data_bar);
        setDataPie(json.data.data_pie);
      }
    }
    fetchData();
  }, []);

  const handleFilterClick = (status) => {
    navigate("/data-cuti?status=${status}");
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
        <header className="header">
          <h2>PT Cyber Blitz Nusantara</h2>
          <div className="header-right">
            <Link to="/notifikasi"><FaBell className="notif-icon" /></Link>
            <div className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
              <img src={UserAvatar} alt="user" />
              <span>{nama || "Approval"}</span>
            </div>
            {showDropdown && <UserDropdown />}
          </div>
        </header>

        <div className="main-content">
          <div className="greeting-section">
            <div className="greeting">
              <img src={TravelImg} alt="travel" />
              <div>
                <h3>Halo {nama || "Approval"} 👋</h3>
                <p>
                  Cek dan proses pengajuan cuti karyawan di sini.
                  Pastikan keputusanmu bantu jaga ritme kerja tim!
                </p>
              </div>
            </div>
            <div className="total-card">
              <p>Total</p>
              <h2>{total}</h2>
              <span>Pengajuan Cuti</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="card yellow" onClick={() => handleFilterClick("Menunggu")}>
              <FaInfoCircle />
              <div><p>Diproses</p><h2>{counts.Diproses}</h2></div>
            </div>
            <div className="card green" onClick={() => handleFilterClick("Disetujui")}>
              <FaCheckCircle />
              <div><p>Disetujui</p><h2>{counts.Disetujui}</h2></div>
            </div>
            <div className="card red" onClick={() => handleFilterClick("Ditolak")}>
              <FaTimesCircle />
              <div><p>Ditolak</p><h2>{counts.Ditolak}</h2></div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts">
            <div className="chartBox">
              <h4>Pengajuan Cuti Perbulan</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dataBar}>
                  <XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chartBox">
              <h4>Pengajuan Cuti Per-Divisi</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={dataPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {dataPie.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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