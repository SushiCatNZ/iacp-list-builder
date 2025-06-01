import React from "react";
import EliteBlock from "../images/icons/elite_block.png";
import RegularBlock from "../images/icons/regular_block.png";
import CompanionBlock from "../images/icons/companion_block.png";
import SquadBlock from "../images/icons/squad_block.png";
import AuxiliaryBlock from "../images/icons/auxiliary_block.png";
import CommandBlock from "../images/icons/command_block.png";

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
}) {
  return (
    <div className="list-section">
      <h3>{title}</h3>
      {deploymentStats && (
        <>
          <div className="deployment-stats-row">
            <span><b>Acts:</b> {deploymentStats.activations}</span>
            <span><b>Cost:</b> <span style={{ color: parseInt(deploymentStats.cost) > 40 ? '#ff0000' : 'inherit', fontWeight: parseInt(deploymentStats.cost) > 40 ? 'bold' : 'normal' }}>{deploymentStats.cost}</span></span>
            <span><b>Figs:</b> {deploymentStats.figures}</span>
            <span><b>Health:</b> {deploymentStats.health}</span>
          </div>
          <div className="deployment-traits-row">
            <span><b>Traits:</b> {deploymentStats.traits}</span>
          </div>
        </>
      )}
      {commandStats && (
        <div className="command-stats-row">
          <span><b>Cards:</b> <span style={{ color: parseInt(commandStats.cmdCards) > parseInt(commandStats.cmdCardLimit) ? '#ff0000' : 'inherit', fontWeight: parseInt(commandStats.cmdCards) > parseInt(commandStats.cmdCardLimit) ? 'bold' : 'normal' }}>{commandStats.cmdCards}</span></span>
          <span><b>Points:</b> <span style={{ color: parseInt(commandStats.cmdPoints) > parseInt(commandStats.cmdPointsLimit) ? '#ff0000' : 'inherit', fontWeight: parseInt(commandStats.cmdPoints) > parseInt(commandStats.cmdPointsLimit) ? 'bold' : 'normal' }}>{commandStats.cmdPoints}</span></span>
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
        </div>
      )}
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

          // Show card art background for all relevant card groups
          let cardArtBg = null;
          if (
            card.CardGroup === "Deployment" ||
            card.CardGroup === "Skirmish Upgrade" ||
            card.CardGroup === "Squad Upgrade" ||
            card.CardGroup === "Companion" ||
            card.CardGroup === "Command"
          ) {
            let imagePath = '';
            try {
              if (card.CardGroup === "Command") {
                imagePath = require(`../images/command/${card.ImageName}`);
              } else {
                imagePath = require(`../images/deployment/${card.ImageName}`);
              }
            } catch (e) {
              imagePath = '';
            }
            if (imagePath) {
              let imageUrl = typeof imagePath === 'string' ? imagePath : imagePath.default;
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
              {(upgradesToAdd.length > 0 || card.Name === "Doctor Aphra") && onAddMultipleDeploymentCards && (
                <button
                  className="add-attachment-button"
                  title={
                    card.Name === "Doctor Aphra"
                      ? `Add upgrades: ${upgradesToAdd.map(u => u.Name).join(', ')}${upgradesToAdd.length > 0 ? ', ' : ''}0-0-0, BT-1`
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
              {card.Name === "Wing Guard [Elite]" && card.Variant === "IACP" && (
                <button
                  className="add-attachment-button"
                  onClick={() => {
                    const toAdd = [allDeploymentCards.find(c => c.Name === "Lando Calrissian")]
                      .filter(c => c && !deploymentList.some(d => d.Name === c.Name));
                    if (toAdd.length > 0) {
                      onAddMultipleDeploymentCards(toAdd);
                    }
                  }}
                >
                  LANDO
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