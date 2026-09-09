"""Edge TTS CLI wrapper used by the Node backend.

Reads text from stdin, synthesizes speech with an edge-tts neural voice,
and writes the MP3 to --out. Exits non-zero on failure.
"""

import argparse
import asyncio
import sys


async def synthesize(text: str, voice: str, out: str, rate: str, pitch: str) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(out)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--pitch", default="+0Hz")
    args = parser.parse_args()

    text = sys.stdin.read()
    if not text.strip():
        print("No text received on stdin", file=sys.stderr)
        return 1

    try:
        asyncio.run(synthesize(text, args.voice, args.out, args.rate, args.pitch))
    except Exception as err:  # noqa: BLE001 - surface any failure to Node
        print(f"edge-tts failed: {err}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
