/**
 * Cleans raw PDF text: strips decorative noise (underscore/dash/box-drawing
 * runs), collapses whitespace, drops blank lines, and removes stray controls.
 */
function cleanText(raw) {
  if (!raw) return '';

  const boxLineChars = '\u2500\u2501\u2502\u2503\u2504\u2505\u2506\u2507'; // ─━│┃┄┅┆┇
  const boxRe = new RegExp(`[${boxLineChars}]{2,}`, 'g');

  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/_{2,}/g, '')
        .replace(/-{3,}/g, '')
        .replace(/={2,}/g, '')
        .replace(/[.*+]{3,}/g, '')
        .replace(boxRe, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
    )
    .filter((line) => line.replace(/\s/g, '').length > 0)
    .join('\n')
    .trim();
}

module.exports = { cleanText };
