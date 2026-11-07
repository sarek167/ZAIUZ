
import { LoginForm } from './LoginForm';

export const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          aria-label="Zamknij okno logowania"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 id="login-modal-title">Logowanie</h2>
        <LoginForm onSuccess={onClose} />
      </div>
    </div>
  );
};