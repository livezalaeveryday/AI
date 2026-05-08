const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'THB',
    enum: ['THB']
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
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending'
  },
  slipImage: {
    type: String,
    default: null
  },
  transactionRef: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date
  },
  isShownOnOverlay: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for faster queries
donationSchema.index({ streamer: 1, status: 1, createdAt: -1 });
donationSchema.index({ user: 1, createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

module.exports = mongoose.model('Donation', donationSchema);
