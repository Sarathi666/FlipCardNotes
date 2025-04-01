import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import WorkspaceCard from '../components/WorkspaceCard';
import TitleBar from '../components/TitleBar';
import WorkspaceForm from '../components/WorkspaceForm';

const Home = ({ workspaces, setWorkspaces }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);  // ✅ Store the workspace being edited

  // ✅ Add or edit workspace
  const handleSaveWorkspace = (workspace) => {
    if (editingWorkspace) {
      // ✅ Edit existing workspace
      const updatedWorkspaces = workspaces.map((ws) =>
        ws.id === workspace.id ? { ...ws, ...workspace } : ws
      );
      setWorkspaces(updatedWorkspaces);
    } else {
      // ✅ Add new workspace
      setWorkspaces([...workspaces, workspace]);
    }
    setShowForm(false);
    setEditingWorkspace(null);
  };

  // ✅ Handle right-click to enable edit mode
  const handleRightClick = (e, workspace) => {
    e.preventDefault();  // Prevent the default context menu
    setEditingWorkspace(workspace);  // Set the workspace being edited
    setShowForm(true);
  };

  const deleteWorkspace = (id) => {
    setWorkspaces(workspaces.filter((ws) => ws.id !== id));
  };

  return (
    <>
      <TitleBar onAddWorkspace={() => {
        setEditingWorkspace(null);  // Reset when adding a new one
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
            workspaceId={editingWorkspace?.id || null}
          />
        )}

        <Row>
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <Col key={workspace.id} md={4}>
                <div
                  onContextMenu={(e) => handleRightClick(e, workspace)}  // ✅ Right-click trigger
                >
                  <WorkspaceCard
                    workspace={workspace}
                    onDelete={() => deleteWorkspace(workspace.id)}
                  />
                </div>
              </Col>
            ))
          ) : (
            <p>No workspaces yet. Create one!</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Home;
