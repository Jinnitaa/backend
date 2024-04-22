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
    thumbnail: {
        url: String, // URL of the thumbnail image
        public_id: String // Public ID of the thumbnail image on Cloudinary
    }, 
    photos: [{
        url: String, // URL of the photo
        public_id: String // Public ID of the photo on Cloudinary
    }], 
    shortDescription: String,
    longDescription: String,
});

const NewsModel = mongoose.model('News', NewsSchema);

module.exports = NewsModel;
