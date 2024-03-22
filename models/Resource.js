const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
    title: String,
    link: String, // Change 'file' to 'link' in the schema
});

const ResourceModel = mongoose.model("resource", ResourceSchema);
module.exports = ResourceModel;