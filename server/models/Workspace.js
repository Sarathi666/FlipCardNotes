const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  title: String,
  description: String,
  book: {
    name: String,
    url: String,
  },
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
