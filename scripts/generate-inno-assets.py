import os
from PIL import Image, ImageDraw, ImageFilter

def create_inno_assets():
    res_dir = 'resources/win32'
    logo_path = 'brand/codeenid.png'
    full_path = 'brand/codeenfull.png'

    logo_img = Image.open(logo_path).convert('RGBA')
    full_img = Image.open(full_path).convert('RGBA')

    # Dimensions for small icons (header)
    # 100: (55, 55), 125: (64, 68), 150: (83, 80), 175: (92, 97), 200: (110, 106), 225: (119, 123), 250: (138, 140)
    small_sizes = {
        100: (55, 55),
        125: (64, 68),
        150: (83, 80),
        175: (92, 97),
        200: (110, 106),
        225: (119, 123),
        250: (138, 140)
    }

    # Dimensions for big banners (left panel)
    # 100: (164, 314), 125: (192, 386), 150: (246, 459), 175: (273, 556), 200: (328, 604), 225: (355, 700), 250: (410, 797)
    big_sizes = {
        100: (164, 314),
        125: (192, 386),
        150: (246, 459),
        175: (273, 556),
        200: (328, 604),
        225: (355, 700),
        250: (410, 797)
    }

    # 1. Generate Small Header Bitmaps (white background with Codeen logo)
    for pct, (w, h) in small_sizes.items():
        # In Inno Setup, the header background is white (#FFFFFF)
        bg = Image.new('RGB', (w, h), (255, 255, 255))
        # Scale logo to fit with margin
        margin = int(min(w, h) * 0.12)
        target_size = min(w, h) - 2 * margin
        resized_logo = logo_img.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
        offset_x = (w - target_size) // 2
        offset_y = (h - target_size) // 2
        bg.paste(resized_logo, (offset_x, offset_y), resized_logo)
        
        out_file = os.path.join(res_dir, f'inno-small-{pct}.bmp')
        bg.save(out_file, 'BMP')
        print(f"Generated {out_file} ({w}x{h})")

    # 2. Generate Big Banner Bitmaps (modern dark gradient with Codeen brand)
    for pct, (w, h) in big_sizes.items():
        banner = Image.new('RGB', (w, h), (15, 23, 42)) # Deep slate #0f172a
        draw = ImageDraw.Draw(banner)
        
        # Subtle vertical gradient from #0b0f19 to #1e293b
        for y in range(h):
            ratio = y / max(h - 1, 1)
            r = int(11 * (1 - ratio) + 26 * ratio)
            g = int(15 * (1 - ratio) + 36 * ratio)
            b = int(25 * (1 - ratio) + 54 * ratio)
            draw.line([(0, y), (w, y)], fill=(r, g, b))

        # Accent subtle line / glow on top and bottom
        draw.line([(0, 0), (w, 0)], fill=(0, 220, 130)) # Codeen emerald
        draw.line([(0, h - 1), (w, h - 1)], fill=(0, 180, 110))

        # Fit codeenfull logo inside banner width with margins
        target_w = int(w * 0.85)
        aspect = full_img.height / full_img.width
        target_h = int(target_w * aspect)
        resized_full = full_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

        # Place centered vertically in upper-middle
        x = (w - target_w) // 2
        y = (h - target_h) // 2 - int(h * 0.08)
        banner.paste(resized_full, (x, y), resized_full)

        out_file = os.path.join(res_dir, f'inno-big-{pct}.bmp')
        banner.save(out_file, 'BMP')
        print(f"Generated {out_file} ({w}x{h})")

    # 3. Generate inno-void.bmp (1200x1200) replacement as Codeen square
    sq = Image.new('RGB', (1200, 1200), (15, 23, 42))
    draw_sq = ImageDraw.Draw(sq)
    for y in range(1200):
        ratio = y / 1199
        r = int(11 * (1 - ratio) + 26 * ratio)
        g = int(15 * (1 - ratio) + 36 * ratio)
        b = int(25 * (1 - ratio) + 54 * ratio)
        draw_sq.line([(0, y), (1200, y)], fill=(r, g, b))

    logo_big = logo_img.resize((600, 600), Image.Resampling.LANCZOS)
    sq.paste(logo_big, (300, 300), logo_big)
    sq.save(os.path.join(res_dir, 'inno-void.bmp'), 'BMP')
    print("Generated inno-void.bmp (1200x1200)")

if __name__ == '__main__':
    create_inno_assets()
