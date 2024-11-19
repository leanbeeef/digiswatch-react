import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import the authentication context
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ show, onClose }) => {
  const { currentUser, logout } = useContext(AuthContext);
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

  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Close the sidebar
  };

  return (
    <div
      className={`sidebar d-flex flex-column flex-shrink-0 p-3 ${show ? 'sidebar-show' : 'sidebar-hidden'
        }`}
      style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        zIndex: '2000',
        top: '0',
        right: '0',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className='d-flex flex-row justify-content-between align-items-center'>
        {/* Close Button */}
        <a
          href="/"
          className="d-flex align-items-center  mb-md-0 me-md-auto link-dark text-decoration-none"
        >
          <img src='favicon.ico' className='me-2'></img>
        </a>

        <button
          className="btn-close btn-close-outline align-self-end"
          aria-label="Close"
          onClick={onClose}
        ></button>

      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a
            href="#"
            className="nav-link"
            aria-current="page"
            onClick={() => handleNavigate('/home')}
          >
            <i className="bi bi-house me-2"></i>
            Home
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onClick={() => handleNavigate('/palette-generator')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Palette Generator
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onClick={() => handleNavigate('/popular-palettes')}
          >
            <i className="bi bi-fire me-2"></i>
            Popular Palettes
          </a>
        </li>
      </ul>
      <hr />
      <div className="dropdown">
        {currentUser ? (
          <>
            <a
              href="#"
              className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle"
              id="dropdownUser2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={currentUser.avatar || 'https://via.placeholder.com/32'}
                alt="User Avatar"
                width="32"
                height="32"
                className="rounded-circle me-2"
              />
              <strong>{currentUser.username || 'User'}</strong>
            </a>
            <div
              className="dropdown-menu text-small shadow"
              aria-labelledby="dropdownUser2"
              style={{ zIndex: 2050 }}
            >
              <div>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleNavigate('/profile')}
                >
                  <i class="bi bi-person-circle me-2"></i>
                  Profile
                </a>
              </div>
              <div>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={() => handleNavigate('/settings')}
                >
                  <i class="bi bi-gear-wide me-2"></i>
                  Settings
                </a>
              </div>
              <div>
                <hr className="dropdown-divider" />
              </div>
              <div className='d-inline-flex'>
                <a className="dropdown-item" href="#" onClick={handleLogout}>
                <i class="bi bi-box-arrow-left me-2"></i>
                  Sign out
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            <a
              href="#"
              className="d-flex align-items-center link-dark text-decoration-none"
              onClick={() => handleNavigate('/login')}
            >
              Login
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
