import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const WorkspaceForm = ({
  onSave,
  onClose,
  initialTitle = '',
  initialDescription = '',
  initialBook = null,
  workspaceId = null
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [book, setBook] = useState(initialBook);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setBook(initialBook);
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, [initialTitle, initialDescription, initialBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const workspaceData = {
        id: workspaceId || Date.now(),
        title: title.trim(),
        description: description.trim(),
        book: book ? {
          name: book.name,
          url: book.url
        } : null
      };

      await onSave(workspaceData);
      onClose();
    } catch (error) {
      console.error('Error saving workspace:', error);
      setError('Failed to save workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB.');
      return;
    }

    try {
      const fileURL = URL.createObjectURL(file);
      setBook({
        name: file.name,
        url: fileURL,
        file: file
      });
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

  const handleClearBook = () => {
    if (book?.url) {
      URL.revokeObjectURL(book.url);
    }
    setBook(null);
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{workspaceId ? 'Edit Workspace' : 'Create New Workspace'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

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
                  onClick={handleClearBook}
                  title="Clear File"
                >
                  Clear
                </Button>
              )}
            </div>

            {book && book.name && (
              <small className="text-success d-block mt-1">
                PDF Uploaded: {book.name}
              </small>
            )}

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

          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (workspaceId ? 'Save Changes' : 'Create')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default WorkspaceForm;
