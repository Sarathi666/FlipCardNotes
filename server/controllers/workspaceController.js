const Workspace = require('../models/Workspace');

exports.getAll = async (req, res) => {
  try {
    // Only get workspaces for the current user
    const workspaces = await Workspace.find({ userId: req.user.userId });
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Error fetching workspaces' });
  }
};

exports.create = async (req, res) => {
  try {
    const workspace = new Workspace({
      ...req.body,
      userId: req.user.userId
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Error creating workspace' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the workspace belongs to the user
    const existingWorkspace = await Workspace.findOne({ 
      _id: id,
      userId: req.user.userId 
    });

    if (!existingWorkspace) {
      return res.status(404).json({ message: 'Workspace not found or not authorized' });
    }

    const updateData = { ...req.body };

    // Handle file update
    if (updateData.book) {
      // If no new file is uploaded, keep the existing file
      if (!updateData.book.name) {
        updateData.book = existingWorkspace.book;
      }
    }

    const updated = await Workspace.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ 
      message: 'Error updating workspace',
      error: error.message 
    });
  }
};

exports.remove = async (req, res) => {
  try {
    // First check if the workspace belongs to the user
    const workspace = await Workspace.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or not authorized' });
    }

    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ message: 'Error deleting workspace' });
  }
};
