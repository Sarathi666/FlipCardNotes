const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  question: String,
  answer: String,
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
