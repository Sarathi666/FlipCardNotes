import React, { useState, useEffect } from 'react';
import { Navbar, Container, Button, Image, Modal, Form } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';  // ✅ Import your logo image

// Set up Axios to automatically include the token if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const TitleBar = ({ title, onAddWorkspace, onBack, onAddFlashcard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isVaultPage = location.pathname.startsWith('/vault');

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogout, setShowLogout] = useState(false);  // Added for logout confirmation

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return storedToken && storedUser ? JSON.parse(storedUser) : null;
  });
// Success modal states
const [showLoginSuccess, setShowLoginSuccess] = useState(false);
const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);

// Error modal states
const [showLoginError, setShowLoginError] = useState(false);
const [showRegisterError, setShowRegisterError] = useState(false);

const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);


useEffect(() => {
  if (showLoginSuccess) {
    const timer = setTimeout(() => setShowLoginSuccess(false), 1000);
    return () => clearTimeout(timer);
  }
}, [showLoginSuccess]);

useEffect(() => {
  if (showRegisterSuccess) {
    const timer = setTimeout(() => setShowRegisterSuccess(false), 1000);
    return () => clearTimeout(timer);
  }
}, [showRegisterSuccess]);

useEffect(() => {
  if (showLoginError) {
    const timer = setTimeout(() => setShowLoginError(false), 1000);
    return () => clearTimeout(timer);
  }
}, [showLoginError]);

useEffect(() => {
  if (showRegisterError) {
    const timer = setTimeout(() => setShowRegisterError(false), 1500);
    return () => clearTimeout(timer);
  }
}, [showRegisterError]);

useEffect(() => {
  if (showLogoutSuccess) {
    const timer = setTimeout(() => setShowLogoutSuccess(false), 1000);
    return () => clearTimeout(timer);
  }
}, [showLogoutSuccess]);

useEffect(() => {
  if (showDeleteSuccess) {
    const timer = setTimeout(() => {
      setShowDeleteSuccess(false);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [showDeleteSuccess]);


const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('/api/auth/login', loginData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user); // 👈 Update local state
    setShowLogin(false);
    setShowLoginSuccess(true); // Show login success modal
  } catch (err) {
    setShowLoginError(true); // Show login error modal
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
  setShowLogout(false);
  setShowLogoutSuccess(true); // Show logout success modal
};

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    await axios.post('/api/auth/register', registerData);
    setShowRegister(false);
    setShowRegisterSuccess(true); // Show registration success modal
  } catch (err) {
    setShowRegisterError(true); // Show registration error modal
  }
};

const handleDeleteAccount = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      alert('You must be logged in to delete your account');
      return;
    }

    // First verify the token is still valid
    try {
      await axios.get('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (verifyError) {
      if (verifyError.response && verifyError.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        alert('Your session has expired. Please log in again.');
        return;
      }
    }

    const response = await axios.delete('/api/auth/delete', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      // Clear localStorage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setShowLogout(false);
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);

      // Navigate to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  } catch (err) {
    console.error('Account deletion failed:', err);
    let errorMessage = 'Failed to delete account. ';
    
    if (err.response) {
      switch (err.response.status) {
        case 401:
          errorMessage += 'You are not authorized. Please log in again.';
          break;
        case 403:
          errorMessage += 'Your session has expired. Please log in again.';
          // Clear user data on token expiration
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          break;
        case 404:
          errorMessage += 'Account not found.';
          break;
        default:
          errorMessage += 'Please try again.';
      }
    } else {
      errorMessage += 'Please check your internet connection and try again.';
    }
    
    alert(errorMessage);
  }
};



  return (
    <>
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
                {user ? (
                  <Button variant="outline-light" className="ms-2" onClick={() => setShowLogout(true)}>
                    👤Profile
                  </Button>
                ) : (
                  <Button variant="outline-light" className="ms-2" onClick={() => setShowLogin(true)}>
                    👤Login
                  </Button>
                )}
              </>
            )}
          </div>
        </Container>
      </Navbar>

 {/* Login Success Modal */}
 <Modal show={showLoginSuccess} onHide={() => setShowLoginSuccess(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have successfully logged in!</p>
        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>

      {/* Register Success Modal */}
      <Modal show={showRegisterSuccess} onHide={() => setShowRegisterSuccess(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registration Successful</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have successfully registered! You can now log in.</p>
        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>

      {/* Login Error Modal */}
      <Modal show={showLoginError} onHide={() => setShowLoginError(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Login failed. Please check your credentials and try again.</p>
        </Modal.Body>
        <Modal.Footer>

        </Modal.Footer>
      </Modal>

      {/* Register Error Modal */}
      <Modal show={showRegisterError} onHide={() => setShowRegisterError(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registration Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Registration failed. Please try a different email address.</p>
        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>

{/* Logout Success Modal */}
<Modal show={showLogoutSuccess} onHide={() => setShowLogoutSuccess(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Logged Out</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>You have been successfully logged out.</p>
  </Modal.Body>
  <Modal.Footer>
    
  </Modal.Footer>
</Modal>

<Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Deletion</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Are you absolutely sure you want to delete your account?</p>
    <p>This action <strong>cannot be undone</strong>.</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
      Cancel
    </Button>
      <Button variant="danger" onClick={() => {
  handleDeleteAccount(); 
}}>
      Yes, Delete
    </Button>
  </Modal.Footer>
</Modal>

{/*Delete success modal*/}
<Modal show={showDeleteSuccess} onHide={() => setShowDeleteSuccess(false)} backdrop="static" keyboard={false}>
  <Modal.Header>
    <Modal.Title>Account Deleted</Modal.Title>
  </Modal.Header>
  <Modal.Body>Your account has been permanently deleted.</Modal.Body>
</Modal>

      {/* Login Modal */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                Register Instead
              </Button>
              <Button variant="primary" type="submit">
                Login
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => { setShowRegister(false); setShowLogin(true); }}>
                Already have an account?
              </Button>
              <Button variant="success" type="submit">
                Register
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogout} onHide={() => setShowLogout(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Profile</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p><strong>Name:</strong> {user ? user.name : ''}</p>
    <p><strong>Email:</strong> {user ? user.email : ''}</p>
  </Modal.Body>
  <Modal.Footer className="d-flex justify-content-between flex-wrap">
    <div className="d-flex gap-2">
    <Button 
  variant="danger" 
  onClick={() => { 
    setShowDeleteConfirm(true); 
  }}
>
  Delete Account
</Button>
      <Button variant="warning" onClick={handleLogout}>
        Logout
      </Button>
    </div>
    <Button variant="secondary" onClick={() => setShowLogout(false)}>
      Cancel
    </Button>
  </Modal.Footer>
</Modal>


    </>
  );
};

export default TitleBar;

