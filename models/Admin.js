const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const   AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;