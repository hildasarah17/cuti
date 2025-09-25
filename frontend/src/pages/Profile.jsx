import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaPaperPlane,
  FaUser,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaCheck,
  FaCamera,
} from "react-icons/fa";
import "../styles/Profile.css";

import UserDropdown from "../components/UserDropDown.jsx";
import Logo from "../assets/logo_blitz.png";
import UserAvatar from "../assets/user1.png";

export default function Profile() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    idKaryawan: "",
    nama: "",
    email: "",
    password: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    alamat: "",
    status: "",
    avatar: UserAvatar,
  });

  const [editField, setEditField] = useState({
    email: false,
    password: false,
    alamat: false,
  });

  const [feedback, setFeedback] = useState({
    email: "",
    alamat: "",
  });

  const API_URL = "http://localhost:8000/profile"; // ganti sesuai backend

  // ========================
  // FETCH PROFILE DARI BACKEND
  // ========================
  useEffect(() => {
    const idKaryawan = localStorage.getItem("id_karyawan"); // ambil dari login
      if (!idKaryawan) return; // kalau belum login

    fetch(`${API_URL}/${idKaryawan}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          const k = data.data;
          setProfile({
            idKaryawan: k.id_karyawan,
            nama: k.nama,
            email: k.email,
            password: k.password,
            tempatLahir: k.tempat_lahir,
            tanggalLahir: k.tanggal_lahir,
            jenisKelamin: k.jenis_kelamin,
            agama: k.agama,
            alamat: k.alamat,
            status: k.status,
            avatar: k.foto || UserAvatar,
          });
        }
      })
      .catch((err) => console.error("Error fetch profile:", err));
  }, []);

  // ========================
  // HANDLE SAVE & UPDATE BACKEND
  // ========================
  const handleSave = async (field, value) => {
    let message = "";

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        message = "Email harus dalam format yang benar (contoh: user@mail.com)";
        setFeedback((prev) => ({ ...prev, [field]: message }));
        return;
      }
    }

    const idKaryawan = profile.idKaryawan;

    // Kirim ke backend
    const formData = new FormData();
    formData.append("email", field === "email" ? value : profile.email);
    formData.append("password", field === "password" ? value : profile.password);
    formData.append("alamat", field === "alamat" ? value : profile.alamat);

    try {
      const res = await fetch(`${API_URL}/${idKaryawan}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        // update UI
        setProfile((prev) => ({ ...prev, [field]: value }));
        setEditField((prev) => ({ ...prev, [field]: false }));

        if (field === "alamat") message = "Alamat berhasil diubah";
        else if (field === "email") message = "Email berhasil diubah";

        setFeedback((prev) => ({ ...prev, [field]: message }));
        setTimeout(() => setFeedback((prev) => ({ ...prev, [field]: "" })), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleEdit = (field) => {
    setEditField((prev) => ({ ...prev, [field]: true }));
    setFeedback((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const idKaryawan = profile.idKaryawan;

    const formData = new FormData();
    formData.append("email", profile.email);
    formData.append("password", profile.password);
    formData.append("alamat", profile.alamat);
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/${idKaryawan}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        // update avatar UI
        setProfile((prev) => ({
          ...prev,
          avatar: URL.createObjectURL(file),
        }));
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };

  // -----------------------------
  // render tetap sama seperti sebelumnya
  // -----------------------------
  return (
    <div className="profile-page-wrapper">
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
              <img src={profile.avatar} alt="user" />
              <span>{profile.nama}</span>
            </div>
            {showDropdown && <UserDropdown />}
          </div>
        </header>

        {/* Content */}
        <div className="main-content profile-page">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <img src={profile.avatar} alt="avatar" className="profile-avatar" />
                <label htmlFor="avatarUpload" className="edit-avatar">
                  <FaCamera />
                </label>
                <input
                  type="file"
                  id="avatarUpload"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <h2>{profile.nama}</h2>
                <p>{profile.email}</p>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-box">
                <label>ID Karyawan</label>
                <p>{profile.idKaryawan}</p>
              </div>

              <div className="profile-box">
                <label>Nama Lengkap</label>
                <p>{profile.nama}</p>
              </div>

              {/* Email */}
              <div className="profile-box">
                <label>Email</label>
                <div className="input-group">
                  {editField.email ? (
                    <>
                      <input
                        type="text"
                        defaultValue={profile.email}
                        onBlur={(e) => handleSave("email", e.target.value)}
                        autoFocus
                      />
                      <FaCheck
                        className="icon"
                        onClick={(e) =>
                          handleSave("email", e.target.previousSibling.value)
                        }
                      />
                    </>
                  ) : (
                    <>
                      <input type="text" value={profile.email} readOnly />
                      <FaEdit className="icon" onClick={() => handleEdit("email")} />
                    </>
                  )}
                </div>
                {feedback.email && (
                  <p
                    className={
                      feedback.email.includes("harus") ? "feedback-text" : "feedback-success"
                    }
                  >
                    {feedback.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="profile-box">
                <label>Password</label>
                <div className="input-group">
                  {editField.password ? (
                    <>
                      <input
                        type={showPassword ? "text" : "password"}
                        defaultValue={profile.password}
                        onBlur={(e) => handleSave("password", e.target.value)}
                        autoFocus
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="icon"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      <FaCheck
                        className="icon"
                        onClick={(e) =>
                          handleSave(
                            "password",
                            e.target.previousSibling.previousSibling.value
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={profile.password}
                        readOnly
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="icon"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                      <FaEdit
                        className="icon"
                        onClick={() => handleEdit("password")}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="profile-box">
                <label>Tempat Lahir</label>
                <p>{profile.tempatLahir}</p>
              </div>

              <div className="profile-box">
                <label>Tanggal Lahir</label>
                <p>{profile.tanggalLahir}</p>
              </div>

              <div className="profile-box">
                <label>Jenis Kelamin</label>
                <p>{profile.jenisKelamin}</p>
              </div>

              <div className="profile-box">
                <label>Agama</label>
                <p>{profile.agama}</p>
              </div>

              {/* Alamat */}
              <div className="profile-box full-width">
                <label>Alamat</label>
                <div className="input-group">
                  {editField.alamat ? (
                    <>
                      <input
                        type="text"
                        defaultValue={profile.alamat}
                        onBlur={(e) => handleSave("alamat", e.target.value)}
                        autoFocus
                      />
                      <FaCheck
                        className="icon"
                        onClick={(e) =>
                          handleSave("alamat", e.target.previousSibling.value)
                        }
                      />
                    </>
                  ) : (
                    <>
                      <input type="text" value={profile.alamat} readOnly />
                      <FaEdit className="icon" onClick={() => handleEdit("alamat")} />
                    </>
                  )}
                </div>
                {feedback.alamat && (
                  <p
                    className={
                      feedback.alamat === "Alamat berhasil diubah"
                        ? "feedback-success"
                        : "feedback-text"
                    }
                  >
                    {feedback.alamat}
                  </p>
                )}
              </div>

              <div className="profile-box">
                <label>Status Karyawan</label>
                <p>{profile.status}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}