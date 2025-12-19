import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../AuthContext';
import logo from '../assets/ds_hz_black.svg';

const AppTopBar = ({ showMenuButton = false, isMenuOpen = false, onMenuToggle }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const avatarUrl = currentUser?.photoURL || currentUser?.avatar;
  const initial =
    currentUser?.displayName?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    'U';

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        {showMenuButton && (
          <button
            className={`app-topbar__menu-btn ${isMenuOpen ? 'is-active' : ''}`}
            onClick={onMenuToggle}
            aria-label="Toggle navigation"
          >
            <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        )}
        <div
          className="app-topbar__logo"
          onClick={() => navigate('/home')}
          role="button"
          aria-label="Go home"
        >
          <img src={logo} alt="Logo" className="app-topbar__mark-img" />
        </div>
      </div>
      <div className="app-topbar__actions">
        <button
          className="ghost-btn"
          onClick={() => navigate(currentUser ? '/profile' : '/login')}
          aria-label={currentUser ? 'Profile' : 'Login'}
          title={currentUser ? 'Profile' : 'Login'}
        >
          {currentUser ? (
            avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User avatar"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                }}
              />
            ) : (
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#e5e7eb',
                  color: '#111827',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                }}
              >
                {initial}
              </span>
            )
          ) : (
            <i className="bi bi-person-circle"></i>
          )}
        </button>
      </div>
    </header>
  );
};

export default AppTopBar;
