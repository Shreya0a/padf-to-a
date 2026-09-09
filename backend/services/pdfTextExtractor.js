const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runPython } = require('./runPython');

const PYTHON = process.env.EDGE_TTS_PYTHON || 'python';
const SCRIPT = path.join(__dirname, 'pdf_to_text.py');

/** Extracts raw text from a PDF buffer using pymupdf. Returns '' for image-only PDFs. */
async function extractPdfText(pdfBuffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf_text_'));
  const pdfPath = path.join(tmpDir, 'input.pdf');

  try {
    fs.writeFileSync(pdfPath, pdfBuffer);
    const { stdout } = await runPython(PYTHON, [SCRIPT, '--in', pdfPath], '');
    return stdout;
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* best effort cleanup */
    }
  }
}

module.exports = { extractPdfText };
