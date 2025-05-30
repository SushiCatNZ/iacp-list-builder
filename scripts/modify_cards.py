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
        with open(payload_filename, 'r', encoding='utf-8') as f:
            payload = json.load(f)
        
        operation = payload.get('operation')  # 'save' or 'delete'
        card_data = payload.get('card')
        card_id = payload.get('cardId')
        
        # Get the path to cards.json
        script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        project_root = script_dir.parent
        cards_json_path = project_root / 'src' / 'data' / 'cards.json'
        
        # Read existing cards
        with open(cards_json_path, 'r', encoding='utf-8') as f:
            cards = json.load(f)
        
        if operation == 'save':
            # Find if card exists
            card_index = next((i for i, c in enumerate(cards) if str(c.get('ID')) == str(card_id)), None)
            ordered_card = get_ordered_card(card_data)
            if card_index is not None:
                # Update existing card
                cards[card_index] = ordered_card
            else:
                # Add new card
                cards.append(ordered_card)
                
        elif operation == 'delete':
            # Remove card
            cards = [get_ordered_card(c) for c in cards if str(c.get('ID')) != str(card_id)]
        
        # Sort cards by integer ID before saving
        cards.sort(key=lambda c: int(c.get('ID', 0)))
        
        # Write back to cards.json with ordered fields
        with open(cards_json_path, 'w', encoding='utf-8') as f:
            json.dump(cards, f, indent=2, ensure_ascii=False)
        
        print(json.dumps({'success': True}))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        modify_cards(sys.argv[1])
    else:
        print("Error: No payload filename provided", file=sys.stderr)
        sys.exit(1) 