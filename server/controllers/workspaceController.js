const Workspace = require('../models/Workspace');

exports.getAll = async (req, res) => {
  const workspaces = await Workspace.find();
  res.json(workspaces);
};

exports.create = async (req, res) => {
  const workspace = new Workspace(req.body);
  await workspace.save();
  res.json(workspace);
};

exports.update = async (req, res) => {
  const updated = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.remove = async (req, res) => {
  await Workspace.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};
