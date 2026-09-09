const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runPython } = require('./runPython');

const PYTHON = process.env.EDGE_TTS_PYTHON || 'python';
const SCRIPT = path.join(__dirname, 'pdf_to_png.py');
const RENDER_DPI = Number(process.env.NVIDIA_RENDER_DPI) || 200;
const MAX_PAGES = Number(process.env.NVIDIA_MAX_PAGES) || 5;

/**
 * Renders a PDF buffer into base64 PNG data URLs (max `maxPages` pages).
 * Higher DPI gives noticeably better OCR, at the cost of larger payloads.
 * Returns [] if rendering fails for any reason — callers decide how to fall back.
 */
async function renderPdfToImages(pdfBuffer, { dpi = RENDER_DPI, maxPages = MAX_PAGES } = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf_pages_'));
  const pdfPath = path.join(tmpDir, 'input.pdf');
  const outDir = path.join(tmpDir, 'pages');
  const out = [];

  try {
    fs.writeFileSync(pdfPath, pdfBuffer);
    await runPython(
      PYTHON,
      [SCRIPT, '--in', pdfPath, '--out-dir', outDir, '--dpi', String(dpi), '--max-pages', String(maxPages)],
      ''
    );

    const pngPaths = fs
      .readdirSync(outDir)
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => path.join(outDir, f));

    for (const p of pngPaths) {
      const b64 = fs.readFileSync(p).toString('base64');
      out.push(`data:image/png;base64,${b64}`);
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* best effort cleanup */
    }
  }

  return out;
}

module.exports = { renderPdfToImages };
