
const mongoose = require('mongoose');
const CareerSchema = new mongoose.Schema({
    title: String,
    description: String,
    jobType: {
        type: String,
        enum: ['Full time', 'Part time'],
        default: 'Full time',
    },
    salary: String,
    experience: String,
    position: String,
    deadline: {
        type: Date,
        default: Date.now,
    },
    role: String,
    requirement: String,

});

const CareerModel = mongoose.model('Career', CareerSchema);

module.exports = CareerModel;