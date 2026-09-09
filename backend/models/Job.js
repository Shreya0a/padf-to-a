const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ipHash: { type: String }, // for anonymous rate limiting
    type: { type: String, default: 'pdf-to-audio' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    inputFileName: String,
    outputUrl: String,
    textSnippet: String,
    textBased: { type: Boolean, default: false },
    errorMessage: String,
  },
  { timestamps: true }
);

jobSchema.index({ user: 1, createdAt: -1 });
jobSchema.index({ ipHash: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
