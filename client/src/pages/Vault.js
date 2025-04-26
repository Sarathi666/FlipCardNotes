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
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);

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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const res = await axios.get('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const workspace = res.data.find(w => w._id === id);
      setCurrentWorkspace(workspace);
      
      if (workspace && workspace.book) {
        try {
          // Get the PDF data from our backend
          const pdfResponse = await axios.get(`/api/workspaces/${id}/pdf`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            responseType: 'blob' // Important: we want a binary response
          });
          
          // Create a blob URL from the PDF data
          const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setPdfError(null);
        } catch (pdfError) {
          console.error('Error fetching PDF:', pdfError);
          setPdfError('Failed to load PDF. Please try refreshing the page.');
        }
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const fetchFlashcards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const res = await axios.get(`/api/flashcards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFlashcards(res.data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleSaveFlashcard = async (question, answer, cardId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      if (cardId) {
        await axios.put(`/api/flashcards/${cardId}`, { question, answer }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`/api/flashcards`, {
          question,
          answer,
          workspaceId: id,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      fetchFlashcards();
      setShowForm(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Error saving flashcard:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const confirmDeleteCard = (cardId) => {
    setCardIdToDelete(cardId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      await axios.delete(`/api/flashcards/${cardIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchFlashcards();
      setShowDeleteModal(false);
      setCardIdToDelete(null);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
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

        {pdfError && (
          <div className="alert alert-danger mb-4" role="alert">
            {pdfError}
          </div>
        )}

        {pdfUrl && (
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
            >
              <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              >
                <iframe
                  src={pdfUrl}
                  title="Reference Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                >
                  <p>Your browser doesn't support PDF preview.</p>
                </iframe>
              </object>
            </div>
            <div className="mt-2 text-end">
              <button
                className="btn btn-outline-primary"
                onClick={() => window.open(pdfUrl, '_blank')}
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
