const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: String,
    filePath: String, // Changed from 'file' to 'filePath'
});

const ResourceModel = mongoose.model("resource", ResourceSchema);

module.exports = ResourceModel;