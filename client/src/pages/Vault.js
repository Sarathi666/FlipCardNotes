import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import TitleBar from '../components/TitleBar';
import Flashcard from '../components/Flashcard';
import FlashcardForm from '../components/FlashcardForm';

const Vault = ({ workspaces, setWorkspaces }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState(null);

  useEffect(() => {
    const ws = workspaces.find((w) => w.id === parseInt(id));
    if (ws) setCurrentWorkspace(ws);
    const handleKeyDown = (e) => {
      // Check for Enter and that no input is focused
      if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();  // Optional: prevent default scrolling
        setEditingCard(null);
        setShowForm(true);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [id, workspaces]);

  const handleSaveFlashcard = (question, answer, cardId = null) => {
    if (!currentWorkspace) return;

    let updatedCards;

    if (cardId) {
      updatedCards = currentWorkspace.cards.map((card) =>
        card.id === cardId ? { ...card, question, answer } : card
      );
    } else {
      const newCard = { id: Date.now(), question, answer };
      updatedCards = [...(currentWorkspace.cards || []), newCard];
    }

    const updatedWorkspace = { ...currentWorkspace, cards: updatedCards };

    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === currentWorkspace.id ? updatedWorkspace : ws
    );

    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(updatedWorkspace);
    setShowForm(false);
    setEditingCard(null);
  };

  // 🚨 New function to trigger the modal
  const confirmDeleteCard = (cardId) => {
    setCardIdToDelete(cardId);
    setShowDeleteModal(true);
  };

  // 🧹 Cleanup and delete after confirmation
  const handleConfirmDelete = () => {
    const updatedCards = currentWorkspace.cards.filter((card) => card.id !== cardIdToDelete);
    const updatedWorkspace = { ...currentWorkspace, cards: updatedCards };
    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === currentWorkspace.id ? updatedWorkspace : ws
    );

    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(updatedWorkspace);
    setShowForm(false);
    setEditingCard(null);
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

        {/* ✅ Reference Section for PDF Preview */}
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
          {currentWorkspace?.cards?.length > 0 ? (
            currentWorkspace.cards.map((card) => (
              <Col key={card.id} md={4}>
                <Flashcard
                  question={card.question}
                  answer={card.answer}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => confirmDeleteCard(card.id)} // 🔁 use new modal trigger
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

        {/* 🧼 Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Vault;
