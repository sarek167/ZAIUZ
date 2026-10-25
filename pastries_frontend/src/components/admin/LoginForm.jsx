import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginForm = () => {
  const { login, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password) {
      setLocalError('Please provide username and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setLocalError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {(localError || authError) && (
        <div role="alert" className="error-box">
          {localError || authError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="username">Nazwa użytkownika:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          autoComplete="username"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Hasło:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
      </button>
    </form>
  );
};