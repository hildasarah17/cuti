import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/UserDropdown.css";
import UserAvatar from "../assets/user1.png";

export default function UserDropdown() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowModal(false);
    navigate("/login");
  };

  return (
    <div className="user-dropdown">
      {/* Header User Info */}
      <div className="user-info">
        <img src={UserAvatar} alt="avatar" className="user-avatar" />
        <div>
          <h4 className="user-name">Samsul Sodiqin</h4>
          <p className="user-email">SamsulSoqidin@gmail.com</p>
        </div>
      </div>

      <hr className="divider" />

      {/* Actions */}
      <div className="user-actions">
        <Link to="/twofactor" className="btn verify-btn">
          🔒 Verifikasi dua langkah
        </Link>

{/* Menu Ganti Password */}
<Link to="/GantiPass" className="btn change-pass-btn">
  🔑 Ganti Password
</Link>


        <button onClick={() => setShowModal(true)} className="btn logout-btn">
          🚪 Logout
        </button>
      </div>

      {/* Modal Konfirmasi Logout */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Konfirmasi Logout</h3>
            <p>Terima kasih sudah menggunakan aplikasi ini.</p>
            <p>Apakah anda yakin ingin keluar dari akun anda saat ini?</p>

            <div className="modal-actions">
              <button
                className="btn cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button className="btn confirm-btn" onClick={handleLogout}>
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}