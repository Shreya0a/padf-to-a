const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runPython } = require('../services/runPython');
const { EDGE_VOICES } = require('../services/ttsService');

const PYTHON = process.env.EDGE_TTS_PYTHON || 'python';
const SCRIPT = path.join(__dirname, '..', 'services', 'edge_tts_cli.py');
const OUT_DIR = path.join(__dirname, '..', 'uploads', 'samples');

const SCRIPTS = {
  'en-US-JennyNeural':
    "Hi, I'm Jenny. Did you know your brain listens faster than it reads? Turn your next document into a story you can enjoy.",
  'en-US-GuyNeural':
    "Hello, I'm Guy. I can read reports, articles, and long emails out loud. Just upload a PDF and press play.",
  'en-US-AriaNeural':
    "Hi, I'm Aria. Listening while you walk or cook saves you so much time. Let me read your files for you.",
  'en-US-ChristopherNeural':
    "Hello, I'm Christopher. My deep voice is a great fit for long reports and audiobooks. Hand me a PDF and I'll take it from here.",
  'en-US-MichelleNeural':
    "Hi, I'm Michelle. I have a warm and friendly tone. I'm perfect for newsletters, stories, and everyday reading.",
  'en-US-EricNeural':
    "Hello, I'm Eric. Bright and clear, I make technical text easy to follow. Let's get you listening today.",
  'en-GB-SoniaNeural':
    "Hi, I'm Sonia. I speak crisp British English. I'm well suited to presentations and professional documents.",
  'en-GB-RyanNeural':
    "Hello, I'm Ryan. I'm a calm British voice for lectures and long-form content. Sit back and relax.",
  'en-GB-LibbyNeural':
    "Hi, I'm Libby. I read clearly and gently. I'm a lovely companion for stories and study notes.",
  'en-GB-ThomasNeural':
    "Hello, I'm Thomas. My steady British tone works well for news and articles. Go ahead, try me out.",
  'en-AU-NatashaNeural':
    "Hi, I'm Natasha. I bring an Australian accent to your reading. Great for podcasts and casual content.",
  'en-AU-WilliamNeural':
    "Hello, I'm William. I'm an easy-going Australian voice, happy to read all kinds of documents.",
  'en-CA-ClaraNeural':
    "Hi, I'm Clara. I speak with a Canadian accent, clear and friendly. Let's turn your PDF into audio.",
  'en-IE-EmilyNeural':
    "Hello, I'm Emily. I have an Irish lilt that makes any text sound pleasant. Give me a try.",
  'en-IN-NeerjaNeural':
    "Hi, I'm Neerja. I speak Indian English, warm and natural. I'm perfect for presentations and lessons.",
  'en-NZ-MollyNeural':
    "Hello, I'm Molly. I read with a New Zealand accent, bright and welcoming. Happy to help you listen.",
};

async function generateAll({ force = false } = {}) {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const v of EDGE_VOICES) {
    const out = path.join(OUT_DIR, `${v.id}.mp3`);
    if (!force && fs.existsSync(out)) {
      console.log(`skip  ${v.id} (exists)`);
      continue;
    }

    const tmp = path.join(os.tmpdir(), `sample_${v.id}_${Date.now()}.mp3`);
    const script = SCRIPTS[v.id] || `Hi, I am ${v.label.split(' (')[0]}. Welcome to Voxa.`;
    try {
      await runPython(PYTHON, [SCRIPT, '--voice', v.id, '--out', tmp], script);
      fs.copyFileSync(tmp, out);
      console.log(`done  ${v.id}`);
    } catch (err) {
      console.error(`FAIL  ${v.id}: ${err.message}`);
    } finally {
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* best effort cleanup */
      }
    }
  }
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  generateAll({ force });
}

module.exports = { generateAll, SCRIPTS };
