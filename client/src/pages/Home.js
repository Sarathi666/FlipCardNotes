import React, { useState } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import WorkspaceCard from '../components/WorkspaceCard';
import TitleBar from '../components/TitleBar';
import WorkspaceForm from '../components/WorkspaceForm';
import { useEffect } from 'react';



const Home = ({ workspaces, setWorkspaces }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);  // ✅ Modal trigger

  const handleSaveWorkspace = (workspace) => {
    if (editingWorkspace) {
      const updatedWorkspaces = workspaces.map((ws) =>
        ws.id === workspace.id ? { ...ws, ...workspace } : ws
      );
      setWorkspaces(updatedWorkspaces);
    } else {
      setWorkspaces([...workspaces, workspace]);
    }
    setShowForm(false);
    setEditingWorkspace(null);
  };

  const handleRightClick = (e, workspace) => {
    e.preventDefault();
    setEditingWorkspace(workspace);
    setShowForm(true);
  };

  // ✅ Show confirmation modal instead of direct deletion
  const confirmDelete = (id) => {
    setWorkspaceToDelete(id);
  };

  const handleConfirmDelete = () => {
    setWorkspaces(workspaces.filter((ws) => ws.id !== workspaceToDelete));
    setWorkspaceToDelete(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Enter and that no input is focused
      if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();  // Optional: prevent default scrolling
        setEditingWorkspace(null);
        setShowForm(true);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
   <>
      <TitleBar onAddWorkspace={() => {
        setEditingWorkspace(null);
        setShowForm(true);
      }} />

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
              <Col key={workspace.id} md={4}>
                <div
                  onContextMenu={(e) => handleRightClick(e, workspace)}
                >
                  <WorkspaceCard
                    workspace={workspace}
                    onDelete={() => confirmDelete(workspace.id)} // ✅ open modal
                  />
                </div>
              </Col>
            ))
          ) : (
            <p>No workspaces yet. Create one!</p>
          )}
        </Row>
      </Container>

      {/* ✅ Delete Confirmation Modal */}
      <Modal show={workspaceToDelete !== null} onHide={() => setWorkspaceToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Workspace</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this workspace?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setWorkspaceToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;
