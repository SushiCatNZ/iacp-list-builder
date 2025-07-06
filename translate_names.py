import json
from deep_translator import GoogleTranslator
import time

def translate_card_names(input_file, output_file, target_language='es'):
    # Initialize the translator
    translator = GoogleTranslator(source='en', target=target_language)
    
    # Read the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    
    # Create simplified output with only ID, Name, and translated Name
    simplified_cards = []
    
    # Translate each card's name
    for card in cards:
        try:
            # Create simplified card entry
            simplified_card = {
                "ID": card["ID"],
                "Name": card["Name"],  # Keep original English name
                "NameES": None  # Will be filled with Spanish translation
            }
            
            # Translate the name
            translated = translator.translate(card['Name'])
            # Update the Spanish name field
            simplified_card["NameES"] = translated
            
            simplified_cards.append(simplified_card)
            
            # Add a small delay to avoid hitting API rate limits
            time.sleep(0.5)
            print(f"Translated: {card['Name']} -> {translated}")
        except Exception as e:
            print(f"Error translating {card['Name']}: {str(e)}")
    
    # Save the simplified JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(simplified_cards, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    input_file = "src/data/cards.json"
    output_file = "src/data/cards_translated.json"
    target_language = "es"  # Spanish
    
    print(f"Starting translation to {target_language}...")
    translate_card_names(input_file, output_file, target_language)
    print("Translation complete!") 