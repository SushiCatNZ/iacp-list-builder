import json
import os
import sys
from pathlib import Path
from collections import OrderedDict

def get_ordered_card(card):
    # Define the canonical field order
    field_order = [
        "ID", "CardGroup", "Name", "CardClass", "Faction", "Cost", "FigureCount", "Max", "Health", "Speed",
        "Traits", "TraitsRequired", "Color", "UnitsRequired", "AllText", "Variant", "Characteristics", "VassalName", "VassalID"
    ]
    # Build an OrderedDict with the canonical order, including only present fields
    ordered = OrderedDict()
    for key in field_order:
        if key in card:
            ordered[key] = card[key]
    # Add any extra fields at the end (shouldn't happen, but for safety)
    for key in card:
        if key not in ordered:
            ordered[key] = card[key]
    return ordered

def modify_cards(payload_filename):
    try:
        print(f"[PYTHON SCRIPT] Starting modify_cards with payload file: {payload_filename}", file=sys.stderr)
        
        with open(payload_filename, 'r', encoding='utf-8') as f:
            payload = json.load(f)
        
        operation = payload.get('operation')  # 'save' or 'delete'
        card_data = payload.get('card')
        card_id = payload.get('cardId')
        
        print(f"[PYTHON SCRIPT] Operation: {operation}, Card ID: {card_id}", file=sys.stderr)
        print(f"[PYTHON SCRIPT] Card data: {json.dumps(card_data, indent=2)}", file=sys.stderr)
        
        # Get the path to cards.json
        script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        # On Render: script is in /opt/render/project/src/scripts/
        # Go up one level to get to /opt/render/project/src/, then to data/
        project_root = script_dir.parent
        cards_json_path = project_root / 'data' / 'cards.json'
        
        print(f"[PYTHON SCRIPT] Script directory: {script_dir}", file=sys.stderr)
        print(f"[PYTHON SCRIPT] Project root: {project_root}", file=sys.stderr)
        print(f"[PYTHON SCRIPT] Cards.json path: {cards_json_path}", file=sys.stderr)
        
        # Check if cards.json exists
        if not cards_json_path.exists():
            print(f"[PYTHON SCRIPT] ERROR: Cards.json does not exist at {cards_json_path}", file=sys.stderr)
            raise FileNotFoundError(f"Cards.json not found at {cards_json_path}")
        
        # Check file permissions
        if not os.access(cards_json_path, os.R_OK):
            print(f"[PYTHON SCRIPT] ERROR: Cannot read cards.json at {cards_json_path}", file=sys.stderr)
            raise PermissionError(f"Cannot read cards.json at {cards_json_path}")
        
        if not os.access(cards_json_path, os.W_OK):
            print(f"[PYTHON SCRIPT] ERROR: Cannot write to cards.json at {cards_json_path}", file=sys.stderr)
            raise PermissionError(f"Cannot write to cards.json at {cards_json_path}")
        
        # Read existing cards
        print(f"[PYTHON SCRIPT] Reading existing cards from {cards_json_path}", file=sys.stderr)
        with open(cards_json_path, 'r', encoding='utf-8') as f:
            cards = json.load(f)
        
        print(f"[PYTHON SCRIPT] Loaded {len(cards)} existing cards", file=sys.stderr)
        
        if operation == 'save':
            # Find if card exists
            card_index = next((i for i, c in enumerate(cards) if str(c.get('ID')) == str(card_id)), None)
            ordered_card = get_ordered_card(card_data)
            if card_index is not None:
                # Update existing card
                print(f"[PYTHON SCRIPT] Updating existing card at index {card_index}", file=sys.stderr)
                cards[card_index] = ordered_card
            else:
                # Add new card
                print(f"[PYTHON SCRIPT] Adding new card", file=sys.stderr)
                cards.append(ordered_card)
                
        elif operation == 'delete':
            # Remove card
            print(f"[PYTHON SCRIPT] Deleting card with ID {card_id}", file=sys.stderr)
            cards = [get_ordered_card(c) for c in cards if str(c.get('ID')) != str(card_id)]
        
        # Sort cards by integer ID before saving
        print(f"[PYTHON SCRIPT] Sorting cards by ID", file=sys.stderr)
        cards.sort(key=lambda c: int(c.get('ID', 0)))
        
        # Write back to cards.json with ordered fields
        print(f"[PYTHON SCRIPT] Writing {len(cards)} cards back to {cards_json_path}", file=sys.stderr)
        with open(cards_json_path, 'w', encoding='utf-8') as f:
            json.dump(cards, f, indent=2, ensure_ascii=False)
        
        print(f"[PYTHON SCRIPT] Successfully wrote cards.json", file=sys.stderr)
        print(json.dumps({'success': True}))
        
    except Exception as e:
        print(f"[PYTHON SCRIPT] ERROR: {str(e)}", file=sys.stderr)
        print(json.dumps({'success': False, 'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        modify_cards(sys.argv[1])
    else:
        print("Error: No payload filename provided", file=sys.stderr)
        sys.exit(1) 