import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import BerandaApproval from "./pages/BerandaApproval";
import PersetujuanCuti from "./pages/PersetujuanCuti";
import ProfileApproval from "./pages/Profile";
import DataCuti from "./pages/DataCuti";
import AjukanCuti from "./pages/AjukanCuti";
import Notifikasi from "./pages/Notifikasi";
import LoginPage from "./pages/LoginPage";
import TwoFactorPage from "./pages/TwoFactorPage";
import TwoFactorForm from "./pages/TwoFactorForm";
import TwoFactorActive from "./pages/TwoFactorActive";
import TwoFactorFormReset from "./pages/TwoFactorFormReset";
import ResetPassword from "./pages/ResetPassword";
import BerandaKaryawan from "./pages/BerandaKaryawan";
import GantiPass from "./pages/GantiPass";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const twoFactorStatus = localStorage.getItem("twoFactorVerified");
    const savedRole = localStorage.getItem("role");

    if (loggedIn === "true") setIsLoggedIn(true);
    if (twoFactorStatus === "true") setIsTwoFactorVerified(true);
    if (savedRole) setRole(savedRole);
  }, []);

  const handleTwoFactorVerified = () => {
    setIsTwoFactorVerified(true);
    localStorage.setItem("twoFactorVerified", "true");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(role) => {
                setIsLoggedIn(true);
                setRole(role);
              }}
            />
          }
        />

        <Route
          path="/beranda"
          element={
            isLoggedIn ? (
              isTwoFactorVerified ? (
                role === "approval" ? <BerandaApproval /> : <BerandaKaryawan />
              ) : (
                <Navigate to="/twofactor/form" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/twofactor"
          element={!isLoggedIn ? <Navigate to="/login" /> : <TwoFactorPage />}
        />
        <Route
          path="/twofactor/form"
          element={!isLoggedIn ? <Navigate to="/login" /> : <TwoFactorForm />}
        />
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
        <Route path="/twofactor/reset" element={<TwoFactorFormReset />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route path="/persetujuan-cuti" element={<PersetujuanCuti />} />

        {/* Profile diarahkan sesuai role */}
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              role === "approval" ? <ProfileApproval /> : <ProfileKaryawan />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/data-cuti" element={<DataCuti />} />
        <Route path="/ajukan-cuti" element={<AjukanCuti />} />
        <Route path="/notifikasi" element={<Notifikasi />} />

        {/* GantiPass hanya bisa diakses user login */}
        <Route
          path="/gantipass"
          element={isLoggedIn ? <GantiPass /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;