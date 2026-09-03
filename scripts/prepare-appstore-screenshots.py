"""Prepare PNG screenshots for Apple App Store Connect (1284x2778, RGB, no alpha).
Usage:
  python scripts/prepare-appstore-screenshots.py [source_dir] [output_dir]

Defaults:
  source_dir: .qc
  output_dir: .qc/appstore_1284x2778
"""
import sys
from pathlib import Path
from PIL import Image

TARGET_WIDTH = 1284
TARGET_HEIGHT = 2778
BG_COLOR = (248, 250, 252)  # #F8FAFC matching Kona background


def prepare_screenshot(src_path: Path, dest_path: Path) -> None:
    im = Image.open(src_path)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        base = Image.new("RGB", im.size, BG_COLOR)
        base.paste(im, mask=im.split()[-1])
        im = base
    else:
        im = im.convert("RGB")

    orig_w, orig_h = im.size
    scale = min(TARGET_WIDTH / orig_w, TARGET_HEIGHT / orig_h)
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)

    resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (TARGET_WIDTH, TARGET_HEIGHT), BG_COLOR)
    offset_x = (TARGET_WIDTH - new_w) // 2
    offset_y = (TARGET_HEIGHT - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y))

    canvas.save(dest_path, "PNG", optimize=True)
    print(f"Generated {dest_path.name}: {canvas.size[0]}x{canvas.size[1]} RGB")


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else (root / ".qc")
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else (src_dir / "appstore_1284x2778")

    if not src_dir.is_dir():
        print(f"Source folder not found: {src_dir}")
        sys.exit(1)

    out_dir.mkdir(parents=True, exist_ok=True)

    # Key store screenshots to process
    target_names = [
        ("home_refined.png", "01_home_screen.png"),
        ("home_scrolled.png", "02_results_20_books.png"),
        ("book_detail.png", "03_age_appropriateness_audit.png"),
        ("saved_screen_verified.png", "04_saved_reading_list.png"),
        ("settings_screen.png", "05_age_rubrics_settings.png"),
    ]

    for src_name, out_name in target_names:
        p = src_dir / src_name
        if p.exists():
            prepare_screenshot(p, out_dir / out_name)
        else:
            print(f"Skipping missing: {src_name}")

    print(f"\nApp Store screenshots ready in:\n  {out_dir}")


if __name__ == "__main__":
    main()
