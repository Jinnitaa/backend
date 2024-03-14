const mongoose = require('mongoose');

const pipeQuoteSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  }
});

const PipeQuote = mongoose.model('PipeQuote', pipeQuoteSchema);

module.exports = PipeQuote;