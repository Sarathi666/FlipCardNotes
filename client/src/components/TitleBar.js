import React from 'react';
import { Navbar, Container, Button, Image } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';  // ✅ Import your logo image

const TitleBar = ({ title, onAddWorkspace, onBack, onAddFlashcard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVaultPage = location.pathname.startsWith('/vault');

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Image src={logo} alt="Logo" width="40" height="40" className="d-inline-block align-top me-2" />
          {'Flashcard Revisions'}
        </Navbar.Brand>

        <div>
          {isVaultPage ? (
            <>
              <Button variant="outline-light" className="me-2" onClick={onBack}>
                🔙 Back to Home
              </Button>
              <Button variant="success" onClick={onAddFlashcard}>
                ➕ Add Flashcard
              </Button>
            </>
          ) : (
            <>
              <Button variant="success" className="me-2" onClick={onAddWorkspace}>
                ➕ Add Workspace
              </Button>
              <Button variant="outline-light">👤 Profile</Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default TitleBar;
