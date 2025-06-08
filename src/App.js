import React, { useState, useEffect, useRef } from "react";
import initialCardData from "./data/cards.json";
import CardList from "./components/CardList";
import ListSection from "./components/ListSection";
import CardPreview from "./components/CardPreview";
import RebelLogo from "./images/icons/Rebel Logo.png";
import EmpireLogo from "./images/icons/Empire Logo.png";
import MercenaryLogo from "./images/icons/Mercenary-black.png";
import NeutralLogo from "./images/icons/Neutral.png";
import IACPLogo from "./images/icons/IACP Logo.png";
import IALogo from "./images/icons/IA Logo.png";
import './App.css';
import CardEditorInline from "./components/CardEditorInline";
import PasswordPrompt from './components/PasswordPrompt';
import BrawlerIcon from './images/icons/brawler.png';
import CreatureIcon from './images/icons/creature.png';
import DroidIcon from './images/icons/droid.png';
import ForceUserIcon from './images/icons/forceuser.png';
import GuardianIcon from './images/icons/guardian.png';
import HeavyWeaponIcon from './images/icons/heavyweapon.png';
import HunterIcon from './images/icons/hunter.png';
import LeaderIcon from './images/icons/leader.png';
import SmugglerIcon from './images/icons/smuggler.png';
import SpyIcon from './images/icons/spy.png';
import TechnicianIcon from './images/icons/technician.png';
import TrooperIcon from './images/icons/trooper.png';
import VehicleIcon from './images/icons/vehicle.png';
import WookieeIcon from './images/icons/wookiee.png';

const factionIcons = {
  Rebel: RebelLogo,
  Empire: EmpireLogo,
  Mercenary: MercenaryLogo,
  Neutral: NeutralLogo
};

const TRAIT_NAMES = [
  "Brawler",
  "Creature",
  "Droid",
  "Force User",
  "Guardian",
  "Heavy Weapon",
  "Hunter",
  "Leader",
  "Smuggler",
  "Spy",
  "Technician",
  "Trooper",
  "Vehicle",
  "Wookiee"
];

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    if (b.Cost !== a.Cost) {
      return b.Cost - a.Cost; // Descending cost
    }
    // If costs are equal, sort alphabetically by name
    return a.Name.localeCompare(b.Name);
  });
}

function App() {
  const [showDeployment, setShowDeployment] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deploymentList, setDeploymentList] = useState([]);
  const [commandList, setCommandList] = useState([]);
  const [factions] = useState(["Rebel", "Empire", "Mercenary", "Neutral"]);
  const [activeFactions, setActiveFactions] = useState(["Rebel", "Empire", "Mercenary", "Neutral"]);
  const [search, setSearch] = useState("");
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [iacpMode, setIacpMode] = useState("IACP"); // "FFG", "IACP", or "ALL"
  const [armyName, setArmyName] = useState("");
  const baseFactions = ["Rebel", "Empire", "Mercenary"];
  const [baseFaction, setBaseFaction] = useState("Rebel");
  const [autoFilter, setAutoFilter] = useState(true);
  const [cardData, setCardData] = useState(initialCardData);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [editCard, setEditCard] = useState(null); // For editing/creating a card
  const [imageRefreshKey, setImageRefreshKey] = useState(0);
  const [isCardEditorAuthenticated, setIsCardEditorAuthenticated] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showTraitsGrid, setShowTraitsGrid] = useState(false);

  // Ref for the traits dropdown container
  const traitsDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (traitsDropdownRef.current && !traitsDropdownRef.current.contains(event.target)) {
        setShowTraitsGrid(false);
      }
    }

    // Attach the event listener to the document
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [traitsDropdownRef]);

  const getCommonCommandCardNames = () => {
    const baseCards = [
      "Take Initiative",
      "Planning",
      "Urgency",
      "Element of Surprise",
      "Celebration",
      "Negation"
    ];

    switch (baseFaction) {
      case "Empire":
        return [...baseCards, "Price of Glory"];
      case "Rebel":
        return [...baseCards, "Heart of Freedom"];
      case "Mercenary":
        return [...baseCards, "Worth Every Credit", "Opportunistic"];
      default:
        return baseCards;
    }
  };

  function handleAddCommonCommandCards() {
    // Find the command cards by name
    const cardsToAdd = commandCards.filter(card =>
      getCommonCommandCardNames().includes(card.Name)
    );
    // Only add if not already at max
    const newCards = [];
    cardsToAdd.forEach(card => {
      const count = commandList.filter(c => c.ID === card.ID).length;
      const max = card.Max || 1;
      if (count < max) {
        newCards.push(card);
      }
    });
    setCommandList([...commandList, ...newCards]);
  }

  const filterIACPCards = (cards) => {
    if (iacpMode === "ALL") {
      return cards;
    }
    if (iacpMode === "FFG") {
      return cards.filter(card => card.Variant === "FFG");
    }
    // iacpMode === "IACP"
    const iacpReplacements = new Map();
    cards.forEach(card => {
      if (card.Variant === "IACP") {
        iacpReplacements.set(`${card.Name}|${card.CardClass}`, card);
      }
    });
    return cards.filter(card => {
      if (card.Variant === "IACP") return true;
      return !iacpReplacements.has(`${card.Name}|${card.CardClass}`);
    });
  };

  // 1. Define deploymentCards and commandCards first
  const deploymentCards = filterIACPCards(
    cardData.filter(card => 
      card.CardGroup === "Deployment" ||
      card.CardGroup === "Skirmish Upgrade" ||
      card.CardGroup === "Auxiliary" ||
      card.CardGroup === "Companion" ||
      card.CardGroup === "Squad Upgrade"
    )
  ).sort((a, b) => b.Cost - a.Cost);

  const commandCards = filterIACPCards(
    cardData.filter(card => card.CardGroup === "Command")
  ).sort((a, b) => b.Cost - a.Cost);

  const skirmishUpgradeCards = filterIACPCards(
    cardData.filter(card => 
      card.CardGroup === "Skirmish Upgrade" ||
      card.CardGroup === "Auxiliary" ||
      card.CardGroup === "Companion"
    )
  );

  const squadUpgradeCards = filterIACPCards(
    cardData.filter(card => card.CardGroup === "Squad Upgrade")
  );

  // Helper: get all traits from selected deployment cards, including Mara Jade's dynamic traits
  const selectedDeploymentTraits = deploymentList.flatMap(card => {
    let traits = card.Traits || [];
    if (card.Name === "Mara Jade") {
      switch (baseFaction) {
        case "Rebel":
          traits = [...traits, "Guardian"];
          break;
        case "Empire":
          traits = [...traits, "Hunter"];
          break;
        case "Mercenary":
          traits = [...traits, "Smuggler"];
          break;
        default:
          // No additional trait for other factions or if baseFaction is not set
          break;
      }
    }
    return traits;
  });

  const selectedDeploymentClasses = deploymentList.map(card => card.CardClass);
  const selectedDeploymentCharacteristics = deploymentList.flatMap(card => card.Characteristics || []);
  const selectedDeploymentNames = deploymentList.map(card => card.Name);

  // Special deployment card checks
  const hasJawaElite = deploymentList.some(card => 
    card.Name === "Jawa Scavenger" && card.CardClass === "Elite"
  );
  const hasAphra = selectedDeploymentNames.includes("Doctor Aphra");
  const hasSaska = selectedDeploymentNames.includes("Saska Teft");
  const hasTempAllianceM = selectedDeploymentNames.includes("Temporary Alliance (M)");
  const hasTempAllianceE = selectedDeploymentNames.includes("Temporary Alliance (E)");

  // Count of selected Mercenary and Rebel deployment cards
  const selectedMercCount = deploymentList.filter(card => card.Faction === "Mercenary").length;
  const selectedRebelCount = deploymentList.filter(card => card.Faction === "Rebel").length;

  // Count selected droid deployment cards
  const excludeNames = (hasAphra ? ["0-0-0", "BT-1"] : []);
  const selectedDroidCount = deploymentList.filter(
    c =>
      c.CardGroup === "Deployment" &&
      (c.Traits || []).includes("Droid") &&
      !excludeNames.includes(c.Name)
  ).length;

  // Check if Taron Malicos is in the selected deployment list
  const hasTaronMalicos = deploymentList.some(c => c.Name === "Taron Malicos");

  // --- DEPLOYMENT CARDS FILTER ---
  const filteredDeploymentCards = deploymentCards.filter(card => {
    if (!autoFilter) return true;

    // 1. Unhide Lando Calrissian if IACP Wing Guard [Elite] is selected
    const hasIacpWingGuardElite = deploymentList.some(
      c => c.Name === "Wing Guard" && c.Variant === "IACP"
    );
    if (
      hasIacpWingGuardElite &&
      card.Name === "Lando Calrissian"
    ) {
      return true;
    }

    // --- Special-case "always unhide" logic ---
    // Doctor Aphra (Mercenary) - 0-0-0 and BT-1 always unhidden if Aphra is selected
    if (
      baseFaction === "Mercenary" &&
      hasAphra &&
      (card.Name === "0-0-0" || card.Name === "BT-1")
    ) {
      return true;
    }

    // Jawa Scavenger [Elite] (Mercenary) - Droid unlock
    if (
      baseFaction === "Mercenary" &&
      hasJawaElite &&
      (card.Traits || []).includes("Droid")
    ) {
      if (card.Faction === "Mercenary" || card.Faction === "Neutral") return true;
      if (
        (card.Faction === "Empire" || card.Faction === "Rebel") &&
        selectedDroidCount < 3
      ) {
        return true;
      }
      return false;
    }

    // Saska Teft (Rebel) - Mercenary unlock until one is selected
    if (
      baseFaction === "Rebel" &&
      hasSaska &&
      card.Faction === "Mercenary" &&
      card.CardGroup === "Deployment" &&
      card.Cost > 0
    ) {
      if (selectedMercCount < 1) return true;
      if (deploymentList.some(c => c.Faction === "Mercenary")) return false;
    }

    // Temporary Alliance (M) (Mercenary) - Rebel unlock until two are selected
    if (
      baseFaction === "Mercenary" &&
      hasTempAllianceM &&
      card.Faction === "Rebel" &&
      card.CardGroup === "Deployment" &&
      card.Cost > 0
    ) {
      if (selectedRebelCount < 2) return true;
      if (deploymentList.filter(c => c.Faction === "Rebel").length >= 2) return false;
    }

    // Temporary Alliance (E) (Imperial) - Mercenary unlock until two are selected
    if (
      baseFaction === "Empire" &&
      hasTempAllianceE &&
      card.Faction === "Mercenary" &&
      card.CardGroup === "Deployment" &&
      card.Cost > 0
    ) {
      if (selectedMercCount < 2) return true;
      if (deploymentList.filter(c => c.Faction === "Mercenary").length >= 2) return false;
    }

    // 3. Unhide Empire/Force User command cards if Taron Malicos is selected
    if (
      hasTaronMalicos &&
      card.Faction === "Empire" &&
      Array.isArray(card.TraitsRequired) &&
      card.TraitsRequired.includes("Force User")
    ) {
      return true;
    }

    // --- Standard base faction filter (except Neutral) ---
    if (card.Faction === baseFaction || card.Faction === "Neutral") {
      // --- UnitsRequired filter ---
      if (card.UnitsRequired && card.UnitsRequired.length > 0) {
        // Only apply UnitsRequired filter to companions, auxiliary, and command cards
        if (card.CardGroup === "Companion" || card.CardGroup === "Auxiliary" || card.CardGroup === "Command") {
          if (!card.UnitsRequired.some(name => selectedDeploymentNames.includes(name))) {
            return false;
          }
        }
      }
      return true;
    }

    // Otherwise, hide
    return false;
  });

  // --- COMMAND CARDS FILTER ---
  const filteredCommandCards = commandCards.filter(card => {
    if (!autoFilter) return true;

    // Doctor Aphra (Mercenary) - 0-0-0 and BT-1 always unhidden if Aphra is selected
    if (
      baseFaction === "Mercenary" &&
      hasAphra &&
      (card.Name === "0-0-0" || card.Name === "BT-1")
    ) {
      return true;
    }

    // Taron Malicos - Unhide Empire Force User command cards
    if (
      hasTaronMalicos &&
      card.Faction === "Empire" &&
      Array.isArray(card.TraitsRequired) &&
      card.TraitsRequired.includes("Force User")
    ) {
      return true;
    }

    // 1. Faction filter (except Neutral)
    if (card.Faction && card.Faction !== "Neutral" && card.Faction !== baseFaction) {
      return false;
    }

    // --- UnitsRequired filter ---
    if (card.UnitsRequired && card.UnitsRequired.length > 0) {
      if (!card.UnitsRequired.some(name => selectedDeploymentNames.includes(name))) {
        return false;
      }
    }

    // --- TraitsRequired filter ---
    if (card.TraitsRequired && card.TraitsRequired.length > 0) {
      const traits = card.TraitsRequired;
      const isAndRequirement = traits[0] === "AND";
      const isNotRequirement = traits[0] === "NOT";
      
      // Helper: get all traits, classes, and characteristics from selected deployment cards
      const allTraitsAndClasses = [
        ...selectedDeploymentTraits,
        ...selectedDeploymentClasses,
        ...selectedDeploymentCharacteristics,
      ];

      if (isAndRequirement) {
        const requiredTraits = traits.slice(1);
        if (!requiredTraits.every(trait =>
          allTraitsAndClasses.includes(trait)
        )) {
          return false;
        }
      } else if (isNotRequirement) {
        const notTraits = traits.slice(1);
        if (notTraits.some(trait =>
          allTraitsAndClasses.includes(trait)
        )) {
          return false; // Hide if any NOT trait/class is present
        }
      } else {
        // OR logic (default)
        if (!traits.some(trait =>
          allTraitsAndClasses.includes(trait)
        )) {
          return false;
        }
      }
    }

    // Otherwise, show
    return true;
  });

  // Keep selected lists sorted by descending cost
  const sortedDeploymentList = sortCards(deploymentList);
  const sortedCommandList = sortCards(commandList);

  const sortedFilteredDeploymentCards = sortCards(filteredDeploymentCards);
  const sortedFilteredCommandCards = sortCards(filteredCommandCards);

  const calculateStats = () => {
    // For activations, only count real deployments
    const validDeployments = deploymentList.filter(card =>
      card.CardGroup === "Deployment" &&
      card.Cost > 0 &&
      !["Loadout", "Form"].includes(card.CardType)
    );

    const figureCount = deploymentList
      .filter(card => card.CardGroup === "Deployment" || card.CardGroup === "Squad Upgrade")
      .reduce((sum, card) => sum + (card.FigureCount || 1), 0);

    const traitCounts = selectedDeploymentTraits.reduce((counts, trait) => {
      counts[trait] = (counts[trait] || 0) + 1;
      return counts;
    }, {});

    // 1. Count the number of IACP Heavy Stormtrooper Elite
    const numIACPHeavyStormtrooperElite = deploymentList.filter(
      card => card.Name === "Heavy Stormtrooper" && card.CardClass === "Elite" && card.Variant === "IACP"
    ).length;

    // 2. Gather all Skirmish and Squad Upgrades with their index in deploymentList
    const upgradesWithIndex = deploymentList
      .map((card, idx) => ({
        ...card,
        _deployIndex: idx
      }))
      .filter(card =>
        (card.CardGroup && card.CardGroup.trim() === "Skirmish Upgrade") ||
        (card.CardGroup && card.CardGroup.trim() === "Squad Upgrade")
      );

    // 3. Sort upgrades by cost descending (for best value)
    const sortedUpgrades = [...upgradesWithIndex].sort((a, b) => (b.Cost || 0) - (a.Cost || 0));

    // 4. Get the deploymentList indices to discount
    const discountedUpgradeIndices = sortedUpgrades
      .slice(0, numIACPHeavyStormtrooperElite)
      .map(card => card._deployIndex);

    // 5. Calculate total cost, discounting only the first N upgrades by their index
    const totalCost = deploymentList.reduce((sum, card, idx) => {
      if (discountedUpgradeIndices.includes(idx)) {
        return sum + Math.max(0, (card.Cost || 0) - 1);
      }
      return sum + (card.Cost || 0);
    }, 0);

    // Check for special skirmish upgrade cards
    const hasNemiksManifesto = deploymentList.some(card => 
      card.Name === "Nemiks Manifesto"
    );
    const hasBalanceOfTheForce = deploymentList.some(card => 
      card.Name === "Balance of the Force"
    );

    // Calculate command limits based on special cards
    const commandCardLimit = hasNemiksManifesto ? 18 : 15;
    const commandPointsLimit = hasBalanceOfTheForce ? 18 : 15;

    // Calculate command card count, allow it to go over the limit
    const commandCardCount = commandList.length;

    return {
      totalCost: `${totalCost}/40`,
      deploymentCount: validDeployments.length,
      totalHealth: deploymentList.reduce((sum, card) => 
        sum + ((card.Health || 0) * (card.FigureCount || 1)), 0),
      figureCount,
      traitCounts,
      commandCount: `${commandCardCount}/${commandCardLimit}`,
      commandPoints: `${commandList.reduce((sum, card) => sum + (card.Cost || 0), 0)}/${commandPointsLimit}`,
      commandCardLimit,
      commandPointsLimit
    };
  };

  const stats = calculateStats();

  // Filter out unwanted traits from traitCounts for display
  const TRAITS_TO_EXCLUDE = ["Massive", "Large", "Melee", "Mobile"];
  function getTraitAbbreviations(traitCounts) {
    const traitIcons = [];
    for (const [trait, count] of Object.entries(traitCounts)) {
      let icon;
      switch(trait.toLowerCase()) {
        case 'brawler': icon = BrawlerIcon; break;
        case 'creature': icon = CreatureIcon; break;
        case 'droid': icon = DroidIcon; break;
        case 'force user': icon = ForceUserIcon; break;
        case 'guardian': icon = GuardianIcon; break;
        case 'heavy weapon': icon = HeavyWeaponIcon; break;
        case 'hunter': icon = HunterIcon; break;
        case 'leader': icon = LeaderIcon; break;
        case 'smuggler': icon = SmugglerIcon; break;
        case 'spy': icon = SpyIcon; break;
        case 'technician': icon = TechnicianIcon; break;
        case 'trooper': icon = TrooperIcon; break;
        case 'vehicle': icon = VehicleIcon; break;
        case 'wookiee': icon = WookieeIcon; break;
        default: icon = null; // Fallback for unknown traits
      }
      traitIcons.push({ icon, count, trait });
    }
    // Sort traits by count in descending order
    return traitIcons.sort((a, b) => b.count - a.count);
  }

  const handleToggleCards = () => {
    setShowDeployment((prev) => !prev);
  };

  const handleFactionToggle = (faction) => {
    if (activeFactions.includes(faction)) {
      setActiveFactions(activeFactions.filter(f => f !== faction));
    } else {
      setActiveFactions([...activeFactions, faction]);
    }
  };

  const handleSaveArmyList = async () => {
    if (!armyName.trim()) {
      alert("Please enter an army name before saving.");
      return;
    }

    const allSelectedCards = [...deploymentList, ...commandList];

    // Use standard prefix and faction in square brackets
    const prefix = "IA List";
    const faction = baseFaction;
    // Check for any existing IA List prefix with any faction
    const prefixPattern = new RegExp(`^IA List \\[[^\\]]+\\] - `, 'i');

    // Only add prefix if not already present
    let finalArmyName = armyName.trim();
    if (!prefixPattern.test(finalArmyName)) {
      finalArmyName = `${prefix} [${faction}] - ${finalArmyName}`;
    } else {
      // If prefix exists but faction is different, update the faction
      finalArmyName = finalArmyName.replace(/^IA List \[[^\]]+\] - /i, `${prefix} [${faction}] - `);
    }

    const cards_to_process = allSelectedCards.map(card => {
      const vassalNameValue = card.VassalName || card.Name; 
      const cardGroupValue = card.CardGroup || "Unknown";

      if (!card.VassalName) {
        console.warn(`Card ID: ${card.ID}, Name: '${card.Name}' is missing VassalName. Falling back to Name for save.`);
      }
      if (!card.CardGroup) {
        console.warn(`Card ID: ${card.ID}, Name: '${card.Name}' is missing CardGroup. Setting to 'Unknown' for save.`);
      }
      
      return {
        VassalName: vassalNameValue, // Use VassalName as the key
        CardGroup: cardGroupValue     // Keep CardGroup, as the script uses it for directory mapping
      };
    });

    const payload = {
      armyName: finalArmyName,
      cards: cards_to_process
    };

    try {
      const response = await fetch('/api/save-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `${finalArmyName}.vsav`;

        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorResult = await response.json();
        alert(`Error saving army list: ${errorResult.error || response.statusText}`);
        console.error("Save failed:", errorResult);
      }
    } catch (error) {
      alert(`Network or other error saving army list: ${error.message}`);
      console.error('Save fetch error:', error);
    }
  };

  const handleLoadArmyList = (fileContent, fileName) => {
    if (!cardData || cardData.length === 0) { // Use cardData (from cards.json)
      console.error("Card data (cards.json) not loaded yet or is empty.");
      alert("Error: Card data not loaded. Please try again in a moment.");
      return;
    }

    const loadedArmyName = fileName.replace(/\.vsav$/i, "");
    setArmyName(loadedArmyName);

    const trimmedContent = fileContent.replace(/^\s+/, "");
    if (!trimmedContent.startsWith("DECK")) {
      alert("Invalid .vsav file format: Missing 'DECK' prefix.");
      return;
    }

    // Remove 'DECK' and an optional tab after it
    let contentWithoutPrefix = trimmedContent.substring(4); // Remove 'DECK'
    if (contentWithoutPrefix.startsWith("\t")) {
      contentWithoutPrefix = contentWithoutPrefix.substring(1); // Remove tab if present
    }
    const cardDataSegments = contentWithoutPrefix.split("\x1b"); 

    const loadedDeployment = [];
    const loadedCommand = [];

    // Function to extract image filename from content
    const extractImageFilename = (content) => {
      // First try to find .jpg files
      const jpgMatches = content.match(/[^;]+\.jpg/g) || [];
      const validJpgMatches = jpgMatches.filter(match => 
        !match.toLowerCase().includes('cardback') && 
        !match.toLowerCase().includes('promo')
      );
      
      if (validJpgMatches.length > 0) {
        return validJpgMatches[0];
      }

      // If no valid .jpg found, try .png files
      const pngMatches = content.match(/[^;]+\.png/g) || [];
      const validPngMatches = pngMatches.filter(match => 
        !match.toLowerCase().includes('cardback') && 
        !match.toLowerCase().includes('promo')
      );
      
      return validPngMatches.length > 0 ? validPngMatches[0] : null;
    };

    cardDataSegments.forEach(segment => {
      if (!segment || segment.trim() === "") {
        return; 
      }

      const vassalID = extractImageFilename(segment);
      if (vassalID) {
        // Find all cards in cardData (from cards.json) matching the VassalID
        const candidateCards = cardData.filter(card => card.VassalID === vassalID);

        if (candidateCards.length > 0) {
          let cardToLoad = null;

          if (iacpMode === "IACP") {
            cardToLoad = candidateCards.find(c => c.Variant === "IACP") || 
                         candidateCards.find(c => c.Variant === "FFG");
            // If neither IACP nor FFG, cardToLoad remains null, card is skipped.
          } else if (iacpMode === "FFG") {
            // Prefer FFG, then IACP, then any card
            cardToLoad = candidateCards.find(c => c.Variant === "FFG") ||
                         candidateCards.find(c => c.Variant === "IACP") ||
                         candidateCards[0];
          } else { // iacpMode === "ALL"
            // Prefer IACP, then FFG, then the first card found for this VassalID
            cardToLoad = candidateCards.find(c => c.Variant === "IACP") || 
                         candidateCards.find(c => c.Variant === "FFG") || 
                         candidateCards[0];
          }

          if (cardToLoad) {
            if (cardToLoad.CardGroup === "Command") {
              loadedCommand.push(cardToLoad); // Add command card, no limit
            } else if (["Deployment", "Skirmish Upgrade", "Squad Upgrade", "Auxiliary", "Companion"].includes(cardToLoad.CardGroup)) {
              loadedDeployment.push(cardToLoad); // Add deployment card, allowing duplicates from .vsav
            } else {
              // console.warn(`Unknown card group for loaded card: ${cardToLoad.Name}, ${cardToLoad.CardGroup}`);
            }
          } else {
            // console.warn(`VassalID '${vassalID}' found candidates in cards.json, but no suitable card selected based on iacpMode '${iacpMode}'. Candidates: ${candidateCards.map(c=>c.Name + '[' + c.Variant + ']').join(', ')}`);
          }
        } else {
          // console.warn(`Card with VassalID '${vassalID}' not found in cardData (cards.json).`);
        }
      } else {
        // console.warn("Could not extract VassalID from .vsav segment:", segment.substring(0, 50));
      }
    });

    setDeploymentList(sortCards(loadedDeployment));
    setCommandList(sortCards(loadedCommand));

    if (loadedDeployment.length > 0) {
      const factionCounts = loadedDeployment.reduce((acc, card) => {
        if (card.Faction && baseFactions.includes(card.Faction)) {
          acc[card.Faction] = (acc[card.Faction] || 0) + 1;
        }
        return acc;
      }, {});
  
      let majorityFaction = null;
      let maxCount = 0;
      for (const faction in factionCounts) {
        if (factionCounts[faction] > maxCount) {
          maxCount = factionCounts[faction];
          majorityFaction = faction;
        }
      }
      if (majorityFaction) {
        setBaseFaction(majorityFaction);
      } else if (loadedDeployment[0] && baseFactions.includes(loadedDeployment[0].Faction)) {
        setBaseFaction(loadedDeployment[0].Faction);
      }
    }
  };

  const handleClearAll = () => {
    setDeploymentList([]);
    setCommandList([]);
    setArmyName("");
    setSearch("");
    setSelectedTraits([]);
    setActiveFactions(["Rebel", "Empire", "Mercenary", "Neutral"]);
    setSelectedCard(null);
    setBaseFaction("Rebel");
    setAutoFilter(true);
    setIacpMode("IACP");
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    if (showCardEditor) {
      setEditCard(card); // This will populate the card editor with the clicked card's details
    }
  };

  const handleCardEditorToggle = () => {
    if (!showCardEditor && !isCardEditorAuthenticated) {
      setShowPasswordPrompt(true);
    } else {
      setShowCardEditor(!showCardEditor);
      if (!showCardEditor) {
        setIsCardEditorAuthenticated(false);
      }
    }
  };

  const handlePasswordSubmit = () => {
    setIsCardEditorAuthenticated(true);
    setShowPasswordPrompt(false);
    setShowCardEditor(true);
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
  };

  return (
    <div className="app-container">
      {/*
      <div className="title-with-logo">
        <img src={IALogo} alt="Imperial Assault Logo" className="ia-logo" />
        <h1 className="title">Skirmish List Builder</h1>
      </div>
      */}
      
      {/* Top buttons container */}
      <div className="top-buttons">
        <div className="toggle-buttons-container">
          <button
            className="faction-cycle-button"
            onClick={() => {
              const idx = baseFactions.indexOf(baseFaction);
              const nextFaction = baseFactions[(idx + 1) % baseFactions.length];
              setBaseFaction(nextFaction);
            }}
          >
            FACTION
            <img src={factionIcons[baseFaction]} alt={baseFaction} className="faction-cycle-logo" />
          </button>
          <button
            className="auto-filter-button"
            onClick={() => setAutoFilter(a => !a)}
          >
            <span className={autoFilter ? "auto-active" : ""}>AUTO</span>
          </button>
          <button
            className="toggle-switch-button"
            onClick={handleToggleCards}
          >
            <span className={showDeployment ? "toggle-active" : ""}>DEP</span>
            <span style={{ margin: "0 6px" }}>|</span>
            <span className={!showDeployment ? "toggle-active" : ""}>CMD</span>
          </button>
          <div className="faction-filters">
            {factions.map(faction => (
              <button
                key={faction}
                className={`faction-filter-button${activeFactions.includes(faction) ? " active" : ""}`}
                onClick={() => handleFactionToggle(faction)}
              >
                <img src={factionIcons[faction]} alt={faction} className="faction-icon" />
              </button>
            ))}
          </div>
          <button
            className="toggle-switch-button"
            onClick={() => {
              setIacpMode(prev => prev === "FFG" ? "IACP" : prev === "IACP" ? "ALL" : "FFG");
            }}
          >
            <span className={iacpMode === "FFG" ? "toggle-active" : ""}>FFG</span>
            <span style={{ margin: "0 6px" }}>|</span>
            <span className={iacpMode === "IACP" ? "toggle-active" : ""}>IACP</span>
            <span style={{ margin: "0 6px" }}>|</span>
            <span className={iacpMode === "ALL" ? "toggle-active" : ""}>ALL</span>
          </button>
          <input
            className="search-box"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards..."
          />
          <div className="trait-filters" ref={traitsDropdownRef}>
            <button 
              className="traits-button"
              onClick={() => setShowTraitsGrid(prev => !prev)}
            >
              <span className={selectedTraits.length > 0 ? 'active' : ''}>TRAITS</span>
            </button>
            {showTraitsGrid && (
              <div className="trait-grid-dropdown">
                <div className="trait-grid">
                  {TRAIT_NAMES.map(trait => {
                    let icon;
                    switch(trait.toLowerCase()) {
                      case 'brawler': icon = BrawlerIcon; break;
                      case 'creature': icon = CreatureIcon; break;
                      case 'droid': icon = DroidIcon; break;
                      case 'force user': icon = ForceUserIcon; break;
                      case 'guardian': icon = GuardianIcon; break;
                      case 'heavy weapon': icon = HeavyWeaponIcon; break;
                      case 'hunter': icon = HunterIcon; break;
                      case 'leader': icon = LeaderIcon; break;
                      case 'smuggler': icon = SmugglerIcon; break;
                      case 'spy': icon = SpyIcon; break;
                      case 'technician': icon = TechnicianIcon; break;
                      case 'trooper': icon = TrooperIcon; break;
                      case 'vehicle': icon = VehicleIcon; break;
                      case 'wookiee': icon = WookieeIcon; break;
                      default: icon = null; // Fallback for unknown traits
                    }
                    return (
                      <button
                        key={trait}
                        className={`trait-button ${selectedTraits.includes(trait) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTraits(prev => 
                            prev.includes(trait) 
                              ? prev.filter(t => t !== trait)
                              : [...prev, trait]
                          );
                        }}
                        title={trait}
                      >
                        <img src={icon} alt={trait} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            className="army-name-input"
            placeholder="Army name..."
            value={armyName}
            onChange={e => setArmyName(e.target.value)}
            style={{ width: 150 }}
          />
          <button className="army-list-button save-button" onClick={handleSaveArmyList}>
            Save
          </button>
          <button className="army-list-button load-button" onClick={() => document.getElementById('vsavFileInput').click()}>
            Load
          </button>
          <button
            className="army-list-button clear-button"
            onClick={handleClearAll}
          >
            Clear
          </button>
          <button
            className="army-list-button card-editor-button"
            onClick={handleCardEditorToggle}
          >
            Editor
          </button>
          <input 
            type="file" 
            id="vsavFileInput" 
            style={{ display: 'none' }} 
            accept=".vsav" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  handleLoadArmyList(e.target.result, file.name);
                };
                reader.readAsText(file);
              }
            }} 
          />
        </div>
      </div>

      <div className="main-content">
        {/* Column 1: Card List */}
        <div className="left-panel">
          <div className="section-title-box" style={{ textAlign: 'left' }}>
            <span style={{ textTransform: 'uppercase' }}>{showDeployment ? 'Available Deployment' : 'Available Command'}</span>
          </div>
          <div className="cards-container">
            <CardList
              cards={showDeployment ? sortedFilteredDeploymentCards : sortedFilteredCommandCards}
              onAdd={card => showDeployment 
                ? setDeploymentList([...deploymentList, card])
                : setCommandList([...commandList, card])
              }
              list={showDeployment ? deploymentList : commandList}
              onSelect={handleCardClick}
              type={showDeployment ? "deployment" : "command"}
              iacpLogo={IACPLogo}
              factionIcons={factionIcons}
              activeFactions={activeFactions}
              search={search}
              selectedTraits={selectedTraits}
              onCardClick={handleCardClick}
              showCardEditor={showCardEditor}
            />
          </div>
        </div>

        {/* Column 2: Card Preview */}
        <div className="preview-panel">
          <div className={`card-preview ${selectedCard?.CardGroup === "Auxiliary" ? "auxiliary" : ""}`}>
            <CardPreview key={imageRefreshKey} card={selectedCard} />
          </div>
          {/* Only show traits under card preview */}
          {!showCardEditor && (
            <div className="deployment-traits-row">
              <span>
                {getTraitAbbreviations(stats.traitCounts).map(({ icon, count, trait }, index) => (
                  <span key={index} style={{ marginRight: '4px', whiteSpace: 'nowrap' }} title={trait}>
                    <img src={icon} alt={trait} style={{ height: '20px', width: 'auto', verticalAlign: 'middle' }} />
                    <span style={{ marginLeft: '2px' }}>{count}</span>
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* Column 3: Selected List and Stats */}
        <div className="right-panel">
          {!showCardEditor && (
            <>
              <ListSection
                title={!showCardEditor ? "Selected Deployment" : null}
                cards={sortedDeploymentList}
                onRemove={card => setDeploymentList(deploymentList.filter((c, i) => i !== deploymentList.indexOf(card)))}
                onSelect={handleCardClick}
                factionIcons={factionIcons}
                iacpLogo={IACPLogo}
                deploymentStats={!showCardEditor ? {
                  activations: stats.deploymentCount,
                  cost: stats.totalCost,
                  figures: stats.figureCount,
                  health: stats.totalHealth,
                  traits: getTraitAbbreviations(stats.traitCounts)
                } : null}
                commandCards={commandCards}
                skirmishUpgradeCards={skirmishUpgradeCards}
                squadUpgradeCards={squadUpgradeCards}
                showIACP={false}
                onAddCommandCard={card => setCommandList([...commandList, card])}
                onAddSkirmishUpgrade={card => setDeploymentList([...deploymentList, card])}
                commandList={commandList}
                deploymentList={deploymentList}
                allDeploymentCards={deploymentCards}
                onAddDeploymentCard={card => setDeploymentList([...deploymentList, card])}
                onAddMultipleDeploymentCards={cards => {
                  // Only add cards that are not already present
                  const newCards = cards.filter(
                    card => !deploymentList.some(d => d.ID === card.ID) 
                  );
                  if (newCards.length > 0) {
                    setDeploymentList([...deploymentList, ...newCards]);
                  }
                }}
                onAddMultipleCommandCards={cards => {
                  // Only add cards that are not already present
                  const newCards = cards.filter(
                    card => !commandList.some(c => c.ID === card.ID) 
                  );
                  if (newCards.length > 0) {
                    setCommandList([...commandList, ...newCards]);
                  }
                }}
                allCommandCards={commandCards}
                baseFaction={baseFaction}
              />
              <ListSection
                title={!showCardEditor ? "Selected Command" : null}
                cards={sortedCommandList}
                onRemove={card => setCommandList(commandList.filter((c, i) => i !== commandList.indexOf(card)))}
                onSelect={handleCardClick}
                factionIcons={factionIcons}
                iacpLogo={IACPLogo}
                commandStats={!showCardEditor ? {
                  cmdCards: stats.commandCount,
                  cmdPoints: stats.commandPoints,
                  cmdCardLimit: stats.commandCardLimit,
                  cmdPointsLimit: stats.commandPointsLimit
                } : null}
                onAddCommonCommandCards={handleAddCommonCommandCards}
                showAddCommonButton={true}
              />
            </>
          )}
          {showCardEditor && (
            <CardEditorInline
              cardData={cardData}
              setCardData={setCardData}
              editCard={editCard}
              setEditCard={setEditCard}
              setShowCardEditor={setShowCardEditor}
              setSelectedCard={setSelectedCard}
              imageRefreshKey={imageRefreshKey}
              setImageRefreshKey={setImageRefreshKey}
            />
          )}
        </div>
      </div>

      {showPasswordPrompt && (
        <PasswordPrompt
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      )}
    </div>
  );
}

export default App;