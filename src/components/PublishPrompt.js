import React, { useState } from 'react';

function PublishPrompt({ onSubmit, onCancel, busy, error }) {
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ password, description });
  };

  return (
    <div className="password-prompt-overlay">
      <div className="password-prompt publish-prompt">
        <h3>Publish to GitHub</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the changes for the changelog and commit"
            rows={5}
            required
            disabled={busy}
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Publish password"
            required
            disabled={busy}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button type="submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</button>
            <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PublishPrompt;
