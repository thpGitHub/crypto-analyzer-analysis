const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  cryptocurrency: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  recommendation: {
    type: String,
    enum: ['buy', 'sell', 'hold'],
    required: true
  },
  reasons: [{
    type: String
  }],
  stats: {
    totalNews: {
      type: Number,
      default: 0
    },
    positiveNews: {
      type: Number,
      default: 0
    },
    negativeNews: {
      type: Number,
      default: 0
    }
  },
  sources: [{
    title: String,
    url: String,
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema); 