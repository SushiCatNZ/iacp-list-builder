import React from "react";
import EliteBlock from "../images/icons/elite_block.png";
import RegularBlock from "../images/icons/regular_block.png";
import CompanionBlock from "../images/icons/companion_block.png";
import SquadBlock from "../images/icons/squad_block.png";
import AuxiliaryBlock from "../images/icons/auxiliary_block.png";
import CommandBlock from "../images/icons/command_block.png";
import ActivationIcon from '../images/icons/Activation.png';
import CostIcon from '../images/icons/Cost.png';
import FiguresIcon from '../images/icons/Figures.png';
import HealthIcon from '../images/icons/Health.png';
import CardsIcon from '../images/icons/Cards.png';
import PointsIcon from '../images/icons/Points.png';

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

function ListSection({
  title, cards = [], onRemove, onSelect, factionIcons, iacpLogo,
  deploymentStats, commandStats, commandCards = [], skirmishUpgradeCards = [], showIACP = false,
  onAddCommandCard, onAddSkirmishUpgrade, commandList = [], deploymentList = [],
  onAddCommonCommandCards, allDeploymentCards, onAddDeploymentCard, setDeploymentList,
  onAddMultipleDeploymentCards, allCommandCards, onAddMultipleCommandCards,
  squadUpgradeCards,
  baseFaction,
  handleCardClick,
  showAddCommonButton = false,
  imageRefreshKey = 0,
}) {
  return (
    <div className="list-section">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
        <div className="section-title-box">
          {title && <span style={{ textTransform: 'uppercase' }}>{title}</span>}
        </div>
        {/* Only show stats for Selected Deployment section */}
        {deploymentStats && (
          <div className="deployment-stats-row" style={{ marginLeft: 'auto', marginRight: '10px', textAlign: 'right', display: 'flex', gap: '8px', fontSize: '1.05rem', fontFamily: 'Adobe Hebrew Regular, Arial, sans-serif' }}>
            <span><img src={ActivationIcon} alt="Acts" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> {deploymentStats.activations}</span>
            <span><img src={CostIcon} alt="Cost" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> <span style={{ color: parseInt(deploymentStats.cost) > 40 ? '#ff0000' : 'inherit', fontWeight: parseInt(deploymentStats.cost) > 40 ? 'bold' : 'normal' }}>{deploymentStats.cost}</span></span>
            <span><img src={FiguresIcon} alt="Figs" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> {deploymentStats.figures}</span>
            <span><img src={HealthIcon} alt="Health" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> {deploymentStats.health}</span>
          </div>
        )}
        {showAddCommonButton && (
          <button
            className="add-common-command-button"
            title="Add commonly used cards"
            onClick={e => {
              e.stopPropagation();
              if (onAddCommonCommandCards) onAddCommonCommandCards();
            }}
          >
            ADD COMMON
          </button>
        )}
        {/* Only show stats for Selected Command section */}
        {commandStats && (
          <div className="command-stats-row" style={{ marginLeft: 'auto', marginRight: '10px', textAlign: 'right', display: 'flex', gap: '4px', fontSize: '1.05rem', fontFamily: 'Adobe Hebrew Regular, Arial, sans-serif' }}>
            <span><img src={CardsIcon} alt="Cards" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> <span style={{ color: parseInt(commandStats.cmdCards) > parseInt(commandStats.cmdCardLimit) ? '#ff0000' : 'inherit', fontWeight: parseInt(commandStats.cmdCards) > parseInt(commandStats.cmdCardLimit) ? 'bold' : 'normal' }}>{commandStats.cmdCards}</span></span>
            <span><img src={PointsIcon} alt="Points" style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} /> <span style={{ color: parseInt(commandStats.cmdPoints) > parseInt(commandStats.cmdPointsLimit) ? '#ff0000' : 'inherit', fontWeight: parseInt(commandStats.cmdPoints) > parseInt(commandStats.cmdPointsLimit) ? 'bold' : 'normal' }}>{commandStats.cmdPoints}</span></span>
          </div>
        )}
      </div>
      <div className="selected-cards">
        {cards.map((card, index) => {
          // Find command cards that require this unit
          const matchingCommands = commandCards.filter(cmd =>
            Array.isArray(cmd.UnitsRequired)
              ? cmd.UnitsRequired.includes(card.Name)
              : cmd.UnitsRequired === card.Name
          );
          // Prefer IACP if toggle is on, else non-IACP
          let commandToAdd = null;
          let commandToAddCount = 0;
          let commandToAddMax = 1;
          if (matchingCommands.length > 0) {
            if (showIACP) {
              commandToAdd = matchingCommands.find(cmd => cmd.Variant === "IACP") || matchingCommands[0];
            } else {
              commandToAdd = matchingCommands.find(cmd => cmd.Variant === "FFG") || matchingCommands[0];
            }
            if (commandToAdd) {
              commandToAddCount = commandList.filter(c => c.ID === commandToAdd.ID).length;
              commandToAddMax = commandToAdd.Max || 1;
            }
          }

          // ATT button logic for Skirmish Upgrade
          const matchingUpgrades = [
            ...skirmishUpgradeCards,
            ...squadUpgradeCards || [],
            ...(allDeploymentCards || []).filter(card => card.CardGroup === "Deployment")
          ].filter(upg =>
            (upg.CardGroup === "Skirmish Upgrade" || 
             upg.CardGroup === "Companion" || 
             upg.CardGroup === "Auxiliary" ||
             upg.CardGroup === "Deployment") &&
            (Array.isArray(upg.UnitsRequired)
              ? upg.UnitsRequired.includes(card.Name)
              : upg.UnitsRequired === card.Name)
          );

          // For each upgrade, pick the IACP or non-IACP version as appropriate
          const upgradesToAdd = [];
          matchingUpgrades.forEach(upg => {
            // Check if an IACP version exists and should be preferred
            if (showIACP) {
              const iacpVersion = matchingUpgrades.find(u => u.Name === upg.Name && u.Variant === "IACP");
              if (iacpVersion && !upgradesToAdd.includes(iacpVersion)) {
                upgradesToAdd.push(iacpVersion);
                return;
              }
            }
            // Otherwise, add the non-IACP version if not already added
            if (!upgradesToAdd.find(u => u.ID === upg.ID)) {
              upgradesToAdd.push(upg);
            }
          });

          // Find associated command cards for this deployment card
          const associatedCommandCards = commandCards.filter(cmd =>
            cmd.UnitsRequired && cmd.UnitsRequired.includes(card.Name)
          );

          // Create a tooltip string
          const cmdTooltip = associatedCommandCards.length
            ? `Add: ${associatedCommandCards.map(cmd => cmd.Name).join(", ")}`
            : "No associated command cards";

          // Use thumbnail for card art background - dynamic API loading with refresh key
          let thumbPath = '';
          if (card.ImageName) {
            const cardGroup = card.CardGroup === "Command" ? "command" : "deployment";
            thumbPath = `/api/thumbnails/${cardGroup}/${card.ImageName}?refresh=${imageRefreshKey}`;
          }

          let cardArtBg = null;
          if (thumbPath) {
            if (card.CardGroup === "Command") {
              cardArtBg = (
                <div style={{
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
                    src={thumbPath}
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
                <div style={{
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
                    src={thumbPath}
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

          // --- ATT button logic for Scavenged Walker special case ---
          const isScavengedWalker = card.Name === "Scavenged Walker";

          return (
            <div 
              key={`${card.ID}-${index}`}
              className="selected-card"
              onClick={() => onSelect(card)}
              style={{ borderColor: card.Color || '#ccc', position: 'relative' }}
            >
              {cardArtBg}
              <div className="card-content" style={{ position: 'relative', zIndex: 1 }}>
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
                  src={factionIcons[card.Faction]} 
                  alt={card.Faction}
                  className="card-faction-icon"
                />
                <span className="card-name">
                  {card.CardClass === "Unique" && (
                    <span className="unique-dot"></span>
                  )}
                  {displayCardName(card.Name)}
                </span>
                {card.Variant === "IACP" && (
                  <img 
                    src={iacpLogo}
                    alt="IACP"
                    className="card-iacp-icon"
                  />
                )}
              </div>
              {allCommandCards && allCommandCards.some(
                c => Array.isArray(c.UnitsRequired) && c.UnitsRequired.includes(card.Name)
              ) && (
                <button
                  className="add-command-button"
                  onClick={() => {
                    const toAdd = allCommandCards
                      .filter(
                        c =>
                          Array.isArray(c.UnitsRequired) &&
                          c.UnitsRequired.includes(card.Name) &&
                          !commandList.some(cmd => cmd.ID === c.ID)
                      );
                    if (toAdd.length > 0) {
                      onAddMultipleCommandCards(toAdd);
                    }
                  }}
                  title={cmdTooltip}
                  style={{ position: 'relative', zIndex: 3 }}
                >
                  CMD
                </button>
              )}
              {(upgradesToAdd.length > 0 || card.Name === "Doctor Aphra" || (card.Name === "Wing Guard" && card.CardClass === "Elite" && card.Variant === "IACP")) && onAddMultipleDeploymentCards && (
                <button
                  className="add-attachment-button"
                  title={
                    card.Name === "Doctor Aphra"
                      ? `Add upgrades: ${upgradesToAdd.map(u => u.Name).join(', ')}${upgradesToAdd.length > 0 ? ', ' : ''}0-0-0, BT-1`
                      : card.Name === "Wing Guard" && card.CardClass === "Elite" && card.Variant === "IACP"
                      ? `Add: Lando Calrissian${upgradesToAdd.length > 0 ? `, ${upgradesToAdd.map(u => u.Name).join(', ')}` : ''}`
                      : `Add upgrades: ${upgradesToAdd.map(u => u.Name).join(', ')}`
                  }
                  onClick={e => {
                    e.stopPropagation();
                    let toAdd;
                    if (isScavengedWalker) {
                      // [Special Case] Allow Scavenged Walker to add AT-ST and AT-DP regardless of faction
                      toAdd = upgradesToAdd
                        .filter(upg => ["AT-ST", "AT-DP"].includes(upg.Name))
                        .filter(upg => deploymentList.filter(c => c.ID === upg.ID).length < (upg.Max || 1));
                    } else {
                      // [Standard Logic] Only add upgrades that match baseFaction or are Neutral
                      toAdd = upgradesToAdd
                        .filter(upg => 
                          (upg.Faction === baseFaction || upg.Faction === "Neutral") &&
                          (deploymentList.filter(c => c.ID === upg.ID).length < (upg.Max || 1))
                        );
                    }
                    // Special case: Doctor Aphra also adds 0-0-0 and BT-1 (these are deployment cards, not upgrades)
                    if (card.Name === "Doctor Aphra" && baseFaction === "Mercenary") {
                      const aphraBots = ["0-0-0", "BT-1"]
                        .map(name => allDeploymentCards.find(c => c.Name === name))
                        .filter(c => c && !deploymentList.some(d => d.Name === c.Name));
                      toAdd = [...toAdd, ...aphraBots];
                    }
                    // Special case: IACP Wing Guard [Elite] adds Lando Calrissian
                    if (card.Name === "Wing Guard" && card.CardClass === "Elite" && card.Variant === "IACP") {
                      const lando = allDeploymentCards.find(c => c.Name === "Lando Calrissian");
                      if (lando && !deploymentList.some(d => d.Name === lando.Name)) {
                        toAdd = [...toAdd, lando];
                      }
                    }
                    // Remove duplicates by ID
                    if (toAdd) {
                      toAdd = toAdd.filter((c, idx, arr) => arr.findIndex(x => x.ID === c.ID) === idx);
                    }

                    if (toAdd.length > 0) {
                      onAddMultipleDeploymentCards(toAdd);
                    }
                  }}
                  style={{ position: 'relative', zIndex: 3 }}
                >
                  ATT
                </button>
              )}
              {card.AssociatedDeploymentCards && card.AssociatedDeploymentCards.length > 0 && (
                <button
                  className="att-button"
                  title={`Add: ${card.AssociatedDeploymentCards.join(", ")}`}
                  onClick={() => {
                    const cardsToAdd = allDeploymentCards.filter(
                      c => card.AssociatedDeploymentCards.includes(c.Name)
                    );
                    // Only add if not already present
                    const newCards = cardsToAdd.filter(
                      c => !deploymentList.some(d => d.ID === c.ID)
                    );
                    if (newCards.length > 0) {
                      setDeploymentList([...deploymentList, ...newCards]);
                    }
                  }}
                >
                  ATT
                </button>
              )}
              <button 
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(card);
                }}
                style={{ position: 'relative', zIndex: 3 }}
              >
                −
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListSection;