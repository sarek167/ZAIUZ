
import { useState } from 'react';
import { LoginModal } from '../admin/LoginModal';
import donutLogo from '../../assets/donut.svg';

export const NavBar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <img src={donutLogo} alt="Logo" className="nav-logo" />
          <span>  Pączkometer</span>
        </div>
        <div className="nav-links">
          <button
            className="nav-link"
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Zaloguj się
          </button>
        </div>
      </nav>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
