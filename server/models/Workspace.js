const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  title: String,
  description: String,
  book: {
    name: String,
    url: String,
    data: Buffer,
    contentType: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
