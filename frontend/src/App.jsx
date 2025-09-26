import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

// Hook untuk sinkronisasi auth state
function useAuthSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);
  const [role, setRole] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const twoFactorStatus = localStorage.getItem("twoFactorVerified") === "true";
    const savedRole = localStorage.getItem("role");

    setIsLoggedIn(loggedIn);
    setIsTwoFactorVerified(twoFactorStatus);
    setRole(savedRole || null);
  }, [location.pathname]); // update setiap pindah halaman

  return { isLoggedIn, setIsLoggedIn, isTwoFactorVerified, setIsTwoFactorVerified, role, setRole };
}

function AppRoutes() {
  const {
    isLoggedIn,
    setIsLoggedIn,
    isTwoFactorVerified,
    setIsTwoFactorVerified,
    role,
    setRole,
  } = useAuthSync();

  const handleTwoFactorVerified = () => {
    setIsTwoFactorVerified(true);
    localStorage.setItem("twoFactorVerified", "true");
  };

  return (
    <Routes>
      {/* Default root langsung ke beranda */}
      <Route path="/" element={<Navigate to="/beranda" replace />} />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={(role) => {
              setIsLoggedIn(true);
              setRole(role);
              localStorage.setItem("isLoggedIn", "true");
              localStorage.setItem("role", role);
            }}
          />
        }
      />

      {/* BERANDA */}
      <Route
        path="/beranda"
        element={
          isLoggedIn ? (
            isTwoFactorVerified ? (
              role === "approval" ? <BerandaApproval /> : <BerandaKaryawan />
            ) : (
              <Navigate to="/twofactor/form" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* TWO FACTOR */}
      <Route
        path="/twofactor"
        element={!isLoggedIn ? <Navigate to="/login" replace /> : <TwoFactorPage />}
      />
      <Route
        path="/twofactor/form"
        element={!isLoggedIn ? <Navigate to="/login" replace /> : <TwoFactorForm />}
      />
      <Route
        path="/twofactor/active"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : (
            <TwoFactorActive onVerify={handleTwoFactorVerified} />
          )
        }
      />
      <Route path="/twofactor/reset" element={<TwoFactorFormReset />} />
      <Route path="/resetpassword" element={<ResetPassword />} />

      {/* ROUTES LAIN DI-PROTECT */}
      <Route path="/persetujuan-cuti" element={isLoggedIn ? <PersetujuanCuti /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={isLoggedIn ? <ProfileApproval /> : <Navigate to="/login" replace />} />
      <Route path="/data-cuti" element={isLoggedIn ? <DataCuti /> : <Navigate to="/login" replace />} />
      <Route path="/ajukan-cuti" element={isLoggedIn ? <AjukanCuti /> : <Navigate to="/login" replace />} />
      <Route path="/notifikasi" element={isLoggedIn ? <Notifikasi /> : <Navigate to="/login" replace />} />
      <Route path="/gantipass" element={isLoggedIn ? <GantiPass /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
