import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const WorkspaceForm = ({
  onSave,
  onClose,
  initialTitle = '',
  initialDescription = '',
  workspaceId = null // Null for add mode, ID for edit mode
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // ✅ Update fields when in edit mode
  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim() && description.trim()) {
      const workspaceData = {
        id: workspaceId || Date.now(),   // Use existing ID or generate a new one
        title,
        description,
        cards: workspaceId ? undefined : []  // Empty array only for new workspaces
      };

      onSave(workspaceData);
      onClose(); // Close modal after saving
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{workspaceId ? 'Edit Workspace' : 'Create New Workspace'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Workspace Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {workspaceId ? 'Save Changes' : 'Create'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default WorkspaceForm;
