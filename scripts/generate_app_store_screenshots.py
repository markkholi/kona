"""Generate Apple App Store Connect screenshots for Kona.

Generates exact-dimension, 24-bit RGB (no alpha channel) PNG screenshots for:
- iPhone 6.1" (1170 x 2532)
- iPhone 6.5" (1284 x 2778)
- iPad 13" (2064 x 2752)
- iPad 12.9" (2048 x 2732)
- iPhone 6.5" Showcase Marketing Cards (1284 x 2778)

Destination:
C:\\Users\\mkhol\\Documents\\Apps2\\cursor\\Kona\\screenshots\\
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REPO_ROOT = Path(__file__).resolve().parent.parent
QC_DIR = REPO_ROOT / ".qc"
SCREENSHOTS_DIR = REPO_ROOT / "screenshots"

BG_COLOR = (248, 250, 252)  # #F8FAFC
DARK_NAVY = (15, 23, 42)    # #0F172A
SLATE_500 = (100, 116, 139) # #64748B
SLATE_700 = (51, 65, 85)    # #334155
PURPLE = (79, 70, 229)      # #4F46E5
BORDER_COLOR = (226, 232, 240)

FONT_SEGOE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_SEGOE_REG = "C:/Windows/Fonts/segoeui.ttf"
FONT_ARIAL_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_ARIAL_REG = "C:/Windows/Fonts/arial.ttf"


def get_font(path: str, size: int):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        try:
            return ImageFont.truetype(FONT_ARIAL_BOLD if "b" in path.lower() else FONT_ARIAL_REG, size)
        except Exception:
            return ImageFont.load_default()


def draw_ios_status_bar(draw: ImageDraw.ImageDraw, width: int, bar_height: int = 140, is_dark: bool = False):
    text_color = (255, 255, 255) if is_dark else DARK_NAVY
    
    # 1. Time "9:41"
    time_font = get_font(FONT_SEGOE_BOLD, int(bar_height * 0.32))
    draw.text((int(width * 0.065), int(bar_height * 0.28)), "9:41", fill=text_color, font=time_font)

    # 2. Dynamic Island
    pill_w = int(width * 0.24)
    pill_h = int(bar_height * 0.52)
    pill_x = (width - pill_w) // 2
    pill_y = int(bar_height * 0.22)
    draw.rounded_rectangle(
        [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
        radius=pill_h // 2,
        fill=(0, 0, 0)
    )

    # 3. Battery Icon
    bx = width - int(width * 0.135)
    by = int(bar_height * 0.36)
    bw = int(width * 0.055)
    bh = int(bar_height * 0.24)
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=6, outline=text_color, width=3)
    draw.rounded_rectangle([bx + 4, by + 4, bx + bw - 9, by + bh - 4], radius=3, fill=text_color)
    draw.rounded_rectangle([bx + bw + 2, by + bh // 3, bx + bw + 5, by + bh - bh // 3], radius=2, fill=text_color)

    # 4. Cellular signal bars
    cx = bx - int(width * 0.085)
    cy = int(bar_height * 0.38)
    for i in range(4):
        bar_h = int((bar_height * 0.07) + i * (bar_height * 0.045))
        draw.rounded_rectangle([cx + i * 11, cy + (28 - bar_h), cx + i * 11 + 6, cy + 28], radius=2, fill=text_color)

    # 5. Wi-Fi Icon
    wx = cx - int(width * 0.045)
    draw.arc([wx, cy + 2, wx + 34, cy + 36], 200, 340, fill=text_color, width=3)
    draw.arc([wx + 6, cy + 9, wx + 28, cy + 31], 200, 340, fill=text_color, width=3)
    draw.ellipse([wx + 14, cy + 20, wx + 20, cy + 26], fill=text_color)


def draw_navigation_bar(draw: ImageDraw.ImageDraw, width: int, nav_y: int, nav_h: int, title: str, nav_type: str = "title"):
    # Background
    draw.rectangle([(0, nav_y), (width, nav_y + nav_h)], fill=(255, 255, 255))
    draw.line([(0, nav_y + nav_h - 1), (width, nav_y + nav_h - 1)], fill=BORDER_COLOR, width=1)

    font_nav = get_font(FONT_SEGOE_BOLD, int(nav_h * 0.30))
    font_sub = get_font(FONT_SEGOE_REG, int(nav_h * 0.18))

    if nav_type == "home":
        # Logo Box
        lx = int(width * 0.04)
        box_size = int(nav_h * 0.44)
        ly = nav_y + (nav_h - box_size) // 2
        draw.rounded_rectangle([lx, ly, lx + box_size, ly + box_size], radius=12, fill=PURPLE)
        # Book pages inside
        page_w = int(box_size * 0.22)
        page_h = int(box_size * 0.6)
        py = ly + int(box_size * 0.2)
        draw.rounded_rectangle([lx + int(box_size * 0.22), py, lx + int(box_size * 0.22) + page_w, py + page_h], radius=2, fill=(255, 255, 255))
        draw.rounded_rectangle([lx + int(box_size * 0.54), py, lx + int(box_size * 0.54) + page_w, py + page_h], radius=2, fill=(255, 255, 255))

        # Brand text
        draw.text((lx + box_size + 14, ly - 4), "KONA", fill=DARK_NAVY, font=font_nav)
        draw.text((lx + box_size + 14, ly + int(box_size * 0.6)), "Youth Book Recommender", fill=SLATE_500, font=font_sub)

        # Action buttons (Saved & Settings)
        rx = width - int(width * 0.05)
        btn_r = int(nav_h * 0.40)
        # Settings
        draw.ellipse([rx - btn_r, ly, rx, ly + btn_r], outline=(203, 213, 225), width=2)
        draw.ellipse([rx - int(btn_r * 0.6), ly + int(btn_r * 0.4), rx - int(btn_r * 0.4), ly + int(btn_r * 0.6)], outline=SLATE_700, width=2)
        # Bookmark
        bx = rx - btn_r - 16
        draw.ellipse([bx - btn_r, ly, bx, ly + btn_r], outline=(203, 213, 225), width=2)
        bw_mid = bx - btn_r // 2
        draw.polygon([
            (bw_mid - 6, ly + 14), (bw_mid + 6, ly + 14),
            (bw_mid + 6, ly + btn_r - 12), (bw_mid, ly + btn_r - 18), (bw_mid - 6, ly + btn_r - 12)
        ], fill=SLATE_700)
    else:
        # Back Chevron "<"
        bx = int(width * 0.04)
        by = nav_y + nav_h // 2
        draw.line([(bx + 18, by - 14), (bx, by), (bx + 18, by + 14)], fill=DARK_NAVY, width=4)

        # Centered Title
        bbox = draw.textbbox((0, 0), title, font=font_nav)
        tw = bbox[2] - bbox[0]
        tx = (width - tw) // 2
        ty = nav_y + (nav_h - (bbox[3] - bbox[1])) // 2 - 4
        draw.text((tx, ty), title, fill=DARK_NAVY, font=font_nav)

        if nav_type == "results":
            # Refresh icon
            rx = width - int(width * 0.06)
            ry = nav_y + nav_h // 2
            draw.arc([rx - 14, ry - 14, rx + 14, ry + 14], 40, 320, fill=DARK_NAVY, width=3)
            draw.polygon([(rx + 10, ry - 14), (rx + 18, ry - 6), (rx + 6, ry - 6)], fill=DARK_NAVY)
        elif nav_type == "detail":
            # Share icon
            rx = width - int(width * 0.06)
            ry = nav_y + nav_h // 2
            draw.ellipse([rx + 8, ry - 12, rx + 16, ry - 4], fill=DARK_NAVY)
            draw.ellipse([rx + 8, ry + 4, rx + 16, ry + 12], fill=DARK_NAVY)
            draw.ellipse([rx - 12, ry - 4, rx - 4, ry + 4], fill=DARK_NAVY)
            draw.line([(rx - 4, ry - 2), (rx + 8, ry - 8)], fill=DARK_NAVY, width=2)
            draw.line([(rx - 4, ry + 2), (rx + 8, ry + 8)], fill=DARK_NAVY, width=2)


def draw_home_indicator(draw: ImageDraw.ImageDraw, width: int, height: int, ind_w: int = 360, ind_h: int = 12):
    ind_x = (width - ind_w) // 2
    ind_y = height - int(ind_h * 3.2)
    draw.rounded_rectangle([ind_x, ind_y, ind_x + ind_w, ind_y + ind_h], radius=ind_h // 2, fill=DARK_NAVY)


def generate_iphone_screen(
    content_img: Image.Image,
    target_width: int,
    target_height: int,
    title: str,
    nav_type: str,
    status_bar_h: int,
    nav_h: int,
) -> Image.Image:
    canvas = Image.new("RGB", (target_width, target_height), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    # 1. iOS Status Bar
    draw.rectangle([(0, 0), (target_width, status_bar_h)], fill=(255, 255, 255))
    draw_ios_status_bar(draw, target_width, status_bar_h)

    # 2. Nav Bar
    draw_navigation_bar(draw, target_width, status_bar_h, nav_h, title, nav_type)

    # 3. Content
    content_y = status_bar_h + nav_h
    scale = target_width / content_img.width
    new_w = target_width
    new_h = int(content_img.height * scale)
    resized_content = content_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas.paste(resized_content, (0, content_y))

    # 4. iOS Home Indicator
    draw_home_indicator(draw, target_width, target_height, ind_w=int(target_width * 0.32), ind_h=12)

    return canvas


def generate_ipad_showcase_screen(
    phone_screen: Image.Image,
    target_width: int,
    target_height: int,
    pill_text: str,
    title_text: str,
    subtitle_text: str,
) -> Image.Image:
    canvas = Image.new("RGB", (target_width, target_height), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    # Subtle top gradient
    for y in range(480):
        ratio = y / 480.0
        r = int(255 * (1 - ratio) + 248 * ratio)
        g = int(255 * (1 - ratio) + 250 * ratio)
        b = int(255 * (1 - ratio) + 252 * ratio)
        draw.line([(0, y), (target_width, y)], fill=(r, g, b))

    # Top Copy
    font_pill = get_font(FONT_SEGOE_BOLD, 28)
    font_title = get_font(FONT_SEGOE_BOLD, 68)
    font_sub = get_font(FONT_SEGOE_REG, 36)

    # 1. Pill tag
    bbox = draw.textbbox((0, 0), pill_text, font=font_pill)
    pw = bbox[2] - bbox[0] + 48
    ph = bbox[3] - bbox[1] + 24
    px = (target_width - pw) // 2
    py = 110
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=ph // 2, fill=(238, 242, 255), outline=(199, 210, 254), width=2)
    draw.text((px + 24, py + 12), pill_text, fill=PURPLE, font=font_pill)

    # 2. Main title
    bbox = draw.textbbox((0, 0), title_text, font=font_title)
    tw = bbox[2] - bbox[0]
    tx = (target_width - tw) // 2
    ty = py + ph + 28
    draw.text((tx, ty), title_text, fill=DARK_NAVY, font=font_title)

    # 3. Subtitle
    bbox = draw.textbbox((0, 0), subtitle_text, font=font_sub)
    sw = bbox[2] - bbox[0]
    sx = (target_width - sw) // 2
    sy = ty + 84
    draw.text((sx, sy), subtitle_text, fill=(71, 85, 105), font=font_sub)

    # 4. Device Mockup Chassis & Phone Screen
    target_phone_w = int(target_width * 0.52)
    target_phone_h = int(phone_screen.height * (target_phone_w / phone_screen.width))
    resized_phone = phone_screen.resize((target_phone_w, target_phone_h), Image.Resampling.LANCZOS)

    chassis_border = 16
    chassis_w = target_phone_w + chassis_border * 2
    chassis_h = target_phone_h + chassis_border * 2
    chassis_x = (target_width - chassis_w) // 2
    chassis_y = 470

    # Realistic drop shadow
    shadow = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [chassis_x - 16, chassis_y + 12, chassis_x + chassis_w + 16, chassis_y + chassis_h + 36],
        radius=68,
        fill=(0, 0, 0, 50)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    canvas.paste(shadow, (0, 0), shadow)

    # Dark phone frame
    draw.rounded_rectangle(
        [chassis_x, chassis_y, chassis_x + chassis_w, chassis_y + chassis_h],
        radius=58,
        fill=DARK_NAVY,
        outline=(51, 65, 85),
        width=3
    )

    # Screen mask with rounded corners
    mask = Image.new("L", (target_phone_w, target_phone_h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, target_phone_w, target_phone_h], radius=44, fill=255)

    canvas.paste(resized_phone, (chassis_x + chassis_border, chassis_y + chassis_border), mask)

    return canvas


def generate_iphone_showcase_screen(
    phone_screen: Image.Image,
    target_width: int,
    target_height: int,
    pill_text: str,
    title_text: str,
    subtitle_text: str,
) -> Image.Image:
    canvas = Image.new("RGB", (target_width, target_height), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    for y in range(400):
        ratio = y / 400.0
        r = int(255 * (1 - ratio) + 248 * ratio)
        g = int(255 * (1 - ratio) + 250 * ratio)
        b = int(255 * (1 - ratio) + 252 * ratio)
        draw.line([(0, y), (target_width, y)], fill=(r, g, b))

    font_pill = get_font(FONT_SEGOE_BOLD, 24)
    font_title = get_font(FONT_SEGOE_BOLD, 52)
    font_sub = get_font(FONT_SEGOE_REG, 28)

    # Pill
    bbox = draw.textbbox((0, 0), pill_text, font=font_pill)
    pw = bbox[2] - bbox[0] + 40
    ph = bbox[3] - bbox[1] + 20
    px = (target_width - pw) // 2
    py = 90
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=ph // 2, fill=(238, 242, 255), outline=(199, 210, 254), width=2)
    draw.text((px + 20, py + 10), pill_text, fill=PURPLE, font=font_pill)

    # Title
    bbox = draw.textbbox((0, 0), title_text, font=font_title)
    tw = bbox[2] - bbox[0]
    tx = (target_width - tw) // 2
    ty = py + ph + 24
    draw.text((tx, ty), title_text, fill=DARK_NAVY, font=font_title)

    # Subtitle
    bbox = draw.textbbox((0, 0), subtitle_text, font=font_sub)
    sw = bbox[2] - bbox[0]
    sx = (target_width - sw) // 2
    sy = ty + 68
    draw.text((sx, sy), subtitle_text, fill=(71, 85, 105), font=font_sub)

    # Device Mockup
    target_phone_w = int(target_width * 0.76)
    target_phone_h = int(phone_screen.height * (target_phone_w / phone_screen.width))
    resized_phone = phone_screen.resize((target_phone_w, target_phone_h), Image.Resampling.LANCZOS)

    chassis_border = 14
    chassis_w = target_phone_w + chassis_border * 2
    chassis_h = target_phone_h + chassis_border * 2
    chassis_x = (target_width - chassis_w) // 2
    chassis_y = 380

    shadow = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [chassis_x - 14, chassis_y + 10, chassis_x + chassis_w + 14, chassis_y + chassis_h + 30],
        radius=58,
        fill=(0, 0, 0, 45)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    canvas.paste(shadow, (0, 0), shadow)

    draw.rounded_rectangle(
        [chassis_x, chassis_y, chassis_x + chassis_w, chassis_y + chassis_h],
        radius=52,
        fill=DARK_NAVY,
        outline=(51, 65, 85),
        width=3
    )

    mask = Image.new("L", (target_phone_w, target_phone_h), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([0, 0, target_phone_w, target_phone_h], radius=40, fill=255)

    canvas.paste(resized_phone, (chassis_x + chassis_border, chassis_y + chassis_border), mask)

    return canvas


def main():
    print("=== Kona Apple App Store Screenshot Generator ===")
    
    # 5 Key Screens metadata
    screens = [
        {
            "id": "01_home_screen",
            "content_crop_src": ".qc/test_home_content.png",
            "title": "KONA",
            "nav_type": "home",
            "pill": "AGES 10 TO 17 • EDUCATOR-VETTED",
            "showcase_title": "20 Books Per Search",
            "showcase_sub": "Tailored to reader interests with developmental benchmarks",
        },
        {
            "id": "02_results_20_books",
            "content_crop_src": ".qc/test_results_content.png",
            "title": "20 Recommended Books",
            "nav_type": "results",
            "pill": "EXACTLY 20 VETTED CHOICES",
            "showcase_title": "Curated Recommendations",
            "showcase_sub": "Verified reading complexity, Lexile levels, and age badges",
        },
        {
            "id": "03_book_audit_detail",
            "content_crop_src": ".qc/test_detail_content.png",
            "title": "Book Details & Audit",
            "nav_type": "detail",
            "pill": "PEDAGOGICAL MATURITY AUDIT",
            "showcase_title": "4-Factor Safety Scorecard",
            "showcase_sub": "Violence, Language, Romance, and Sensitive Themes analysis",
        },
        {
            "id": "04_saved_reading_list",
            "content_crop_src": ".qc/test_saved_content.png",
            "title": "Saved Reading List",
            "nav_type": "saved",
            "pill": "PERSONAL READING LIST",
            "showcase_title": "Save Favorites for Later",
            "showcase_sub": "Keep track of vetted titles for your next library trip",
        },
        {
            "id": "05_settings_rubrics",
            "content_crop_src": ".qc/test_settings_content.png",
            "title": "Settings & Configuration",
            "nav_type": "settings",
            "pill": "DEVELOPMENTAL RUBRICS",
            "showcase_title": "Benchmarks for Every Grade",
            "showcase_sub": "Pedagogical guidelines calibrated for every year from 10 to 17",
        },
    ]

    # Destination directories
    dir_iphone_6_1 = SCREENSHOTS_DIR / "iphone_6.1"
    dir_iphone_6_5 = SCREENSHOTS_DIR / "iphone_6.5"
    dir_ipad_13 = SCREENSHOTS_DIR / "ipad_13"
    dir_ipad_12_9 = SCREENSHOTS_DIR / "ipad_12.9"
    dir_iphone_6_5_showcase = SCREENSHOTS_DIR / "iphone_6.5_showcase"

    for d in [dir_iphone_6_1, dir_iphone_6_5, dir_ipad_13, dir_ipad_12_9, dir_iphone_6_5_showcase]:
        d.mkdir(parents=True, exist_ok=True)

    # Process each screen
    for item in screens:
        screen_id = item["id"]
        content_path = REPO_ROOT / item["content_crop_src"]
        if not content_path.exists():
            print(f"Error: missing content source {content_path}")
            continue

        content_img = Image.open(content_path).convert("RGB")

        # 1. iPhone 6.1" (1170 x 2532)
        ip61 = generate_iphone_screen(
            content_img=content_img,
            target_width=1170,
            target_height=2532,
            title=item["title"],
            nav_type=item["nav_type"],
            status_bar_h=130,
            nav_h=118,
        )
        p_ip61 = dir_iphone_6_1 / f"{screen_id}.png"
        ip61.save(p_ip61, "PNG", optimize=True)
        print(f"[iPhone 6.1]  Saved {p_ip61.name} ({ip61.size[0]}x{ip61.size[1]} RGB)")

        # 2. iPhone 6.5" (1284 x 2778)
        ip65 = generate_iphone_screen(
            content_img=content_img,
            target_width=1284,
            target_height=2778,
            title=item["title"],
            nav_type=item["nav_type"],
            status_bar_h=145,
            nav_h=130,
        )
        p_ip65 = dir_iphone_6_5 / f"{screen_id}.png"
        ip65.save(p_ip65, "PNG", optimize=True)
        print(f"[iPhone 6.5]  Saved {p_ip65.name} ({ip65.size[0]}x{ip65.size[1]} RGB)")

        # 3. iPad 13" (2064 x 2752)
        ipad13 = generate_ipad_showcase_screen(
            phone_screen=ip61,
            target_width=2064,
            target_height=2752,
            pill_text=item["pill"],
            title_text=item["showcase_title"],
            subtitle_text=item["showcase_sub"],
        )
        p_ipad13 = dir_ipad_13 / f"{screen_id}.png"
        ipad13.save(p_ipad13, "PNG", optimize=True)
        print(f"[iPad 13\"]    Saved {p_ipad13.name} ({ipad13.size[0]}x{ipad13.size[1]} RGB)")

        # 4. iPad 12.9" (2048 x 2732)
        ipad129 = generate_ipad_showcase_screen(
            phone_screen=ip61,
            target_width=2048,
            target_height=2732,
            pill_text=item["pill"],
            title_text=item["showcase_title"],
            subtitle_text=item["showcase_sub"],
        )
        p_ipad129 = dir_ipad_12_9 / f"{screen_id}.png"
        ipad129.save(p_ipad129, "PNG", optimize=True)
        print(f"[iPad 12.9\"]  Saved {p_ipad129.name} ({ipad129.size[0]}x{ipad129.size[1]} RGB)")

        # 5. iPhone 6.5" Showcase Marketing Card (1284 x 2778)
        ip65_showcase = generate_iphone_showcase_screen(
            phone_screen=ip61,
            target_width=1284,
            target_height=2778,
            pill_text=item["pill"],
            title_text=item["showcase_title"],
            subtitle_text=item["showcase_sub"],
        )
        p_ip65_showcase = dir_iphone_6_5_showcase / f"{screen_id}.png"
        ip65_showcase.save(p_ip65_showcase, "PNG", optimize=True)
        print(f"[iPhone 6.5 Showcase] Saved {p_ip65_showcase.name} ({ip65_showcase.size[0]}x{ip65_showcase.size[1]} RGB)")

    print("\nAll screenshots generated successfully!")
    print(f"Output directory: {SCREENSHOTS_DIR}")


if __name__ == "__main__":
    main()
