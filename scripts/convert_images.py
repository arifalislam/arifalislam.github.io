from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
EXCLUDED_DIRS = {".git", "node_modules", ".venv"}
EXTENSIONS = {".png", ".jpg", ".jpeg"}
PRESERVED_WEBP = {Path("2023/images/case_study/dof.webp")}


def convert_image(source: Path) -> Optional[Tuple[int, int]]:
    destination = source.with_suffix(".webp")
    if destination.relative_to(ROOT) in PRESERVED_WEBP:
        return None

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        has_alpha = "A" in image.getbands() or "transparency" in image.info
        output = image.convert("RGBA" if has_alpha else "RGB")
        quality = 82 if source.suffix.lower() == ".png" else 75
        qualities = list(range(quality, 49, -5))
        encoded = BytesIO()
        for quality in qualities:
            encoded.seek(0)
            encoded.truncate()
            output.save(
                encoded,
                format="WEBP",
                quality=quality,
                method=6,
                icc_profile=image.info.get("icc_profile"),
            )
            if encoded.tell() < source.stat().st_size:
                break
        destination.write_bytes(encoded.getvalue())

    return source.stat().st_size, destination.stat().st_size


def main() -> None:
    converted = 0
    skipped = 0
    original_bytes = 0
    webp_bytes = 0

    for source in sorted(ROOT.rglob("*")):
        if not source.is_file() or source.suffix.lower() not in EXTENSIONS:
            continue
        if EXCLUDED_DIRS.intersection(source.relative_to(ROOT).parts):
            continue

        sizes = convert_image(source)
        if sizes is None:
            skipped += 1
            print(f"Kept existing WebP: {source.with_suffix('.webp').relative_to(ROOT)}")
            continue

        source_size, webp_size = sizes
        converted += 1
        original_bytes += source_size
        webp_bytes += webp_size
        print(
            f"{source.relative_to(ROOT)} -> "
            f"{source.with_suffix('.webp').relative_to(ROOT)} "
            f"({source_size:,} -> {webp_size:,} bytes)"
        )

    saved = original_bytes - webp_bytes
    percentage = (saved / original_bytes * 100) if original_bytes else 0
    print(
        f"Converted {converted} image(s); kept {skipped} existing WebP file(s). "
        f"Saved {saved:,} bytes ({percentage:.1f}%) across converted images."
    )


if __name__ == "__main__":
    main()
