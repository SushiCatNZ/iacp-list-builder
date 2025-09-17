import React from 'react';
import IALogo from '../images/icons/IA Logo.png';

function getCardImageUrl(card, imageRefreshKey) {
  if (!card || !card.ImageName) return null;
  
  // Use dynamic API endpoint instead of static require
  const cardGroup = card.CardGroup === "Command" ? "command" : "deployment";
  return `/api/images/${cardGroup}/${card.ImageName}?refresh=${imageRefreshKey || 0}`;
}

function CardPreview({ card, imageRefreshKey = 0 }) {
  if (!card) {
    return (
      <div className="card-preview empty">
        <div className="ia-logo-top-container">
          <img src={IALogo} alt="Imperial Assault Logo" className="ia-logo-placeholder" style={{ width: '90%', maxWidth: '90%', display: 'block', marginBottom: '8px' }} />
          <div className="colored-line"></div>
          <div className="author-credit">by 2BiT</div>
        </div>
      </div>
    );
  }

  let cardImage = getCardImageUrl(card, imageRefreshKey);

  return (
    <div className={`card-preview ${card.CardGroup === "Auxiliary" ? "auxiliary" : ""}`}>
      {cardImage ? (
        <img 
          src={cardImage} 
          alt={card.Name} 
          className={`card-image ${card.CardGroup === "Auxiliary" ? "auxiliary" : ""}`}
        />
      ) : (
        <div className="card-placeholder">
          <h3>{card.Name}</h3>
          <p>Image not found</p>
        </div>
      )}
    </div>
  );
}

export default CardPreview;