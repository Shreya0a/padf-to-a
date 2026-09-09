const DEFAULT_MODEL = 'meta/llama-3.2-90b-vision-instruct';

const PROMPT = [
  'You are a highly accurate OCR engine for scanned documents.',
  'Extract ALL visible text from this image of a PDF page, verbatim and exactly as written.',
  'Preserve the natural reading order, including multi-column layouts, and keep paragraph and line breaks.',
  'Do not summarize, translate, rephrase, or correct any wording.',
  'Ignore decorative elements such as page numbers, running headers and footers, underlines, underscore runs, and separator dashes — unless they are part of the content.',
  'Output ONLY the extracted plain text. No commentary, no headings, no markdown, no bullet lists.',
].join(' ');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads text from a base64 PNG data URL using NVIDIA NIM (free tier, OpenAI-compatible).
 * Requires NVIDIA_API_KEY. Retries transient failures once with backoff.
 */
async function ocrPage(dataUrl, { apiKey, model = DEFAULT_MODEL } = {}) {
  let lastErr;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let res;
    try {
      res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 6000,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PROMPT },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = (json.choices?.[0]?.message?.content || '').trim();
        if (text) return text;
        throw new Error('OCR returned empty text');
      }

      const body = await res.text();
      const status = res.status === 401 ? 'Invalid NVIDIA_API_KEY' : `NVIDIA API error ${res.status}`;
      throw new Error(`${status}: ${body.slice(0, 200)}`);
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await sleep(1500 * attempt);
    }
  }

  throw lastErr || new Error('OCR failed');
}

/** OCRs an array of page data URLs, joining results in page order. */
async function ocrPages(pageDataUrls) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is not set');

  const model = process.env.NVIDIA_VISION_MODEL || DEFAULT_MODEL;
  const parts = [];

  for (const [i, dataUrl] of pageDataUrls.entries()) {
    try {
      const text = await ocrPage(dataUrl, { apiKey, model });
      if (text) parts.push(text);
    } catch (err) {
      parts.push(`[page ${i + 1} OCR failed: ${err.message}]`);
    }
  }

  return parts.join('\n\n');
}

module.exports = { ocrPages };
