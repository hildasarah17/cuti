PersetujuanCuti.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaClipboardList,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";

import "../styles/PersetujuanCuti.css";
import UserDropdown from "../components/UserDropDown.jsx";
import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

export default function PersetujuanCuti() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: "" });
  const [dataCuti, setDataCuti] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    loadPending();
  }, []);

  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
      // role & id karyawan diambil dari localStorage (sesuaikan aplikasi real dengan JWT)
      "X-User-Role": localStorage.getItem("role") || "karyawan",
      "X-Id-Karyawan": localStorage.getItem("id_karyawan") || "",
    };
    return headers;
  };

  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/cuti/list?status=Menunggu&per_page=200`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:'Gagal ambil data'}));
        throw new Error(err.detail || "Gagal mengambil data");
      }
      const body = await res.json();
      setDataCuti(body.data.items || []);
      setSelected(new Set());
      setSelectAll(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
    setSelectAll(s.size === dataCuti.length && dataCuti.length > 0);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(dataCuti.map((d) => d.id_cuti));
      setSelected(allIds);
      setSelectAll(true);
    }
  };

  const handleAction = (type) => {
    if (selected.size === 0) {
      alert("Pilih minimal 1 pengajuan untuk melakukan aksi.");
      return;
    }
    setPopup({ visible: true, type });
  };

  const confirmAction = async () => {
    const status = popup.type === "approve" ? "Disetujui" : "Ditolak";
    const ids = Array.from(selected);
    setPopup({ visible: false, type: "" });

    // lakukan request ke backend
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/cuti/bulk-status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          ids: ids,
          status: status,
          id_approval: parseInt(localStorage.getItem("id_karyawan")) || null,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error((body && body.detail) || body.message || "Gagal update status");
      }

      alert(body.message || "Berhasil memperbarui status");
      // refresh daftar
      await loadPending();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan: " + (err.message || err));
    } finally {
      setLoading(false);
    }
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
        <div className="approval-table">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                  </th>
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
                {dataCuti.map((cuti) => (
                  <tr key={cuti.id_cuti}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(cuti.id_cuti)}
                        onChange={() => toggleSelect(cuti.id_cuti)}
                      />
                    </td>
                    <td>{cuti.id_cuti}</td>
                    <td>{cuti.id_karyawan}</td>
                    <td>{cuti.nama_karyawan}</td>
                    <td>{cuti.tanggal_mulai}</td>
                    <td>{cuti.tanggal_akhir}</td>
                    <td>{cuti.jumlah}</td>
                    <td>{cuti.jenis_cuti}</td>
                    <td>{cuti.status}</td>
                    <td>{cuti.keterangan}</td>
                  </tr>
                ))}
                {dataCuti.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center" }}>
                      Tidak ada pengajuan cuti menunggu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tombol Aksi */}
          <div className="actions">
            <button className="btn btn-reject" 
            onClick={() => handleAction("reject")}
            disabled={selected.size === 0 || loading}
            >
              Tolak
            </button>
            <button className="btn btn-approve"
            onClick={() => handleAction("approve")}
            disabled={selected.size === 0 || loading}
            >
              Setuju
            </button>
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