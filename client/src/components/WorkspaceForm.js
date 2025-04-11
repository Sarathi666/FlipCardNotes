import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const WorkspaceForm = ({
  onSave,
  onClose,
  initialTitle = '',
  initialDescription = '',
  initialBook = null, // NEW: add support for file preview
  workspaceId = null
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [book, setBook] = useState(initialBook); // NEW
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setBook(initialBook); // NEW
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, [initialTitle, initialDescription, initialBook]);


 
  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim() && description.trim()) {
      const workspaceData = {
        id: workspaceId || Date.now(),
        title,
        description,
        book, // NEW: save the file
        cards: workspaceId ? undefined : []
      };

      onSave(workspaceData);
      onClose();
    }
  };

  const handleBookUpload = (e) => { // NEW
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(file);
      file.url = fileURL; // attach preview URL for local use
      setBook(file);
    } else {
      alert('Please upload a valid PDF file.');
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
              ref={titleRef}
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
          <Form.Group className="mb-3">
  <Form.Label>Upload Book (PDF)</Form.Label>
  <div className="d-flex align-items-center gap-2">
    <Form.Control
      type="file"
      accept="application/pdf"
      onChange={handleBookUpload}
      style={{ maxWidth: '75%' }}
    />
    {book && (
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => setBook(null)}
        title="Clear File"
      >
        Clear
      </Button>
    )}
  </div>

  {/* Uploaded File Name */}
  {book && book.name && (
    <small className="text-success d-block mt-1">
      PDF Uploaded: {book.name}
    </small>
  )}

  {/* PDF Preview */}
  {book?.url && (
    <div className="mt-2">
      <iframe
        src={book.url}
        width="100%"
        height="200px"
        title="PDF Preview"
        style={{ border: '1px solid #ccc', borderRadius: '4px' }}
      />
    </div>
  )}
</Form.Group>


          <Form.Control type="submit" hidden />
          <Button variant="primary" type="submit">
            {workspaceId ? 'Save Changes' : 'Create'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default WorkspaceForm;
