import React from "react";
import RebelLogo from "../images/icons/Rebel Logo.png";
import EmpireLogo from "../images/icons/Empire Logo.png";
import MercenaryLogo from "../images/icons/Mercenary-black.png";
import NeutralLogo from "../images/icons/Neutral.png";
import EliteBlock from "../images/icons/elite_block.png";
import RegularBlock from "../images/icons/regular_block.png";
import CompanionBlock from "../images/icons/companion_block.png";
import SquadBlock from "../images/icons/squad_block.png";
import AuxiliaryBlock from "../images/icons/auxiliary_block.png";
import CommandBlock from "../images/icons/command_block.png";

const factionIcons = {
  Rebel: RebelLogo,
  Empire: EmpireLogo,
  Mercenary: MercenaryLogo,
  Neutral: NeutralLogo
};

function getCardClassIcon(card) {
  const group = card.CardGroup ? card.CardGroup.toLowerCase() : "";
  const color = card.Color ? card.Color.toLowerCase() : "";
  if (group === "command") return CommandBlock;
  if (group === "deployment" || group === "skirmish upgrade") {
    if (color === "red") return EliteBlock;
    if (color === "gray") return RegularBlock;
  }
  if (group === "companion") return CompanionBlock;
  if (group === "auxiliary") return AuxiliaryBlock;
  if (group === "squad upgrade") return SquadBlock;
  return RegularBlock;
}

function displayCardName(name) {
  return name.replace(/\s*\[Elite\]$/, "");
}

function CardList({ cards, onAdd, list, onSelect, type, iacpLogo, showIACP, factionIcons: parentFactionIcons, activeFactions, search, selectedTraits, onCardClick, showCardEditor }) {
  const sortedCards = [...cards].sort((a, b) => {
    if (showCardEditor) {
      // When card editor is enabled, sort by ID in descending order
      return b.ID - a.ID;
    }
    // Default sorting by cost
    return b.Cost - a.Cost;
  });
  const filtered = sortedCards
    .filter(card => activeFactions.includes(card.Faction))
    .filter(card => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = typeof card.Name === "string" && card.Name.toLowerCase().includes(searchLower);
        const traitsMatch = Array.isArray(card.Traits) && card.Traits.some(trait => typeof trait === "string" && trait.toLowerCase().includes(searchLower));
        const allTextMatch = typeof card.AllText === "string" && card.AllText.toLowerCase().includes(searchLower);
        const characteristicsMatch = Array.isArray(card.Characteristics) && card.Characteristics.some(
          char => typeof char === "string" && char.toLowerCase().includes(searchLower)
        );
        if (!(nameMatch || traitsMatch || allTextMatch || characteristicsMatch)) return false;
      }
      // Trait filter
      if (selectedTraits && selectedTraits.length > 0) {
        if (card.Traits && type === "deployment") {
          // Deployment cards: match against Traits
          if (
            !selectedTraits.every(
              trait =>
                card.Traits.some(
                  t => typeof t === "string" && t.toLowerCase() === trait.toLowerCase()
                )
            )
          ) {
            return false;
          }
        } else if (card.TraitsRequired && type === "command") {
          // Command cards: match against TraitsRequired
          if (
            !selectedTraits.every(
              trait =>
                card.TraitsRequired.some(
                  t => typeof t === "string" && t.toLowerCase() === trait.toLowerCase()
                )
            )
          ) {
            return false;
          }
        } else {
          // If neither field is present, or type is not recognized, hide the card
          return false;
        }
      }
      return true;
    });

  const getCardCount = (cardId) => {
    return list.filter(c => c.ID === cardId).length;
  };

  return (
    <div className="cards-container">
      {filtered.map((card, idx) => {
        const count = getCardCount(card.ID);
        const maxReached = count >= (card.Max || 1);

        // Show card art background for all relevant card groups
        let cardArtBg = null;
        if (
          card.CardGroup === "Deployment" ||
          card.CardGroup === "Skirmish Upgrade" ||
          card.CardGroup === "Squad Upgrade" ||
          card.CardGroup === "Companion" ||
          card.CardGroup === "Command"
        ) {
          let imageName = card.Name;
          if (card.CardClass === "Elite") imageName += " [Elite]";
          else if (card.CardClass === "Regular") imageName += " [Regular]";
          if (card.Variant === "IACP") imageName += " [IACP]";
          imageName += ".png";
          let imagePath = '';
          try {
            if (card.CardGroup === "Command") {
              imagePath = require(`../images/command/${imageName}`);
            } else {
              imagePath = require(`../images/deployment/${imageName}`);
            }
          } catch (e) {
            imagePath = '';
          }
          let imageUrl = '';
          if (imagePath) {
            imageUrl = typeof imagePath === 'string' ? imagePath : imagePath.default;
          }
          if (imageUrl) {
            if (card.CardGroup === "Command") {
              cardArtBg = (
                <div className="card-art-bg" style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '120px',
                  height: '100%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }}>
                  <img
                    src={imageUrl}
                    alt={card.Name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `center ${-30 + (card.ImageOffset || 0)}px`,
                      display: 'block',
                      marginLeft: 0,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 70%, #fff 100%)',
                    }}
                  />
                </div>
              );
            } else {
              cardArtBg = (
                <div className="card-art-bg" style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '120px',
                  height: '100%',
                  zIndex: 1,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }}>
                  <img
                    src={imageUrl}
                    alt={card.Name}
                    style={{
                      width: '115%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: `right ${-34 + (card.ImageOffset || 0)}px`,
                      display: 'block',
                      marginLeft: '-15%',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 70%, #fff 100%)',
                    }}
                  />
                </div>
              );
            }
          }
        }

        return (
          <div
            key={card.ID}
            className={`card-item ${maxReached ? 'max-reached' : ''}`}
            style={{ borderColor: card.Color || '#ccc', position: 'relative' }}
            onClick={() => onCardClick(card)}
          >
            {cardArtBg}
            <div className="card-content" style={{ position: 'relative', zIndex: 2 }}>
              <div className="card-class-cost-group">
                <span
                  className={`card-cost${card.CardGroup === "Command" ? " command-cost" : ""}`}
                >
                  {card.Cost}
                </span>
                <img 
                  src={getCardClassIcon(card)}
                  alt={card.CardClass}
                  className="card-class-icon"
                />
              </div>
              <img 
                src={parentFactionIcons ? parentFactionIcons[card.Faction] : factionIcons[card.Faction]} 
                alt={card.Faction}
                className="card-faction-icon"
              />
              <span className="card-name">
                {card.CardClass === "Unique" && (
                  <span className="unique-dot"></span>
                )}
                {displayCardName(card.Name)}
                {card.Variant === "IACP" && (
                  <img 
                    src={iacpLogo}
                    alt="IACP"
                    className="card-iacp-icon"
                  />
                )}
              </span>
              {count > 0 && (
                <span className="card-count">
                  {count}/{card.Max || 1}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(card);
              }}
              disabled={maxReached}
              className="add-button"
              style={{ position: 'relative', zIndex: 1 }}
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default CardList;