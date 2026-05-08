const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  channelTitle: {
    type: String,
    trim: true
  },
  profileUrl: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'streamer', 'admin'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ youtubeId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
