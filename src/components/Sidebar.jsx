import React, { useContext } from 'react';
import { Offcanvas, Button, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import the authentication context

const Sidebar = ({ show, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext); // Access user state and logout function
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home after logout
      onClose(); // Close the sidebar
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Combined navigation and sidebar close for links
  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Close the sidebar
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Gadgets</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column justify-content-between sidebar-body">
        <div>
          {/* Navigation Links */}
          <Nav className="flex-column mb-4 sidebar-nav">
            <Nav.Link onClick={() => handleNavigate('/palette-generator')} className="sidebar-link">
              Palette Generator
            </Nav.Link>
            <Nav.Link onClick={() => handleNavigate('/popular-palettes')} className="sidebar-link">
              Popular Palettes
            </Nav.Link>
          </Nav>
        </div>

        {/* Auth Buttons */}
        <div className="mt-auto">
          {!currentUser ? (
            <>
              <Button
                variant="outline-primary"
                className="w-100 mb-2 sidebar-button"
                onClick={() => handleNavigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                className="w-100 sidebar-button"
                onClick={() => handleNavigate('/signup')}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="info"
                className="w-100 mb-2 sidebar-button"
                onClick={() => handleNavigate('/profile')}
              >
                Profile
              </Button>
              <Button
                variant="danger"
                className="w-100 sidebar-button"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default Sidebar;
