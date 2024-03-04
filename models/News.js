const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: String,
    status: {
        type: String,
        enum: ['Latest News', 'Feature News'],
        default: 'Latest News',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    thumbnail: String, 
    photos: [String], 
    shortDescription: String,
    longDescription: String,
});

const NewsModel = mongoose.model('News', NewsSchema);

module.exports = NewsModel;
