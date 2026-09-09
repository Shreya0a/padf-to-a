const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    stripeCustomerId: { type: String },
    monthlyUsageCount: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    plan: this.plan,
    monthlyUsageCount: this.monthlyUsageCount,
    usageResetAt: this.usageResetAt,
  };
};

module.exports = mongoose.model('User', userSchema);
