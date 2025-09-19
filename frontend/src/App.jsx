import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BerandaApproval from "./pages/BerandaApproval";
import PersetujuanCuti from "./pages/PersetujuanCuti";
import Profile from "./pages/Profile";
import DataCuti from "./pages/DataCuti";
import AjukanCuti from "./pages/AjukanCuti";
import Notifikasi from "./pages/Notifikasi";
import LoginPage from "./pages/LoginPage";
import TwoFactorPage from "./pages/TwoFactorPage";
import TwoFactorForm from "./pages/TwoFactorForm";
import TwoFactorActive from "./pages/TwoFactorActive";
import TwoFactorFormReset from "./pages/TwoFactorFormReset";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);

  // cek localStorage saat pertama kali load
  useEffect(() => {
    const twoFactorStatus = localStorage.getItem("twoFactorVerified");
    if (twoFactorStatus === "true") {
      setIsTwoFactorVerified(true);
    }
  }, []);

  // simpan ke localStorage kalau 2FA sudah diaktifkan
  const handleTwoFactorVerified = () => {
    setIsTwoFactorVerified(true);
    localStorage.setItem("twoFactorVerified", "true");
  };

  return (
    <Router>
      <Routes>
        {/* Default route ke login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route
          path="/login"
          element={
          isLoggedIn ? (
          <Navigate to="/twofactor" />   // 👈 selalu lempar ke halaman 2FA dulu
          ) : (
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
       )
     }
    />


        {/* Two Factor: langkah 1 */}
        <Route
          path="/twofactor"
          element={
            !isLoggedIn ? <Navigate to="/login" /> : <TwoFactorPage />
          }
        />

        {/* Two Factor: langkah 2 (form pertanyaan) */}
        <Route
          path="/twofactor/form"
          element={
            !isLoggedIn ? <Navigate to="/login" /> : <TwoFactorForm />
          }
        />

        {/* Two Factor: langkah 3 (active) */}
        <Route
          path="/twofactor/active"
          element={
            !isLoggedIn ? (
              <Navigate to="/login" />
            ) : (
              <TwoFactorActive onVerify={handleTwoFactorVerified} />
            )
          }
        />

          {/* Reset Password Flow */}
          <Route path="/twofactor/reset" element={<TwoFactorFormReset />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Beranda hanya bisa diakses kalau sudah login + 2FA */}
        <Route
          path="/beranda"
          element={
            isLoggedIn && isTwoFactorVerified ? (
              <BerandaApproval />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Halaman lain */}
        <Route path="/persetujuan-cuti" element={<PersetujuanCuti />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/data-cuti" element={<DataCuti />} />
        <Route path="/ajukan-cuti" element={<AjukanCuti />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
      </Routes>
    </Router>
  );
}

export default App;
