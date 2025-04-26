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
      console.log('Starting workspace submission...');
      let bookData = null;
      
      if (book) {
        console.log('Processing book data:', {
          name: book.name,
          dataLength: book.data ? book.data.length : 0
        });

        bookData = {
          name: book.name,
          data: book.data
        };

        // Validate the base64 data
        if (!bookData.data || !bookData.data.startsWith('data:application/pdf;base64,')) {
          console.error('Invalid PDF data format');
          throw new Error('Invalid PDF data format');
        }
      }

      const workspaceData = {
        id: workspaceId || Date.now(),
        title: title.trim(),
        description: description.trim(),
        book: bookData
      };

      console.log('Sending workspace data to server...');
      await onSave(workspaceData);
      console.log('Workspace saved successfully');
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Failed to save workspace. Please try again with a different PDF file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    // Increased size limit to 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert('File size should be less than 50MB.');
      return;
    }

    try {
      // Create a FileReader to read the file as base64
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('File read successfully, creating URL...');
          const fileURL = URL.createObjectURL(file);
          const fileData = e.target.result;
          console.log('File data length:', fileData.length);
          
          setBook({
            name: file.name,
            url: fileURL,
            data: fileData
          });
          console.log('Book state updated successfully');
        } catch (error) {
          console.error('Error in reader.onload:', error);
          alert('Error processing file. Please try a different PDF file.');
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert('Error reading file. Please try a different PDF file.');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in handleBookUpload:', error);
      alert('Error processing file. Please try a different PDF file.');
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
