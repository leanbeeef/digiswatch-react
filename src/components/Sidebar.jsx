// src/components/Sidebar.jsx

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
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Navigate to login, signup, or profile pages
  const handleLogin = () => navigate('/login');
  const handleSignUp = () => navigate('/signup');
  const handleProfile = () => navigate('/profile');

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Gadgets</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column justify-content-between">
        <div>
          {/* Navigation Links */}
          <Nav className="flex-column mb-4">
            <Nav.Link href="/palette-generator">Palette Generator</Nav.Link>
            <Nav.Link href="/popular-palettes">Popular Palettes</Nav.Link>
          </Nav>
        </div>

        {/* Auth Buttons */}
        <div className="mt-auto">
          {!currentUser ? (
            <>
              <Button variant="outline-primary" className="w-100 mb-2" onClick={handleLogin}>
                Login
              </Button>
              <Button variant="primary" className="w-100" onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <Button variant="info" className="w-100 mb-2" onClick={handleProfile}>
                Profile
              </Button>
              <Button variant="danger" className="w-100" onClick={handleLogout}>
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
