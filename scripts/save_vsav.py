import json
import os
import sys

def save_army_list_from_file(payload_filename):
    try:
        with open(payload_filename, 'r', encoding='utf-8') as f:
            payload_str = f.read()
            
        payload = json.loads(payload_str)
        army_name = payload["armyName"]
        cards_to_process = payload["cards"]
        cards_to_process.reverse()  # Process cards in reverse order

        if not army_name:
            print("Error: Army name is empty in payload.")
            return

        vsav_content_parts = ["DECK\t"] 
        errors = []
        files_processed_count = 0

        # Get the directory where the script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up one level to the project root
        project_root = os.path.dirname(script_dir)

        for card_info in cards_to_process:
            vassal_name = card_info["VassalName"]
            
            # Try command directory first, then deployment directory
            txt_file_path = os.path.join(project_root, "src", "utils", "vassal_comm", f"{vassal_name}.txt")
            if not os.path.exists(txt_file_path):
                txt_file_path = os.path.join(project_root, "src", "utils", "vassal_depl", f"{vassal_name}.txt")

            try:
                with open(txt_file_path, 'r', encoding='utf-8') as f_card:
                    content = f_card.read().rstrip('\r\n') 
                    if content:
                        vsav_content_parts.append(content)
                        files_processed_count += 1
                    else:
                        warning_msg = f"Warning: File '{txt_file_path}' for card '{vassal_name}' is empty. It was not added to the .vsav file."
                        print(warning_msg, file=sys.stderr)
                        errors.append(warning_msg)
            except FileNotFoundError:
                error_msg = f"Error: File not found '{txt_file_path}' for card '{vassal_name}'. Skipping."
                print(error_msg, file=sys.stderr)
                errors.append(error_msg)
            except Exception as e:
                error_msg = f"Error reading card file '{txt_file_path}': {str(e)}. Skipping."
                print(error_msg, file=sys.stderr)
                errors.append(error_msg)
        
        final_vsav_content = "".join(vsav_content_parts)
        
        # Print only the content to stdout, errors to stderr
        print(final_vsav_content)
        
        # Print status to stderr
        print(f"Files processed: {files_processed_count}", file=sys.stderr)
        if errors:
            print("Warnings/Errors encountered:", file=sys.stderr)
            for error in errors:
                print(error, file=sys.stderr)
        
    except FileNotFoundError:
        print(f"Error: Payload file not found: {payload_filename}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in payload file: {payload_filename}", file=sys.stderr)
        return None
    except KeyError as ke:
        print(f"Error: Missing a critical key in JSON payload from file {payload_filename}: {str(ke)}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"An unexpected error occurred in the Python script: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        payload_file_arg = sys.argv[1]
        save_army_list_from_file(payload_file_arg)
    else:
        print("Error: No payload filename provided as a command-line argument.", file=sys.stderr)
        print("Usage: python save_vsav.py <payload_filename.json>", file=sys.stderr) 