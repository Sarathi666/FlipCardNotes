import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import axios from 'axios';

import TitleBar from '../components/TitleBar';
import Flashcard from '../components/Flashcard';
import FlashcardForm from '../components/FlashcardForm';

const Vault = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState(null);

  useEffect(() => {
    fetchWorkspace();
    fetchFlashcards();

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setEditingCard(null);
        setShowForm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id]);

  const fetchWorkspace = async () => {
    const res = await axios.get('/api/workspaces');
    const workspace = res.data.find(w => w._id === id);
    setCurrentWorkspace(workspace);
  };

  const fetchFlashcards = async () => {
    const res = await axios.get(`/api/flashcards/${id}`);
    setFlashcards(res.data);
  };

  const handleSaveFlashcard = async (question, answer, cardId = null) => {
    if (cardId) {
      await axios.put(`/api/flashcards/${cardId}`, { question, answer });
    } else {
      await axios.post(`/api/flashcards`, {
        question,
        answer,
        workspaceId: id,
      });
    }
    fetchFlashcards();
    setShowForm(false);
    setEditingCard(null);
  };

  const confirmDeleteCard = (cardId) => {
    setCardIdToDelete(cardId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await axios.delete(`/api/flashcards/${cardIdToDelete}`);
    fetchFlashcards();
    setShowDeleteModal(false);
    setCardIdToDelete(null);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  return (
    <>
      <TitleBar
        onBack={() => navigate('/')}
        onAddFlashcard={() => {
          setEditingCard(null);
          setShowForm(true);
        }}
      />

      <Container className="mt-4">
        <h1>{currentWorkspace?.title}</h1>

        {currentWorkspace?.book?.url && (
          <div className="mb-4">
            <h5>Reference</h5>
            <div
              style={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '12px',
                overflow: 'hidden',
                width: '100%',
                height: '500px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              onClick={() => window.open(currentWorkspace.book.url, '_blank')}
            >
              <iframe
                src={currentWorkspace.book.url}
                title="Reference Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
            <div className="mt-2 text-end">
              <button
                className="btn btn-outline-primary"
                onClick={() => window.open(currentWorkspace.book.url, '_blank')}
              >
                Open in New Tab
              </button>
            </div>
          </div>
        )}

        <Row>
          {flashcards.length > 0 ? (
            flashcards.map((card) => (
              <Col key={card._id} md={4}>
                <Flashcard
                  question={card.question}
                  answer={card.answer}
                  onEdit={() => handleEditCard({ ...card, id: card._id })}
                  onDelete={() => confirmDeleteCard(card._id)}
                />
              </Col>
            ))
          ) : (
            <p>No flashcards yet. Click "Add Flashcard" to create one!</p>
          )}
        </Row>

        {showForm && (
          <FlashcardForm
            show={showForm}
            onHide={() => setShowForm(false)}
            onSave={handleSaveFlashcard}
            onDelete={confirmDeleteCard}
            initialQuestion={editingCard?.question || ''}
            initialAnswer={editingCard?.answer || ''}
            cardId={editingCard?.id || null}
          />
        )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this flashcard?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Vault;
