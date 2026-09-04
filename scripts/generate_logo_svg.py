import os
from PIL import Image
import numpy as np

img = Image.open('frontend/public/logo_tight.png').convert('L')
arr = np.array(img)

x_centers = [int(16 + c * 32.46) for c in range(15)]
y_centers = [int(17 + r * 34.37) for r in range(8)]

grid = []
for r in y_centers:
    row = []
    for x in x_centers:
        patch = arr[r-4:r+4, x-4:x+4]
        row.append(1 if patch.mean() > 100 else 0)
    grid.append(row)

# Ensure period is 2x2 squares (row 6 & 7, col 13 & 14)
grid[6][13] = 1
grid[6][14] = 1
grid[7][13] = 1
grid[7][14] = 1

# Build SVG
# Each cell is a square of size 10x10 with 2px gap (cell step 12)
# Grid width: 15 * 12 - 2 = 178
# Grid height: 8 * 12 - 2 = 94

svg_rects = []
for r in range(8):
    for c in range(15):
        if grid[r][c] == 1:
            x = c * 12
            y = r * 12
            svg_rects.append(f'  <rect x="{x}" y="{y}" width="10" height="10" rx="1.5" fill="currentColor" />')

rects_str = '\n'.join(svg_rects)

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 178 94" fill="none">
{rects_str}
</svg>
'''

with open('frontend/public/logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('Generated frontend/public/logo.svg with 2x2 period!')
