import React from "react";

// Thumbnails are 138px wide. Show the centre 60px of each at native scale.
const PREBUILT_THUMB_WIDTH = 138;
const PREBUILT_SLICE_WIDTH = 80;
const PREBUILT_SIDE_CROP = (PREBUILT_THUMB_WIDTH - PREBUILT_SLICE_WIDTH) / 2;

function cardByIdMap(cardData) {
  const map = new Map();
  (cardData || []).forEach((card) => map.set(Number(card.ID), card));
  return map;
}

function isCardVisibleInMode(card, iacpMode, allCards) {
  if (iacpMode === "ALL") return true;
  if (iacpMode === "FFG") return card.Variant === "FFG";
  if (card.Variant === "IACP") return true;
  return !allCards.some(
    (c) =>
      c.Variant === "IACP" &&
      c.Name === card.Name &&
      c.CardClass === card.CardClass
  );
}

export function isPrebuiltListVisible(list, iacpMode, cardData) {
  const map = cardByIdMap(cardData);
  const ids = [...(list.DeploymentIDs || []), ...(list.CommandIDs || [])];
  return ids.every((id) => {
    const card = map.get(Number(id));
    if (!card) return true;
    return isCardVisibleInMode(card, iacpMode, cardData);
  });
}

export function resolvePrebuiltCards(ids, cardData) {
  const map = cardByIdMap(cardData);
  const cards = [];
  const missing = [];
  (ids || []).forEach((id) => {
    const card = map.get(Number(id));
    if (card) cards.push(card);
    else missing.push(id);
  });
  return { cards, missing };
}

export function listsMatchArmy(list, deploymentList, commandList, baseFaction, cardData) {
  if (!list) return false;
  if ((list.BaseFaction || "") !== (baseFaction || "")) return false;
  const map = cardByIdMap(cardData);
  const expectedDep = (list.DeploymentIDs || []).map(Number).filter((id) => map.has(id));
  const expectedCmd = (list.CommandIDs || []).map(Number).filter((id) => map.has(id));
  const currentDep = (deploymentList || []).map((c) => Number(c.ID));
  const currentCmd = (commandList || []).map((c) => Number(c.ID));
  return (
    JSON.stringify(currentDep) === JSON.stringify(expectedDep) &&
    JSON.stringify(currentCmd) === JSON.stringify(expectedCmd)
  );
}

function collageCards(list, cardData) {
  const map = cardByIdMap(cardData);
  const seen = new Set();
  const cards = [];
  (list.DeploymentIDs || []).forEach((id) => {
    const num = Number(id);
    if (seen.has(num)) return;
    const card = map.get(num);
    if (!card || card.CardGroup !== "Deployment") return;
    seen.add(num);
    cards.push(card);
  });
  cards.sort((a, b) => {
    if (b.Cost !== a.Cost) return b.Cost - a.Cost;
    return (a.Name || "").localeCompare(b.Name || "");
  });
  return cards.slice(0, 3);
}

function thumbUrl(card, imageRefreshKey) {
  if (!card?.ImageName) return "";
  const cardGroup = card.CardGroup === "Command" ? "command" : "deployment";
  return `/api/thumbnails/${cardGroup}/${card.ImageName}?refresh=${imageRefreshKey}`;
}

function PrebuiltCollage({ list, cardData, imageRefreshKey }) {
  const top = collageCards(list, cardData);
  const first = top[0];
  const second = top[1];
  const third = top[2];
  const slots = [second, first, third];

  return (
    <div className="prebuilt-thumb-strip">
      {slots.map((card, index) =>
        card ? (
          <div key={`${card.ID}-${index}`} className="prebuilt-thumb-slice">
            <img
              className="prebuilt-thumb-slice-img"
              src={thumbUrl(card, imageRefreshKey)}
              alt=""
              style={{
                width: PREBUILT_THUMB_WIDTH,
                marginLeft: -PREBUILT_SIDE_CROP,
                objectPosition: `center ${-34 + (card.ImageOffset || 0)}px`,
              }}
            />
          </div>
        ) : (
          <div key={`empty-${index}`} className="prebuilt-thumb-slice empty" />
        )
      )}
      <div className="prebuilt-thumb-fade" />
    </div>
  );
}

function groupLists(lists) {
  const groups = new Map();
  lists.forEach((list) => {
    const type = (list.Type || "").trim() || "Ungrouped";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(list);
  });
  const typeNames = [...groups.keys()].sort((a, b) => a.localeCompare(b));
  return typeNames.map((type) => ({
    type,
    lists: groups.get(type).sort((a, b) => a.Title.localeCompare(b.Title)),
  }));
}

function PreBuiltPanel({
  lists,
  cardData,
  iacpMode,
  selectedTitle,
  editMode,
  draft,
  setDraft,
  factionIcons,
  imageRefreshKey,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  onCancel,
}) {
  const visible = (lists || []).filter((list) =>
    isPrebuiltListVisible(list, iacpMode, cardData)
  );
  const grouped = groupLists(
    visible.filter((list) => !(editMode === "update" && list.Title === selectedTitle))
  );
  const canUpdateOrDelete = Boolean(selectedTitle) && !editMode;

  const renderEditRow = () => (
    <div className="card-item prebuilt-row prebuilt-edit-row" onClick={(e) => e.stopPropagation()}>
      <div className="prebuilt-edit-fields">
        <input
          className="prebuilt-edit-input"
          value={draft.Title}
          onChange={(e) => setDraft({ ...draft, Title: e.target.value })}
          placeholder="Title"
        />
        <input
          className="prebuilt-edit-input"
          value={draft.Description}
          onChange={(e) => setDraft({ ...draft, Description: e.target.value })}
          placeholder="Description"
        />
        <input
          className="prebuilt-edit-input"
          value={draft.Type}
          onChange={(e) => setDraft({ ...draft, Type: e.target.value })}
          placeholder="Type"
        />
        <div className="prebuilt-edit-actions">
          <button type="button" className="army-list-button save-button" onClick={onSave}>
            Save
          </button>
          <button type="button" className="army-list-button clear-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderRow = (list) => (
    <div
      key={list.Title}
      className={`card-item prebuilt-row${selectedTitle === list.Title ? " prebuilt-selected" : ""}`}
      title={list.Description || ""}
      onClick={() => onSelect(list)}
    >
      <div className="card-content prebuilt-row-content">
        <img
          src={factionIcons[list.BaseFaction]}
          alt={list.BaseFaction}
          className="card-faction-icon"
        />
        <span className="card-name">{list.Title}</span>
      </div>
      <PrebuiltCollage list={list} cardData={cardData} imageRefreshKey={imageRefreshKey} />
    </div>
  );

  return (
    <div className="prebuilt-panel">
      <div className="prebuilt-header">
        <div className="section-title-box">
          <span>PRE-BUILT</span>
        </div>
        <div className="prebuilt-admin-buttons">
          <button
            type="button"
            className="add-common-command-button"
            disabled={Boolean(editMode)}
            onClick={onAdd}
          >
            Add
          </button>
          <button
            type="button"
            className="add-common-command-button"
            disabled={!canUpdateOrDelete}
            onClick={onUpdate}
          >
            Update
          </button>
          <button
            type="button"
            className="add-common-command-button"
            disabled={!canUpdateOrDelete}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="prebuilt-list-window">
        {editMode === "add" && renderEditRow()}
        {editMode === "update" && renderEditRow()}
        {grouped.map((group) => (
          <div key={group.type} className="prebuilt-group">
            <div className="prebuilt-group-heading">{group.type}</div>
            {group.lists.map(renderRow)}
          </div>
        ))}
        {!editMode && grouped.length === 0 && (
          <div className="prebuilt-empty">No pre-built lists.</div>
        )}
      </div>
    </div>
  );
}

export default PreBuiltPanel;
