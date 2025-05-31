import React, { useRef, useState, useEffect } from "react";
import Select from "react-select";

const FACTIONS = ["Rebel", "Empire", "Mercenary", "Neutral"];
const CARD_GROUPS = [
  "Deployment", "Skirmish Upgrade", "Companion", "Auxiliary", "Squad Upgrade", "Command"
];
const TRAIT_OPTIONS = [
  "Wookie", "Spy", "Technician", "Trooper", "Vehicle", "Heavy Weapon", "Hunter", "Leader", "Smuggler", "Creature", "Droid", "Force User", "Guardian", "Brawler"
].map(trait => ({ value: trait, label: trait }));

const CHARACTERISTIC_OPTIONS = [
  "Ranged", "Melee", "Small", "Large", "Massive", "Mobile", "Reach"
].map(c => ({ value: c, label: c }));

const customSelectStyles = {
  menu: (provided) => ({
    ...provided,
    color: '#000',
    backgroundColor: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    color: '#000',
    backgroundColor: state.isFocused ? '#e0e0e0' : '#fff',
    fontWeight: 'bold',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#000',
  }),
  input: (provided) => ({
    ...provided,
    color: '#000',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#888',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#000',
  }),
};

// For 100px wide dropdowns (CardClass, Color)
const compactSelectStyles = {
  menu: (provided) => ({
    ...provided,
    color: '#000',
    backgroundColor: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    color: '#000',
    backgroundColor: state.isFocused ? '#e0e0e0' : '#fff',
    fontWeight: 'bold',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#000',
  }),
  input: (provided) => ({
    ...provided,
    color: '#000',
    margin: 0,
    padding: 0,
    height: 32,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#888',
  }),
  control: (provided) => ({
    ...provided,
    minWidth: 100,
    width: 100,
    fontSize: '1rem',
    minHeight: 32,
    height: 32,
    padding: 0,
    margin: 0,
    fontFamily: 'Nesobrite Condensed Bold, Arial, sans-serif',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    height: 32,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 2,
    fontSize: '14px',
    width: 18,
    height: 18,
    minHeight: 18,
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: 2,
    fontSize: '14px',
    width: 18,
    height: 18,
    minHeight: 18,
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: 18,
    minHeight: 18,
  }),
};

// For 120px wide dropdowns (CardGroup, Faction)
const wideSelectStyles = {
  ...compactSelectStyles,
  control: (provided) => ({
    ...provided,
    minWidth: 120,
    width: 120,
    fontSize: '1rem',
    minHeight: 32,
    height: 32,
    padding: 0,
    margin: 0,
    fontFamily: 'Nesobrite Condensed Bold, Arial, sans-serif',
  }),
};

// For CardGroup only
const cardGroupSelectStyles = {
  ...compactSelectStyles,
  control: (provided) => ({
    ...provided,
    minWidth: 120,
    width: 120,
    fontSize: '1rem',
    minHeight: 32,
    height: 32,
    padding: 0,
    margin: 0,
    fontFamily: 'Nesobrite Condensed Bold, Arial, sans-serif',
  }),
};

const traitsSelectStyles = {
  menu: (provided) => ({
    ...provided,
    color: '#000',
    backgroundColor: '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    color: '#000',
    backgroundColor: state.isFocused ? '#e0e0e0' : '#fff',
    fontWeight: 'bold',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#000',
  }),
  input: (provided) => ({
    ...provided,
    color: '#000',
    margin: 0,
    padding: 0,
    minHeight: 32,
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#888',
  }),
  control: (provided, state) => ({
    ...provided,
    minWidth: 180,
    width: 180,
    fontSize: '1rem',
    minHeight: 32,
    height: 'auto',
    padding: 0,
    margin: 0,
    fontFamily: 'Nesobrite Condensed Bold, Arial, sans-serif',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    minHeight: 32,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  }),
  multiValue: (provided) => ({
    ...provided,
    margin: '2px 4px 2px 0',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 2,
    fontSize: '14px',
    width: 18,
    height: 18,
    minHeight: 18,
    svg: {
      width: 14,
      height: 14,
    }
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: 2,
    fontSize: '14px',
    width: 18,
    height: 18,
    minHeight: 18,
    svg: {
      width: 14,
      height: 14,
    }
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: 18,
    minHeight: 18,
  }),
};

function getNextId(cardGroup, allCards) {
  if (!cardGroup) return "";
  let groupFilter;
  if (
    cardGroup === "Deployment" ||
    cardGroup === "Skirmish Upgrade" ||
    cardGroup === "Companion" ||
    cardGroup === "Auxiliary" ||
    cardGroup === "Squad Upgrade"
  ) {
    groupFilter = (c) =>
      c.CardGroup === "Deployment" ||
      c.CardGroup === "Skirmish Upgrade" ||
      c.CardGroup === "Companion" ||
      c.CardGroup === "Auxiliary" ||
      c.CardGroup === "Squad Upgrade";
  } else if (cardGroup === "Command") {
    groupFilter = (c) => c.CardGroup === "Command";
  } else {
    return "";
  }
  const groupCards = allCards.filter(groupFilter);
  const maxId = groupCards.reduce(
    (max, c) => (Number(c.ID) > max ? Number(c.ID) : max),
    0
  );
  return String(maxId + 1);
}

// Helper to construct image name
function getAutoImageName(card) {
  if (!card?.Name) return '';
  let name = card.Name;
  let suffixes = [];
  if (card.CardClass === 'Elite' || card.CardClass === 'Regular') {
    suffixes.push(`[${card.CardClass}]`);
  }
  if (card.Variant === 'IACP') {
    suffixes.push(`[IACP]`);
  }
  return `${name}${suffixes.length ? ' ' + suffixes.join(' ') : ''}.png`;
}

function CardEditorInline({ cardData, setCardData, editCard, setEditCard, setShowCardEditor, setSelectedCard, imageRefreshKey, setImageRefreshKey }) {
  const safeEditCard = editCard || {};
  const fileInputRef = useRef();
  const allTextRef = useRef();
  const vassalFileInputRef = useRef();

  const isCardSaved = (card) => {
    return cardData.some(existingCard => existingCard.ID === card.ID);
  };

  useEffect(() => {
    setEditCard({
      ID: getNextId("Deployment", cardData),
      CardGroup: "",
      Name: "",
      Faction: "Rebel",
      Cost: 0,
      Health: 0,
      Speed: 0,
      FigureCount: 1,
      Traits: [],
      Image: "",
      CardClass: "",
      TraitsRequired: [],
      Color: "",
      UnitsRequired: [],
      Max: 1,
      AllText: "",
      Variant: "IACP",
    });
  }, []); // Empty dependency array means this runs once on mount

  // When "New Card" is clicked
  function handleNewCard(type) {
    const lastId = Math.max(
      0,
      ...cardData
        .filter(c => c.CardGroup === type)
        .map(c => parseInt(c.ID, 10) || 0)
    );
    setEditCard({
      ID: lastId + 1,
      CardGroup: type,
      Name: "",
      Faction: "Rebel",
      Cost: 0,
      Health: 0,
      Speed: 0,
      FigureCount: 1,
      Traits: [],
      Image: "",
      CardClass: "",
      TraitsRequired: [],
      Color: "",
      UnitsRequired: [],
      Max: 1,
      AllText: "",
      Variant: "IACP",
    });
  }

  const handleFieldChange = (field, value) => {
    let updatedCard = { ...safeEditCard, [field]: value };
    if (field === "ID") {
      updatedCard.ID = Number(value);
    }
    if (field === "CardGroup") {
      updatedCard.ID = getNextId(value, cardData);
    }
    if (field === "CardGroup" && value === "Command") {
      updatedCard.CardClass = null;
      updatedCard.FigureCount = null;
      updatedCard.Health = null;
      updatedCard.Speed = null;
      updatedCard.Color = null;
    }
    setEditCard(updatedCard);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Check required fields
    if (!editCard.CardGroup || editCard.CardGroup === "") {
      alert("Card Group is required");
      return;
    }
    if (!editCard.CardClass && editCard.CardGroup !== "Command") {
      alert("Card Class is required");
      return;
    }
    if (!editCard.Name || editCard.Name.trim() === "") {
      alert("Name is required");
      return;
    }
    if (!editCard.Variant || editCard.Variant === "") {
      alert("Variant is required");
      return;
    }
    
    // Generate VassalName and ImageName
    let vassalName = editCard.Name || '';
    if (editCard.CardClass === 'Regular' || editCard.CardClass === 'Elite') {
      vassalName += ` [${editCard.CardClass}]`;
    }
    const imageName = getAutoImageName(editCard);
    
    // Prepare card with updated VassalName, ImageName and without Image
    const { Image, ...cardToSave } = { 
      ...editCard, 
      VassalName: vassalName,
      ImageName: imageName
    };

    const payload = {
      operation: 'save',
      card: cardToSave,
      cardId: cardToSave.ID
    };

    try {
      const response = await fetch('/api/save-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local card data (add or update, then sort by ID)
        let updatedCards;
        const exists = cardData.some(card => card.ID === cardToSave.ID);
        if (exists) {
          updatedCards = cardData.map(card => card.ID === cardToSave.ID ? cardToSave : card);
        } else {
          updatedCards = [...cardData, cardToSave];
        }
        updatedCards.sort((a, b) => parseInt(a.ID, 10) - parseInt(b.ID, 10));
        setCardData(updatedCards);
        alert(`Card saved successfully! (ID: ${cardToSave.ID}, Name: ${cardToSave.Name})`);
      } else {
        console.error('Failed to save card:', result.error);
        alert('Failed to save card: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Error saving card: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this card? (ID: ${editCard.ID}, Name: ${editCard.Name})`)) {
      return;
    }
    // Use ImageName for deletion, construct it if not present
    let imageName = editCard.ImageName;
    if (!imageName) {
      imageName = getAutoImageName(editCard);
    }
    const targetDir = (editCard.CardGroup === 'Command') ? 'command' : 'deployment';
    // Request backend to delete image
    try {
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName, targetDir }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to delete image:', result.error);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
    // Request backend to delete Vassal .txt file
    try {
      let vassalName = editCard.VassalName;
      // Fallback only if VassalName is missing (should be rare)
      if (!vassalName && editCard.Name) {
        vassalName = editCard.Name;
        if (editCard.CardClass === 'Regular' || editCard.CardClass === 'Elite') {
          vassalName += ` [${editCard.CardClass}]`;
        }
        vassalName = vassalName.trim();
      }
      const response = await fetch('/api/delete-vassal-txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vassalName,
          cardGroup: editCard.CardGroup
        }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to delete Vassal file:', result.error);
      }
    } catch (err) {
      console.error('Error deleting Vassal file:', err);
    }
    // Now proceed with card deletion and state clearing
    const payload = {
      operation: 'delete',
      cardId: editCard.ID
    };
    try {
      const response = await fetch('/api/delete-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        const updatedCards = cardData.filter(card => card.ID !== editCard.ID);
        setCardData(updatedCards);
        alert(`Card deleted successfully! (ID: ${editCard.ID}, Name: ${editCard.Name})`);
        // Reset to new card state after successful deletion
        setEditCard({
          ID: getNextId("Deployment", updatedCards),
          CardGroup: "",
          Name: "",
          Faction: "Rebel",
          Cost: 0,
          Health: 0,
          Speed: 0,
          FigureCount: 1,
          Traits: [],
          Image: "",
          CardClass: "",
          TraitsRequired: [],
          Color: "",
          UnitsRequired: [],
          Max: 1,
          AllText: "",
          Variant: "IACP",
        });
        if (typeof setSelectedCard === 'function') setSelectedCard(null);
      } else {
        console.error('Failed to delete card:', result.error);
        alert('Failed to delete card: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Error deleting card: ' + error.message);
    }
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'png') {
        alert('Only PNG files are allowed.');
        return;
      }
      const imageName = getAutoImageName(editCard);
      const targetDir = (editCard.CardGroup === 'Command') ? 'command' : 'deployment';
      const formData = new FormData();
      const renamedFile = new File([file], imageName, { type: file.type });
      formData.append('image', renamedFile);
      formData.append('targetDir', targetDir);
      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          alert('Image uploaded successfully!');
          setImageRefreshKey(prev => prev + 1); // Trigger CardPreview refresh
        } else {
          alert('Image upload failed: ' + result.error);
        }
      } catch (err) {
        alert('Image upload error: ' + err.message);
      }
    }
  };

  const handleVassalFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        let text = event.target.result;
        // Remove 'DECK' and tab from the start
        if (text.startsWith('DECK\t')) {
          text = text.substring(5); // Remove 'DECK' and tab
        }
        // Ensure VassalName is present
        let vassalName = editCard.VassalName;
        if (!vassalName) {
          vassalName = editCard.Name || '';
          if (editCard.CardClass === 'Regular' || editCard.CardClass === 'Elite') {
            vassalName += ` [${editCard.CardClass}]`;
          }
          vassalName = vassalName.trim();
        }
        // Prepare payload
        const payload = {
          vassalText: text,
          vassalName: vassalName,
          cardGroup: editCard.CardGroup
        };
        try {
          const response = await fetch('/api/upload-vassal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (result.success) {
            alert('Vassal file uploaded successfully! VassalID: ' + result.vassalID);
          } else {
            alert('Vassal file upload failed: ' + JSON.stringify(result));
          }
        } catch (err) {
          alert('Vassal file upload error: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="card-editor-inline">
      <div className="form-row" style={{ marginBottom: "16px", gap: "8px" }}>
        <button type="button" onClick={() => handleNewCard("Deployment")} style={{ padding: "4px 8px" }}>New</button>
        <button type="submit" onClick={handleSave} style={{ padding: "4px 8px" }}>Save</button>
        <button type="button" onClick={handleDelete} style={{ padding: "4px 8px" }}>Delete</button>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          style={{ padding: "4px 8px" }}
          disabled={!isCardSaved(safeEditCard)}
          title={!isCardSaved(safeEditCard) ? "Save card before uploading image" : "Upload Image"}
        >
          Upload Image
        </button>
        <input
          type="file"
          accept="image/png"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => vassalFileInputRef.current.click()}
          style={{ padding: "4px 8px" }}
          disabled={!isCardSaved(safeEditCard)}
          title={!isCardSaved(safeEditCard) ? "Save card before uploading Vassal file" : "Upload Vassal"}
        >
          Upload Vassal
        </button>
        <input
          type="file"
          ref={vassalFileInputRef}
          style={{ display: "none" }}
          onChange={handleVassalFileUpload}
        />
        <button type="button" onClick={() => setShowCardEditor(false)} style={{ padding: "4px 8px" }}>Close Editor</button>
      </div>
      <form onSubmit={handleSave}>
        <div className="form-row">
          <div style={{ flex: "none", maxWidth: "60px" }}>
            <label>ID:</label>
            <input
              type="text"
              value={safeEditCard?.ID ?? getNextId(safeEditCard?.CardGroup, cardData)}
              readOnly
              size={4}
              className="id-input"
              style={{ background: "#444", color: "#fff", width: "48px", textAlign: "center", margin: 0, padding: 0 }}
            />
          </div>
          <div style={{ flex: "none", maxWidth: "120px", marginLeft: "8px" }}>
            <label>CardGroup:</label>
            <Select
              value={
                [{ value: "", label: "Select" }]
                  .concat(CARD_GROUPS.map(g => ({ value: g, label: g })))
                  .find(opt => opt.value === (safeEditCard?.CardGroup ?? ""))
              }
              onChange={selected => handleFieldChange("CardGroup", selected ? selected.value : "")}
              options={[
                { value: "", label: "Select" },
                ...CARD_GROUPS.map(g => ({ value: g, label: g }))
              ]}
              styles={cardGroupSelectStyles}
              placeholder="Select"
              isDisabled={isCardSaved(safeEditCard)}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, maxWidth: "calc(100% - 60px - 120px - 24px)" }}>
            <label>Name:</label>
            <input
              type="text"
              value={safeEditCard?.Name ?? ""}
              onChange={e => handleFieldChange("Name", e.target.value)}
              placeholder="Enter card name"
              style={{ width: "100%" }}
              readOnly={isCardSaved(safeEditCard)}
            />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>CardClass:</label>
            <Select
              value={
                [{ value: "", label: "Select" }, { value: "Unique", label: "Unique" }, { value: "Elite", label: "Elite" }, { value: "Regular", label: "Regular" }]
                  .find(opt => opt.value === (safeEditCard?.CardClass ?? ""))
              }
              onChange={selected => handleFieldChange("CardClass", selected ? selected.value : "")}
              options={[
                { value: "", label: "Select" },
                { value: "Unique", label: "Unique" },
                { value: "Elite", label: "Elite" },
                { value: "Regular", label: "Regular" }
              ]}
              styles={compactSelectStyles}
              placeholder="Select"
              isDisabled={safeEditCard?.CardGroup === "Command" || isCardSaved(safeEditCard)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Color:</label>
            <Select
              value={
                [
                  { value: "", label: "Select" },
                  { value: "Red", label: "Red" },
                  { value: "Gray", label: "Gray" },
                  { value: "Green", label: "Green" },
                  { value: "Yellow", label: "Yellow" }
                ].find(opt => (safeEditCard?.Color ?? "").toLowerCase() === opt.value.toLowerCase())
              }
              onChange={selected => handleFieldChange("Color", selected ? selected.value : "")}
              options={[
                { value: "", label: "Select" },
                { value: "Red", label: "Red" },
                { value: "Gray", label: "Gray" },
                { value: "Green", label: "Green" },
                { value: "Yellow", label: "Yellow" }
              ]}
              styles={compactSelectStyles}
              placeholder="Select"
              isDisabled={safeEditCard?.CardGroup === "Command"}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Faction:</label>
            <Select
              value={
                [{ value: "", label: "Select" }, ...FACTIONS.map(f => ({ value: f, label: f }))]
                  .find(opt => opt.value === (safeEditCard?.Faction ?? ""))
              }
              onChange={selected => handleFieldChange("Faction", selected ? selected.value : "")}
              options={[
                { value: "", label: "Select" },
                ...FACTIONS.map(f => ({ value: f, label: f }))
              ]}
              styles={wideSelectStyles}
              placeholder="Select"
            />
          </div>
        </div>
        <div className="form-row" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div>
            <label>Max:</label>
            <input
              type="number"
              value={safeEditCard?.Max ?? ""}
              onChange={e => handleFieldChange("Max", e.target.value)}
              min={1}
              style={{ width: "60px" }}
            />
          </div>
          <div>
            <label>Health:</label>
            <input
              type="number"
              value={safeEditCard?.Health ?? ""}
              onChange={e => handleFieldChange("Health", e.target.value)}
              min={0}
              style={{ width: "60px" }}
            />
          </div>
          <div>
            <label>Speed:</label>
            <input
              type="number"
              value={safeEditCard?.Speed ?? ""}
              onChange={e => handleFieldChange("Speed", e.target.value)}
              min={0}
              style={{ width: "60px" }}
            />
          </div>
          <div>
            <label>FigureCount:</label>
            <input
              type="number"
              value={safeEditCard?.FigureCount ?? ""}
              onChange={e => handleFieldChange("FigureCount", e.target.value)}
              min={1}
              style={{ width: "60px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Variant:</label>
            <Select
              value={
                [{ value: "FFG", label: "FFG" }, { value: "IACP", label: "IACP" }]
                  .find(opt => opt.value === (safeEditCard?.Variant ?? "FFG"))
              }
              onChange={selected => handleFieldChange("Variant", selected ? selected.value : "FFG")}
              options={[
                { value: "FFG", label: "FFG" },
                { value: "IACP", label: "IACP" }
              ]}
              styles={compactSelectStyles}
              placeholder="Select"
              isDisabled={isCardSaved(safeEditCard)}
            />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Traits:</label>
            <Select
              isMulti
              value={(safeEditCard?.Traits ?? []).map(trait => ({ value: trait, label: trait }))}
              onChange={selected =>
                handleFieldChange("Traits", selected ? selected.map(opt => opt.value) : [])
              }
              options={TRAIT_OPTIONS}
              placeholder="Select traits"
              styles={traitsSelectStyles}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Traits/Characteristics Required:</label>
            <Select
              isMulti
              value={(safeEditCard?.TraitsRequired ?? []).map(trait => ({ value: trait, label: trait }))}
              onChange={selected =>
                handleFieldChange("TraitsRequired", selected ? selected.map(opt => opt.value) : [])
              }
              options={[
                {
                  label: "Traits",
                  options: TRAIT_OPTIONS,
                },
                {
                  label: "Card Classes",
                  options: [
                    { value: "Unique", label: "Unique" },
                    { value: "Elite", label: "Elite" },
                    { value: "Regular", label: "Regular" },
                  ],
                },
                {
                  label: "Characteristics",
                  options: [
                    { value: "Ranged", label: "Ranged" },
                    { value: "Melee", label: "Melee" },
                    { value: "Small", label: "Small" },
                    { value: "Large", label: "Large" },
                    { value: "Massive", label: "Massive" },
                    { value: "Mobile", label: "Mobile" },
                    { value: "Reach", label: "Reach" },
                  ],
                },
              ]}
              placeholder="Select requirements"
              styles={traitsSelectStyles}
            />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Characteristics:</label>
            <Select
              isMulti
              value={(safeEditCard?.Characteristics ?? []).map(c => ({ value: c, label: c }))}
              onChange={selected =>
                handleFieldChange("Characteristics", selected ? selected.map(opt => opt.value) : [])
              }
              options={CHARACTERISTIC_OPTIONS}
              placeholder="Select characteristics"
              styles={traitsSelectStyles}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Units Required:</label>
            <Select
              isMulti
              value={
                Array.isArray(safeEditCard?.UnitsRequired)
                  ? safeEditCard.UnitsRequired.map(name => ({ value: name, label: name }))
                  : []
              }
              onChange={selected =>
                handleFieldChange(
                  "UnitsRequired",
                  selected ? selected.map(opt => opt.value) : []
                )
              }
              options={(() => {
                // Get deployment cards matching the faction
                const deploymentNames = cardData
                  .filter(
                    c =>
                      c.CardGroup === "Deployment" &&
                      c.Faction === (safeEditCard?.Faction || "Rebel")
                  )
                  .map(c => c.Name);
                // Remove duplicates and sort alphabetically
                const uniqueSorted = Array.from(new Set(deploymentNames)).sort((a, b) => a.localeCompare(b));
                return uniqueSorted.map(name => ({ value: name, label: name }));
              })()}
              placeholder="Select required units"
              styles={traitsSelectStyles}
              isSearchable
            />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>AllText:</label>
            <textarea
              ref={allTextRef}
              value={safeEditCard?.AllText || ""}
              onChange={e => handleFieldChange("AllText", e.target.value)}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Searchable card text"
              style={{ width: "100%", overflow: "hidden", resize: "none" }}
            />
          </div>
        </div>
        <div className="form-row">
          <div style={{ flex: 1 }}>
            <label style={{ display: "block" }}>Image Offset:</label>
            <input
              type="number"
              value={safeEditCard?.ImageOffset ?? 0}
              onChange={e => handleFieldChange("ImageOffset", Number(e.target.value))}
              style={{ width: "100px" }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default CardEditorInline;
