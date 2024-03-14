const mongoose = require('mongoose');

const pipeQuoteSchema = new mongoose.Schema({
  pipeName: {
    type: String,
    required: true
  },
  diameter: {
    type: String,
    required: true
  },
  pressure: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

const PipeQuote = mongoose.model('PipeQuote', pipeQuoteSchema);

module.exports = PipeQuote;