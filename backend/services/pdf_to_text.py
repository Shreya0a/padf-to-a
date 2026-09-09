"""Extracts text from a PDF using pymupdf (far more reliable than pdf.js).

Usage: python pdf_to_text.py --in <pdf>
Prints the extracted text to stdout. Prints nothing for image-only PDFs.
"""

import argparse
import sys

# Windows default console encoding (cp1252) can't encode all PDF glyphs.
# Force UTF-8 so extraction doesn't crash on bullet/symbol characters.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="in_path", required=True)
    args = parser.parse_args()

    try:
        import fitz
    except ImportError:
        print("pymupdf is not installed. Run: pip install pymupdf", file=sys.stderr)
        return 1

    try:
        doc = fitz.open(args.in_path)
    except Exception as err:  # noqa: BLE001
        print(f"Failed to open PDF: {err}", file=sys.stderr)
        return 1

    parts = []
    for page in doc:
        text = page.get_text("text")
        if text and text.strip():
            parts.append(text.strip())

    doc.close()
    sys.stdout.write("\n\n".join(parts))
    return 0


if __name__ == "__main__":
    sys.exit(main())
