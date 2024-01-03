const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  // Add other note fields
});

// Create a text index on the title and content fields
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);