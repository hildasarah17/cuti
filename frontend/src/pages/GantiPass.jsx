import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ redirect
import "../styles/GantiPass.css";

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    old: "",
    new: "",
    confirm: "",
  });
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    success: false,
  }); // ✅ state popup
  const navigate = useNavigate();

  const toggleShow = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.old || !formData.new || !formData.confirm) {
      return setPopup({
        show: true,
        message: "Harap isi semua field!",
        success: false,
      });
    }
    if (formData.new !== formData.confirm) {
      return setPopup({
        show: true,
        message: "Konfirmasi sandi tidak cocok!",
        success: false,
      });
    }

    try {
      const res = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: formData.old,
          newPassword: formData.new,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setPopup({
          show: true,
          message: "Password berhasil diperbarui!",
          success: true,
        });

        // redirect setelah beberapa detik
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopup({
          show: true,
          message: data.message || "Gagal mengganti password.",
          success: false,
        });
      }
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        message: "Terjadi kesalahan server.",
        success: false,
      });
    }
  };

  return (
    <div className="change-password-container">
      {/* Left side */}
      <div className="cp-left">
        <div className="left-inner">
          <h2 className="brand-title">Nusantara Corp</h2>
          <p className="brand-sub">Jalanin Proyek, Nikmatin Hidup.</p>
        </div>
      </div>

      {/* Right side */}
      <div className="cp-right">
        <h3>Tetapkan sandi baru!</h3>
        <p>
          Buat kata sandi baru. Pastikan kata sandi berbeda dari kata sandi
          sebelumnya demi keamanan.
        </p>

        <form className="cp-form" onSubmit={handleSubmit}>
          {[
            {
              id: "old",
              label: "Kata sandi sebelumnya",
              placeholder: "Masukkan kata sandi sebelumnya",
            },
            {
              id: "new",
              label: "Kata sandi baru",
              placeholder: "Masukkan kata sandi baru",
            },
            {
              id: "confirm",
              label: "Konfirmasi sandi baru",
              placeholder: "Masukkan kembali kata sandi",
            },
          ].map(({ id, label, placeholder }) => (
            <div className="cp-input-group" key={id}>
              <label>{label}</label>
              <div className="cp-input-wrapper">
                <Lock size={18} className="icon" />
                <input
                  type={showPassword[id] ? "text" : "password"}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  placeholder={placeholder}
                />
                {showPassword[id] ? (
                  <EyeOff
                    size={18}
                    className="icon-btn"
                    onClick={() => toggleShow(id)}
                  />
                ) : (
                  <Eye
                    size={18}
                    className="icon-btn"
                    onClick={() => toggleShow(id)}
                  />
                )}
              </div>
            </div>
          ))}

          <button type="submit" className="cp-btn">
            Perbarui
          </button>
        </form>
      </div>

      {/* ✅ Popup Modal */}
      {popup.show && (
        <div className="popup-overlay">
          <div className={`popup-box ${popup.success ? "success" : "error"}`}>
            <p>{popup.message}</p>

            {popup.success ? (
              <div className="popup-actions">
                <button
                  className="yes-btn"
                  onClick={() => {
                    setPopup({ ...popup, show: false });
                    navigate("/login");
                  }}
                >
                  Iya
                </button>
                <button
                  className="no-btn"
                  onClick={() => setPopup({ ...popup, show: false })}
                >
                  Tidak
                </button>
              </div>
            ) : (
              <button
                className="close-btn"
                onClick={() => setPopup({ ...popup, show: false })}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
