import React, { useState, useEffect } from 'react';  
import { Modal, Form, Button } from 'react-bootstrap';  

const FlashcardForm = ({
  show,
  onHide,
  onSave,
  onDelete,
  initialQuestion = '',
  initialAnswer = '',
  cardId = null,
  
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
 
  useEffect(() => {
    setQuestion(initialQuestion);
    setAnswer(initialAnswer);
  }, [initialQuestion, initialAnswer]);


  // ✅ Submit handler for the form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      
      onSave(question, answer, cardId);

      onHide(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{cardId ? 'Edit Flashcard' : 'Add Flashcard'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ✅ Wrap the inputs with Form and use onSubmit */}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formQuestion">
            <Form.Label>Question</Form.Label>
            <Form.Control
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question"
              autoFocus
              required  // ✅ Ensure fields are required
            />
          </Form.Group>

          <Form.Group controlId="formAnswer" className="mt-3">
            <Form.Label>Answer</Form.Label>
            <Form.Control
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter answer"
              required
            />
          </Form.Group>


          {/* ✅ The submit button will be triggered by Enter */}
          <Modal.Footer>
             {/* Delete Button - Only shows when editing an existing card */}
        {cardId && (
          <Button
            variant="danger"
            onClick={() => {
             
                onDelete(cardId);  // Delete the flashcard
                onHide();           // Close the modal after deletion
              
            }}
          >
            Delete
          </Button>
        )}
            <Button variant="primary" type="submit">
              {cardId ? 'Save Changes' : 'Add Flashcard'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FlashcardForm;
