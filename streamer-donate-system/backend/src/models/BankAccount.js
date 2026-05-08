const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankCode: {
    type: String,
    required: true,
    enum: [
      'KBANK', 'SCB', 'BBL', 'BAY', 'KTB', 
      'TMB', 'UOB', 'CITI', 'GSB', 'BAAC',
      'OTHER'
    ]
  },
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  qrCodeImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure only one primary account per streamer
bankAccountSchema.index({ streamer: 1, isPrimary: 1 });

// Pre-save hook to ensure only one primary account
bankAccountSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    // Reset other primary accounts for this streamer
    await this.constructor.updateMany(
      { streamer: this.streamer, isPrimary: true, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

// Static method to get primary account
bankAccountSchema.statics.getPrimaryAccount = async function(streamerId) {
  const primary = await this.findOne({ streamer: streamerId, isPrimary: true, isActive: true });
  if (primary) return primary;
  
  // If no primary, return first active account
  return this.findOne({ streamer: streamerId, isActive: true }).sort({ displayOrder: 1 });
};

module.exports = mongoose.model('BankAccount', bankAccountSchema);
