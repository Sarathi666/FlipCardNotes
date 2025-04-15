import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import axios from 'axios';

import WorkspaceCard from '../components/WorkspaceCard';
import TitleBar from '../components/TitleBar';
import WorkspaceForm from '../components/WorkspaceForm';

const Home = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  useEffect(() => {
    fetchWorkspaces();

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setEditingWorkspace(null);
        setShowForm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchWorkspaces = async () => {
    const res = await axios.get('/api/workspaces');
    setWorkspaces(res.data);
  };

  const handleSaveWorkspace = async (workspace) => {
    if (editingWorkspace) {
      await axios.put(`/api/workspaces/${workspace.id}`, workspace);
    } else {
      await axios.post('/api/workspaces', workspace);
    }
    fetchWorkspaces();
    setShowForm(false);
    setEditingWorkspace(null);
  };

  const handleRightClick = (e, workspace) => {
    e.preventDefault();
    setEditingWorkspace(workspace);
    setShowForm(true);
  };

  const confirmDelete = (id) => setWorkspaceToDelete(id);

  const handleConfirmDelete = async () => {
    await axios.delete(`/api/workspaces/${workspaceToDelete}`);
    fetchWorkspaces();
    setWorkspaceToDelete(null);
  };

  return (
    <>
      <TitleBar onAddWorkspace={() => { setEditingWorkspace(null); setShowForm(true); }} />
      <Container className="mt-4">
        <h1>Your Workspaces</h1>

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
            workspaceId={editingWorkspace?.id || null}
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
