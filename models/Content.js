const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: String }, 
    author: { type: String, required: true },
    // ADD THIS LINE:
    authorEmail: { type: String, required: true }, 
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);