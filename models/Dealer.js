const mongoose = require('mongoose');

const DealerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['dealer', 'project_owner', 'constructor', 'designer'],
    required: true,
  },
  products: {
    type: [{
      type: String,
      enum: ['HDPE', 'LDPE', 'Fitting and Accessories'],
    }],
  },
  province: {
    type: String,
    required: true,
  },
});

const DealerModel = mongoose.model('dealer', DealerSchema);

module.exports = DealerModel;

