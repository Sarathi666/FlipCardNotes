import React, { useState, useEffect } from 'react';  // ✅ Import hooks
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import TitleBar from '../components/TitleBar';
import Flashcard from '../components/Flashcard';
import FlashcardForm from '../components/FlashcardForm';

const Vault = ({ workspaces, setWorkspaces }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // ✅ Load the current workspace on mount
  useEffect(() => {
    const ws = workspaces.find((w) => w.id === parseInt(id));
    if (ws) {
      setCurrentWorkspace(ws);
    }
  }, [id, workspaces]);

  // ✅ Handle saving or adding a flashcard
  const handleSaveFlashcard = (question, answer, cardId = null) => {
    if (!currentWorkspace) return;

    let updatedCards;

    if (cardId) {
      // ✅ Edit existing flashcard
      updatedCards = currentWorkspace.cards.map((card) =>
        card.id === cardId
          ? { ...card, question, answer }
          : card
      );
    } else {
      // ✅ Add new flashcard
      const newCard = {
        id: Date.now(),
        question,
        answer,
       
      };
      updatedCards = [...(currentWorkspace.cards || []), newCard];  // ✅ Fallback to empty array
    }

    const updatedWorkspace = {
      ...currentWorkspace,
      cards: updatedCards,
    };

    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === currentWorkspace.id ? updatedWorkspace : ws
    );

    setWorkspaces(updatedWorkspaces);
    setCurrentWorkspace(updatedWorkspace);

    setShowForm(false);
    setEditingCard(null);
  };


  const handleDeleteCard = (cardId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this flashcard?');
    if (isConfirmed) {
      const updatedCards = currentWorkspace.cards.filter((card) => card.id !== cardId);
  
      const updatedWorkspace = {
        ...currentWorkspace,
        cards: updatedCards,
      };
  
      const updatedWorkspaces = workspaces.map((ws) =>
        ws.id === currentWorkspace.id ? updatedWorkspace : ws
      );
  
      setWorkspaces(updatedWorkspaces);
      setCurrentWorkspace(updatedWorkspace);
      setShowForm(false);
      setEditingCard(null);
    }
  };
  

  // ✅ Open edit form on right-click
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

        <Row>
          {currentWorkspace?.cards?.length > 0 ? (   // ✅ Fallback check for cards
            currentWorkspace.cards.map((card) => (
              <Col key={card.id} md={4}>
                <Flashcard
                  question={card.question}
                  answer={card.answer}
                  onEdit={() => handleEditCard(card)}
                  
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
            onDelete={handleDeleteCard}
            
            initialQuestion={editingCard?.question || ''}
            initialAnswer={editingCard?.answer || ''}
            cardId={editingCard?.id || null}
          />
        )}
      </Container>
    </>
  );
};

export default Vault;
