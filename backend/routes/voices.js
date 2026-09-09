const router = require('express').Router();
const { EDGE_VOICES } = require('../services/ttsService');

router.get('/', (req, res) => {
  res.json({
    voices: EDGE_VOICES.map((v) => ({
      id: v.id,
      label: v.label,
      sampleUrl: `/uploads/samples/${v.id}.mp3`,
    })),
  });
});

module.exports = router;
