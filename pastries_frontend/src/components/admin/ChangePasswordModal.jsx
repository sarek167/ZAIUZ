import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export const ChangePasswordModal = ({ onClose }) => {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setNotice('')
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (newPassword.length < 8) {
      setError('Nowe hasło musi mieć co najmniej 8 znaków.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Nowe hasła nie są takie same.')
      return
    }

    setIsSubmitting(true)
    const result = await changePassword(currentPassword, newPassword)
    setIsSubmitting(false)
    if (result.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setNotice('Hasło zostało zmienione.')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <section
        className="modal-content admin-password-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          aria-label="Zamknij zmianę hasła"
          onClick={handleClose}
        >
          &times;
        </button>
        <h2 id="password-modal-title">Zmiana hasła</h2>
        <form className="admin-form" onSubmit={handleSubmit}>
          {error && <p className="admin-message admin-message--error" role="alert">{error}</p>}
          {notice && <p className="admin-message admin-message--success" role="status">{notice}</p>}
          <label>
            Bieżące hasło
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              disabled={isSubmitting}
            />
          </label>
          <label>
            Nowe hasło
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </label>
          <label>
            Powtórz nowe hasło
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zmień hasło'}
          </button>
        </form>
      </section>
    </div>
  )
}
