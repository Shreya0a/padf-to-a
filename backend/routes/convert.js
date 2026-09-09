const router = require('express').Router();
const upload = require('../middleware/upload');
const checkUsage = require('../middleware/checkUsage');
const Job = require('../models/Job');
const { synthesizeSpeech, FREE_VOICES, EDGE_VOICE_IDS } = require('../services/ttsService');
const { cleanText } = require('../services/textCleaner');
const { renderPdfToImages } = require('../services/pdfRenderer');
const { ocrPages } = require('../services/nvidiaVision');
const { extractPdfText } = require('../services/pdfTextExtractor');

const TEXT_CAP = 20000; // characters — controls TTS cost
const MIN_TEXT_FOR_OCR = 40; // below this we consider the PDF image-based

router.post('/', upload.single('file'), checkUsage, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const job = await Job.create({
    user: req.user?.id || null,
    ipHash: req.ipHash || null,
    inputFileName: req.file.originalname,
    status: 'processing',
  });

  try {
    const rawText = await extractPdfText(req.file.buffer);
    let text = cleanText(rawText);

    // Image-based PDF: text extraction returns little/nothing. Try NVIDIA vision OCR.
    if (text.length < MIN_TEXT_FOR_OCR && process.env.NVIDIA_API_KEY) {
      try {
        const pages = await renderPdfToImages(req.file.buffer);
        if (pages.length > 0) {
          const ocrText = cleanText(await ocrPages(pages));
          if (ocrText.length > text.length) text = ocrText;
        }
      } catch (err) {
        console.error('OCR fallback failed:', err.message);
      }
    }

    if (!text) {
      throw new Error(
        'No extractable text found in this PDF (it may be scanned images). ' +
          (process.env.NVIDIA_API_KEY
            ? ''
            : 'Set NVIDIA_API_KEY in the server .env to enable image reading.')
      );
    }

    text = text.slice(0, TEXT_CAP);

    const voice =
      EDGE_VOICE_IDS.includes(req.body?.voice) || FREE_VOICES.includes(req.body?.voice)
        ? req.body.voice
        : undefined;
    const tts = await synthesizeSpeech(text, voice);

    job.status = 'completed';
    job.outputUrl = tts.audioUrl || null;
    job.textBased = tts.textBased;
    job.textSnippet = text.slice(0, 500);
    await job.save();

    if (req.dbUser) {
      req.dbUser.monthlyUsageCount += 1;
      await req.dbUser.save();
    }

    res.json({
      jobId: job._id,
      audioUrl: tts.audioUrl,
      textBased: tts.textBased,
      text: text,
      voice: tts.voice || null,
    });
  } catch (err) {
    job.status = 'failed';
    job.errorMessage = err.message;
    await job.save();
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

module.exports = router;
