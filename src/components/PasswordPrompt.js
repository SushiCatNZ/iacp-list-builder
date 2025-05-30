import React, { useState } from 'react';

function PasswordPrompt({ onSubmit, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin') {
      onSubmit();
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="password-prompt-overlay">
      <div className="password-prompt">
        <h3>Enter Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />
          {error && <div className="error-message">Incorrect password</div>}
          <div className="button-group">
            <button type="submit">Submit</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordPrompt; 