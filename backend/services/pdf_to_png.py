"""Renders PDF pages to PNG images for OCR.

Usage: python pdf_to_png.py --in <pdf> --out-dir <dir> [--dpi 150] [--max-pages N]
Prints the absolute path of each generated PNG, one per line, to stdout.
"""

import argparse
import os
import sys


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--dpi", type=int, default=150)
    parser.add_argument("--max-pages", type=int, default=5)
    args = parser.parse_args()

    try:
        import fitz
    except ImportError:
        print("pymupdf is not installed. Run: pip install pymupdf", file=sys.stderr)
        return 1

    if not os.path.exists(args.in_path):
        print(f"PDF not found: {args.in_path}", file=sys.stderr)
        return 1

    os.makedirs(args.out_dir, exist_ok=True)

    try:
        doc = fitz.open(args.in_path)
    except Exception as err:  # noqa: BLE001
        print(f"Failed to open PDF: {err}", file=sys.stderr)
        return 1

    page_count = min(doc.page_count, args.max_pages)
    for i in range(page_count):
        pix = doc[i].get_pixmap(dpi=args.dpi)
        out_path = os.path.join(args.out_dir, f"page_{i + 1:03d}.png")
        pix.save(out_path)
        print(out_path)

    doc.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
