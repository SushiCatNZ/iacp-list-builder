import json
import os
import sys
from pathlib import Path
import re

def extract_vassal_id(vassal_text):
    # Find all matches for ;...(.png|.jpg)
    matches = re.findall(r';([^;\n]*?\.(?:png|jpg))', vassal_text, re.IGNORECASE)
    for match in matches:
        lower = match.lower()
        if 'cardback' not in lower and 'promo' not in lower:
            return match.strip()
    return None

def main(payload_filename):
    try:
        with open(payload_filename, 'r', encoding='utf-8') as f:
            payload = json.load(f)
        vassal_text = payload['vassalText']
        vassal_name = payload['vassalName']
        card_group = payload['cardGroup']

        # Determine output directory
        script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        project_root = script_dir.parent
        if card_group == 'Command':
            out_dir = project_root / 'src' / 'utils' / 'vassal_comm'
        else:
            out_dir = project_root / 'src' / 'utils' / 'vassal_depl'
        out_dir.mkdir(parents=True, exist_ok=True)

        # Save the vassal text as a .txt file
        out_path = out_dir / f'{vassal_name}.txt'
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(vassal_text)

        # Extract VassalID
        vassal_id = extract_vassal_id(vassal_text)

        # Update cards.json with new VassalID
        cards_json_path = project_root / 'src' / 'data' / 'cards.json'
        with open(cards_json_path, 'r', encoding='utf-8') as f:
            cards = json.load(f)
        updated = False
        for card in cards:
            if card.get('VassalName') == vassal_name:
                card['VassalID'] = vassal_id
                updated = True
                break
        if updated:
            with open(cards_json_path, 'w', encoding='utf-8') as f:
                json.dump(cards, f, indent=2, ensure_ascii=False)

        print(json.dumps({'success': True, 'vassalID': vassal_id, 'updated': updated}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        print('Error: No payload filename provided', file=sys.stderr)
        sys.exit(1) 