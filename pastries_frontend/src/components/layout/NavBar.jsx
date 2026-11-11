
import { useState } from 'react';
import { LoginModal } from '../admin/LoginModal';
import { AdminPanel } from '../admin/AdminPanel';
import { ChangePasswordModal } from '../admin/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import donutLogo from '../../assets/donut.svg';

export const NavBar = ({ series, onSeriesChanged }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const { isAuthenticated, loading, logout } = useAuth();

  const handleLogout = async () => {
    setLogoutMessage('');
    const result = await logout();
    if (!result.success) setLogoutMessage(`Wylogowano lokalnie, ale serwer nie potwierdził wylogowania: ${result.error}`);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <img src={donutLogo} alt="Logo" className="nav-logo" />
          <span>  Pączkometer</span>
        </div>
        <div className="nav-links">
          {loading ? (
            <span className="nav-status">Sprawdzanie sesji...</span>
          ) : isAuthenticated ? (
            <>
              <button type="button" onClick={() => setIsAdminPanelOpen(true)}>Zarządzaj seriami i czujnikami</button>
              <button type="button" onClick={() => setIsPasswordModalOpen(true)}>Zmień hasło</button>
              <button type="button" onClick={handleLogout}>Wyloguj się</button>
            </>
          ) : (
            <button type="button" onClick={() => setIsLoginModalOpen(true)}>Zaloguj się</button>
          )}
        </div>
      </nav>
      {logoutMessage && <p className="nav-error" role="alert">{logoutMessage}</p>}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <AdminPanel
        isOpen={isAdminPanelOpen && isAuthenticated}
        onClose={() => setIsAdminPanelOpen(false)}
        series={series}
        onSeriesChanged={onSeriesChanged}
      />
      {isPasswordModalOpen && isAuthenticated && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};
