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
    console.log('Creating workspace...');
    const workspaceData = {
      ...req.body,
      userId: req.user.userId
    };

    // If there's a book with base64 data
    if (workspaceData.book && workspaceData.book.data) {
      try {
        console.log('Processing PDF data...');
        console.log('PDF name:', workspaceData.book.name);
        console.log('Data length:', workspaceData.book.data.length);

        // Validate the base64 data format
        if (!workspaceData.book.data.startsWith('data:application/pdf;base64,')) {
          console.error('Invalid PDF format - data does not start with expected prefix');
          throw new Error('Invalid PDF format');
        }

        // Extract the base64 data
        const base64Data = workspaceData.book.data.split(';base64,').pop();
        if (!base64Data) {
          console.error('Invalid PDF data - no base64 content found');
          throw new Error('Invalid PDF data');
        }

        console.log('Base64 data length:', base64Data.length);

        // Convert to Buffer
        workspaceData.book.data = Buffer.from(base64Data, 'base64');
        workspaceData.book.contentType = 'application/pdf';
        
        console.log('PDF processed successfully');
      } catch (error) {
        console.error('Error processing PDF:', error);
        return res.status(400).json({ 
          message: 'Invalid PDF file. Please try a different file.',
          error: error.message,
          details: error.stack
        });
      }
    }

    console.log('Creating new workspace document...');
    const workspace = new Workspace(workspaceData);
    await workspace.save();
    
    // Don't send the file data back in the response
    const response = workspace.toObject();
    if (response.book && response.book.data) {
      delete response.book.data;
    }
    
    console.log('Workspace created successfully');
    res.status(201).json(response);
  } catch (error) {
    console.error('Error in workspace creation:', error);
    res.status(500).json({ 
      message: 'Error creating workspace',
      error: error.message,
      details: error.stack
    });
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
      if (updateData.book.data) {
        try {
          // Validate the base64 data format
          if (!updateData.book.data.startsWith('data:application/pdf;base64,')) {
            throw new Error('Invalid PDF format');
          }

          // Extract the base64 data
          const base64Data = updateData.book.data.split(';base64,').pop();
          if (!base64Data) {
            throw new Error('Invalid PDF data');
          }

          // Convert to Buffer
          updateData.book.data = Buffer.from(base64Data, 'base64');
          updateData.book.contentType = 'application/pdf';
        } catch (error) {
          console.error('Error processing PDF:', error);
          return res.status(400).json({ 
            message: 'Invalid PDF file. Please try a different file.',
            error: error.message 
          });
        }
      } else {
        // If no new file is uploaded, keep the existing file data
        updateData.book.data = existingWorkspace.book.data;
        updateData.book.contentType = existingWorkspace.book.contentType;
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

    // Don't send the file data back in the response
    const response = updated.toObject();
    if (response.book && response.book.data) {
      delete response.book.data;
    }

    res.json(response);
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

exports.getPdf = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });

    if (!workspace || !workspace.book || !workspace.book.data) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.setHeader('Content-Type', workspace.book.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${workspace.book.name}"`);
    res.send(workspace.book.data);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(500).json({ message: 'Error fetching PDF' });
  }
};
