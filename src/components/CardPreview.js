import React from 'react';
import IALogo from '../images/icons/IA Logo.png';

function getCardImageUrl(card) {
  if (!card || !card.Name) return null;
  
  // Build the image name based on card properties
  let imageName = card.Name;
  
  // Add [Elite] or [Regular] suffix
  if (card.CardClass === "Elite") {
    imageName += " [Elite]";
  } else if (card.CardClass === "Regular") {
    imageName += " [Regular]";
  }
  
  // Add [IACP] suffix if card is IACP variant
  if (card.Variant === "IACP") {
    imageName += " [IACP]";
  }
  
  // Add .png extension
  imageName += ".png";

  // Get the image path based on card group
  try {
    let imagePath;
    if (card.CardGroup === "Command") {
      imagePath = require(`../images/command/${imageName}`);
    } else {
      imagePath = require(`../images/deployment/${imageName}`);
    }
    return typeof imagePath === 'string' ? imagePath : imagePath.default;
  } catch (e) {
    return null;
  }
}

function CardPreview({ card }) {
  if (!card) {
    return (
      <div className="card-preview empty">
        <div className="ia-logo-top-container">
          <img src={IALogo} alt="Imperial Assault Logo" className="ia-logo-placeholder" />
          <div className="skirmish-title">Skirmish List Builder</div>
          <div className="author-credit">by 2BiT</div>
        </div>
      </div>
    );
  }

  let cardImage = getCardImageUrl(card);

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
          <p>Image coming soon</p>
        </div>
      )}
    </div>
  );
}

export default CardPreview;