import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import WorkspaceCard from '../components/WorkspaceCard';
import TitleBar from '../components/TitleBar';
import WorkspaceForm from '../components/WorkspaceForm';

const Home = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication and load workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setWorkspaces([]);
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      try {
        const res = await axios.get('/api/workspaces', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setWorkspaces(res.data);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        if (error.response?.status === 401) {
          setWorkspaces([]);
          setIsLoggedIn(false);
          navigate('/');
        } else {
          setError('Failed to fetch workspaces. Please refresh the page.');
        }
      }
    };

    loadWorkspaces();
  }, [navigate]);

  // Add effect to check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setWorkspaces([]);
        navigate('/');
      }
    };

    // Check auth status every 5 seconds
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWorkspaces([]);
        return;
      }

      const res = await axios.get('/api/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWorkspaces(res.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      if (error.response?.status === 401) {
        setWorkspaces([]);
        navigate('/');
      } else {
        setError('Failed to fetch workspaces. Please refresh the page.');
      }
    }
  };

  const handleSaveWorkspace = async (workspace) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      let response;
      
      if (editingWorkspace) {
        response = await axios.put(`/api/workspaces/${editingWorkspace._id}`, workspace, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post('/api/workspaces', workspace, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      await fetchWorkspaces();
      setShowForm(false);
      setEditingWorkspace(null);
    } catch (error) {
      console.error('Error saving workspace:', error);
      if (error.response?.status === 401) {
        setWorkspaces([]);
        navigate('/');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save workspace. Please try again.';
        throw new Error(errorMessage);
      }
    }
  };

  const handleRightClick = (e, workspace) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    setEditingWorkspace(workspace);
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    setWorkspaceToDelete(id);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      await axios.delete(`/api/workspaces/${workspaceToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchWorkspaces();
      setWorkspaceToDelete(null);
    } catch (error) {
      console.error('Error deleting workspace:', error);
      if (error.response?.status === 401) {
        setWorkspaces([]);
        navigate('/');
      } else {
        setError('Failed to delete workspace. Please try again.');
      }
    }
  };

  return (
    <>
      <TitleBar onAddWorkspace={() => { setEditingWorkspace(null); setShowForm(true); }} />
      <Container className="mt-4">
        {isLoggedIn ? (
          <>
            <h1>Your Workspaces</h1>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {showForm && (
              <WorkspaceForm
                onSave={handleSaveWorkspace}
                onClose={() => {
                  setShowForm(false);
                  setEditingWorkspace(null);
                }}
                initialTitle={editingWorkspace?.title || ''}
                initialDescription={editingWorkspace?.description || ''}
                initialBook={editingWorkspace?.book || null}
                workspaceId={editingWorkspace?._id || null}
              />
            )}

            <Row>
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <Col key={workspace._id} md={4}>
                    <div onContextMenu={(e) => handleRightClick(e, workspace)}>
                      <WorkspaceCard
                        workspace={{ ...workspace, id: workspace._id }}
                        onDelete={() => confirmDelete(workspace._id)}
                      />
                    </div>
                  </Col>
                ))
              ) : (
                <p>No workspaces yet. Create one!</p>
              )}
            </Row>
          </>
        ) : (
          <div className="text-center py-5">
            <div className="welcome-message" style={{
              backgroundColor: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h2 style={{ color: '#343a40', marginBottom: '1rem' }}>
                Welcome to Flashcard Revisions
              </h2>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                Please login or register to get started with your learning journey
              </p>
            </div>
          </div>
        )}
      </Container>

      <Modal show={workspaceToDelete !== null} onHide={() => setWorkspaceToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this workspace?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setWorkspaceToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;
