const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { uploadBuffer } = require('./storageService');
const { runPython } = require('./runPython');

const FREE_VOICES = [
  'US English Female',
  'US English Male',
  'UK English Female',
  'UK English Male',
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',
  'Daniel',
  'Aria',
  'Amy',
  'Matthew',
];

// Microsoft Edge neural voices (via edge-tts, no API key). Friendly label first.
const EDGE_VOICES = [
  { id: 'en-US-JennyNeural', label: 'Jenny (US Female)' },
  { id: 'en-US-GuyNeural', label: 'Guy (US Male)' },
  { id: 'en-US-AriaNeural', label: 'Aria (US Female, expressive)' },
  { id: 'en-US-ChristopherNeural', label: 'Christopher (US Male, deep)' },
  { id: 'en-US-MichelleNeural', label: 'Michelle (US Female, warm)' },
  { id: 'en-US-EricNeural', label: 'Eric (US Male, bright)' },
  { id: 'en-GB-SoniaNeural', label: 'Sonia (UK Female, crisp)' },
  { id: 'en-GB-RyanNeural', label: 'Ryan (UK Male, calm)' },
  { id: 'en-GB-LibbyNeural', label: 'Libby (UK Female)' },
  { id: 'en-GB-ThomasNeural', label: 'Thomas (UK Male)' },
  { id: 'en-AU-NatashaNeural', label: 'Natasha (AU Female)' },
  { id: 'en-AU-WilliamNeural', label: 'William (AU Male)' },
  { id: 'en-CA-ClaraNeural', label: 'Clara (CA Female)' },
  { id: 'en-IE-EmilyNeural', label: 'Emily (IE Female)' },
  { id: 'en-IN-NeerjaNeural', label: 'Neerja (IN Female)' },
  { id: 'en-NZ-MollyNeural', label: 'Molly (NZ Female)' },
];

const EDGE_VOICE_IDS = EDGE_VOICES.map((v) => v.id);
const EDGE_SCRIPT = path.join(__dirname, 'edge_tts_cli.py');

/**
 * Converts plain text into an audio buffer.
 *
 * - provider 'edge' (default) uses Microsoft Edge neural voices via the
 *   edge-tts Python library — no API key needed.
 * - provider 'google' (set TTS_PROVIDER=google + GOOGLE_API_KEY) uses the
 *   Google Cloud Text-to-Speech REST API.
 * - provider 'free' uses the free ResponsiveVoice endpoint.
 * - `voice` must be one of the allowlisted names/ids.
 */
async function synthesizeSpeech(text, voice) {
  const provider = process.env.TTS_PROVIDER || 'edge';

  if (provider === 'edge') {
    return edgeSynthesize(text, voice);
  }

  if (provider === 'google') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('TTS_PROVIDER=google but GOOGLE_API_KEY is not set');
    const configuredVoice = process.env.GOOGLE_TTS_VOICE || 'en-US-Neural2-J';

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: configuredVoice.split('-').slice(0, 2).join('-'),
            name: configuredVoice,
          },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google TTS error ${res.status}: ${body.slice(0, 300)}`);
    }

    const json = await res.json();
    const audioBuffer = Buffer.from(json.audioContent, 'base64');
    const url = await uploadBuffer(audioBuffer, 'speech.mp3', 'audio/mpeg');
    return { textBased: false, audioUrl: url };
  }

  // Free ResponsiveVoice provider (default)
  const selected = FREE_VOICES.includes(voice) ? voice : process.env.FREE_TTS_VOICE || 'US English Female';
  const url =
    'https://texttospeech.responsivevoice.org/v1/text:synthesize' +
    `?text=${encodeURIComponent(text)}` +
    `&lang=en-US` +
    `&engine=g1` +
    `&name=${encodeURIComponent(selected)}` +
    `&voice=`;

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    throw new Error(`Free TTS error ${res.status}`);
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  const audioUrl = await uploadBuffer(audioBuffer, 'speech.mp3', 'audio/mpeg');
  return { textBased: false, audioUrl, voice: selected };
}

/**
 * Synthesizes with Microsoft Edge neural voices via the edge-tts CLI wrapper.
 * Requires `python` + `pip install edge-tts` on the machine.
 */
async function edgeSynthesize(text, voice) {
  const selected = EDGE_VOICE_IDS.includes(voice) ? voice : process.env.EDGE_TTS_VOICE || 'en-US-JennyNeural';
  const python = process.env.EDGE_TTS_PYTHON || 'python';

  const tmpFile = path.join(
    os.tmpdir(),
    `edge_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`
  );

  try {
    await runPython(python, [EDGE_SCRIPT, '--voice', selected, '--out', tmpFile], text);

    const audioBuffer = fs.readFileSync(tmpFile);
    const audioUrl = await uploadBuffer(audioBuffer, 'speech.mp3', 'audio/mpeg');
    return { textBased: false, audioUrl, voice: selected };
  } finally {
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      /* best effort cleanup */
    }
  }
}

module.exports = { synthesizeSpeech, FREE_VOICES, EDGE_VOICES, EDGE_VOICE_IDS };
