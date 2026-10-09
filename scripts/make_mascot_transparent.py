from PIL import Image, ImageFilter
from collections import deque

src_path = r"C:\Users\kames\.gemini\antigravity-ide\brain\61b18808-7128-42a6-844f-a67a80614429\mascot_hd_1791567143025.jpg"
out_path_1 = r"c:\andropedia\public\mascot-waving.png"
out_path_2 = r"c:\andropedia\public\mascot.png"

img = Image.open(src_path).convert("RGBA")
width, height = img.size
pixels = img.load()

# Step 1: Smooth color threshold for alpha channel
# Pure black background has max(r, g, b) < 15.
# Smooth transition between 12 and 35 so edges look perfectly antialiased.
alpha = Image.new("L", (width, height), 255)
alpha_pixels = alpha.load()

for y in range(height):
    for x in range(width):
        r, g, b, _ = pixels[x, y]
        m = max(r, g, b)
        if m <= 14:
            alpha_pixels[x, y] = 0
        elif m < 35:
            # Smooth quadratic fade for soft edges
            t = (m - 14) / (35 - 14)
            alpha_pixels[x, y] = int(255 * (t ** 1.5))
        else:
            alpha_pixels[x, y] = 255

# Apply mask as alpha
img.putalpha(alpha)

# Step 2: Crop tightly to non-transparent bounding box
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Save both mascot-waving.png and mascot.png
img.save(out_path_1, "PNG")
img.save(out_path_2, "PNG")
print("Saved transparent mascot:", img.size)
