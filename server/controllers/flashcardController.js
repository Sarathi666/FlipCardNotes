const Flashcard = require('../models/Flashcard');

exports.getByWorkspace = async (req, res) => {
  const cards = await Flashcard.find({ workspaceId: req.params.workspaceId });
  res.json(cards);
};

exports.create = async (req, res) => {
  const card = new Flashcard(req.body);
  await card.save();
  res.json(card);
};

exports.update = async (req, res) => {
  const updated = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.remove = async (req, res) => {
  await Flashcard.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
