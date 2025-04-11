import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const WorkspaceCard = ({ workspace, onDelete }) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title>{workspace.title}</Card.Title>
        <Card.Text>{workspace.description}</Card.Text>
        
        <div className="d-flex justify-content-between">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/vault/${workspace.id}`)}> 
            Enter Workspace
          </Button>
          <Button variant="danger" onClick={() => onDelete(workspace.id)}>❌</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WorkspaceCard;
