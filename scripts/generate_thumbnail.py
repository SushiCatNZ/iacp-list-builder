import os
from PIL import Image
import sys

def generate_thumbnail(image_path, card_group):
    # Determine output directory
    base_dir = os.path.dirname(image_path)
    thumb_dir = os.path.join(base_dir, 'thumbnails')
    os.makedirs(thumb_dir, exist_ok=True)

    # Get base filename (without extension)
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    thumb_path = os.path.join(thumb_dir, base_name + '.jpg')

    # Open and process image
    with Image.open(image_path) as img:
        # Calculate new height to maintain aspect ratio
        width_percent = 138 / float(img.size[0])
        new_height = int((float(img.size[1]) * float(width_percent)))
        img = img.resize((138, new_height), Image.LANCZOS)
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.save(thumb_path, 'JPEG', quality=100)
    print(f"Thumbnail saved: {thumb_path}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python generate_thumbnail.py <image_path> <card_group>")
        sys.exit(1)
    image_path = sys.argv[1]
    card_group = sys.argv[2]
    generate_thumbnail(image_path, card_group) 