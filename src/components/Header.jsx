import React, { useContext } from 'react';
import { Navbar, Container, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Access authentication context
import logoLight from '../assets/ds_hz_black.svg';
import avatars from '../utils/avatarImages'; // Assuming avatars are used

const Header = ({ onOpenSidebar }) => {
  const { currentUser } = useContext(AuthContext); // Access currentUser
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="py-3">
      <Container fluid className="d-flex align-items-center justify-content-between">
        {/* Left Section: Logo */}
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img src={logoLight} alt="DigiSwatch Logo" height="40" className="me-2" />
        </Navbar.Brand>

        {/* Right Section: User Info and Sidebar Toggle */}
        <div className="d-flex align-items-center">
          {/* User Info */}
          {!currentUser ? (
            <Button
              variant="primary"
              onClick={handleLoginClick}
              className="me-3"
            >
              Sign In
            </Button>
          ) : (
            <div className="d-flex align-items-center me-3">
              <Image
                src={currentUser.avatar || avatars[0]?.src || '/path/to/default-avatar.png'}
                alt="User Avatar"
                roundedCircle
                height="40"
                className="me-2"
                onClick={handleProfileClick}
                style={{ cursor: 'pointer' }}
              />
              <span
                className="fw-bold d-none text-primary"
                style={{ cursor: 'pointer' }}
                onClick={handleProfileClick}
              >
                {currentUser.username || 'Profile'}
              </span>
            </div>
          )}
          {/* Sidebar Toggle Button */}
          <Button
            variant="outline-primary"
            onClick={onOpenSidebar}
            aria-label="Open Sidebar"
            className="d-flex align-items-center"
          >
            <i className="fas fa-bars"></i>
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
