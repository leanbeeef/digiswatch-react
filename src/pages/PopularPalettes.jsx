import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchPublicPalettes } from "../utils/fetchPalettes";
import 'bootstrap-icons/font/bootstrap-icons.css';
import SharePalette from '../components/SharePalette';
import { useAuth } from '../AuthContext';
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import paletteData from '../utils/paletteData';
import '../PopularPalettes.css'; // Import custom styles
import SEO from '../components/SEO';

const PopularPalettes = () => {
  const [palettes, setPalettes] = useState(paletteData);
  const [userPalettes, setUserPalettes] = useState([]);
  // Start on community tab so public palettes are shown first
  const [activeTab, setActiveTab] = useState('predefined');
  const [likes, setLikes] = useState({});
  const [savedPalettes, setSavedPalettes] = useState({});
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [animateLike, setAnimateLike] = useState({});
  const [likedPalettes, setLikedPalettes] = useState(() => {
    try {
      const stored = localStorage.getItem('ds-liked-palettes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicPalettes = await fetchPublicPalettes();
        // If fetching fails or returns empty (e.g., unauthenticated rules), fall back to bundled data
        if (publicPalettes && publicPalettes.length > 0) {
          setUserPalettes(publicPalettes);
        } else {
          setUserPalettes(paletteData);
        }
      } catch (error) {
        console.error(error.message);
        // Gracefully show bundled palettes when public fetch isn't available (e.g., not logged in)
        setUserPalettes(paletteData);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchLikes();
    if (currentUser) {
      fetchSavedPalettes();
    }
  }, [currentUser]);

  useEffect(() => {
    sortPalettesByLikes();
  }, [likes]);

  // Persist liked palettes locally to prevent multiple likes from the same user/device
  useEffect(() => {
    try {
      localStorage.setItem('ds-liked-palettes', JSON.stringify(likedPalettes));
    } catch {
      // ignore
    }
  }, [likedPalettes]);

  const fetchLikes = async () => {
    try {
      const likesCollection = collection(db, "likes");
      const querySnapshot = await getDocs(likesCollection);
      const likesData = {};
      querySnapshot.forEach((doc) => {
        likesData[doc.id] = doc.data().count;
      });
      setLikes(likesData);
    } catch (error) {
      console.error("Error fetching likes: ", error);
    }
  };

  const fetchSavedPalettes = async () => {
    try {
      console.log("Saving palette", palette.name, currentUser.uid);
      const palettesCollectionRef = collection(db, "users", currentUser.uid, "palettes");
      const querySnapshot = await getDocs(palettesCollectionRef);
      const saved = {};
      querySnapshot.forEach((doc) => {
        saved[doc.id] = true;
      });
      setSavedPalettes(saved);
    } catch (error) {
      console.error("Error fetching saved palettes: ", error);
    }
  };

  const handleLike = async (paletteName) => {
    if (likedPalettes[paletteName]) {
      setToast({ show: true, message: 'You already liked this palette.' });
      return;
    }

    try {
      const paletteRef = doc(db, "likes", paletteName);
      const paletteDoc = await getDoc(paletteRef);

      if (paletteDoc.exists()) {
        await updateDoc(paletteRef, {
          count: increment(1),
        });
      } else {
        await setDoc(paletteRef, { count: 1 });
      }

      setAnimateLike((prev) => ({ ...prev, [paletteName]: true }));
      setTimeout(() => {
        setAnimateLike((prev) => ({ ...prev, [paletteName]: false }));
      }, 500);

      setLikes((prevLikes) => ({
        ...prevLikes,
        [paletteName]: (prevLikes[paletteName] || 0) + 1,
      }));

      setLikedPalettes((prev) => ({ ...prev, [paletteName]: true }));
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleSave = async (palette) => {
    if (!currentUser) {
      setToast({ show: true, message: 'Please log in to save palettes.' });
      return;
    }

    try {
      const palettesCollectionRef = collection(db, "users", currentUser.uid, "palettes");
      const paletteDocRef = doc(palettesCollectionRef, palette.name);

      if (savedPalettes[palette.name]) {
        await deleteDoc(paletteDocRef);
        setSavedPalettes((prev) => {
          const updated = { ...prev };
          delete updated[palette.name];
          return updated;
        });
      } else {
        await setDoc(paletteDocRef, {
          name: palette.name,
          colors: palette.colors,
          createdAt: new Date().toISOString(),
        });
        setSavedPalettes((prev) => ({ ...prev, [palette.name]: true }));
      }
    } catch (error) {
      console.error("Error saving/un-saving palette: ", error);
      alert("Failed to save palette. Please try again.");
    }
  };

  const sortPalettesByLikes = () => {
    const sortedPalettes = [...palettes].sort((a, b) => {
      const likesA = likes[a.name] || 0;
      const likesB = likes[b.name] || 0;
      return likesB - likesA;
    });
    setPalettes(sortedPalettes);
  };

  const handleShareClick = (palette) => {
    setSelectedPalette(palette);
    setShowShareModal(true);
  };

  const handleOpenInGenerator = (palette) => {
    navigate('/palette-generator', { state: { palette } });
  };

  const renderPalettes = (palettesToRender) => (
    <div className="pp-grid">
      {palettesToRender.map((palette) => (
        <div key={palette.name} className="pp-card">
          <div className="pp-card-body">
            <div className="pp-card-head">
              <div className="pp-palette-name">{palette.name}</div>
              <div className="pp-card-head-actions">
                <button
                  className={`pp-like-inline ${likes[palette.name] ? 'is-active' : ''} ${animateLike[palette.name] ? 'animate-like' : ''}`}
                  onClick={() => handleLike(palette.name)}
                  title="Like palette"
                  disabled={!!likedPalettes[palette.name]}
                >
                  <i className={`bi ${likes[palette.name] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  <span className="pp-like-count-inline">{likes[palette.name] || 0}</span>
                </button>
                <button
                  className="pp-open-generator"
                  onClick={() => handleOpenInGenerator(palette)}
                  title="Open in Palette Generator"
                >
                  <img src="/favicon.ico" alt="Open in generator" height="18" width="18" />
                </button>
              </div>
            </div>

            <div className="pp-color-strip">
              {palette.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="pp-color-swatch"
                  style={{ backgroundColor: color }}
                  data-color={color}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                    // Optional: Add toast notification here
                  }}
                  title="Click to copy hex"
                ></div>
              ))}
            </div>

            <div className="pp-actions">
              <button
                className={`pp-action-ghost ${savedPalettes[palette.name] ? 'is-active' : ''}`}
                onClick={() => handleSave(palette)}
              >
                <i className={`bi ${savedPalettes[palette.name] ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                <span>{savedPalettes[palette.name] ? 'Saved' : 'Save'}</span>
              </button>

              <button
                className="pp-action-ghost"
                onClick={() => handleShareClick(palette)}
              >
                <i className="bi bi-share-fill"></i>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="full-page">
      <SEO
        title="Trending Color Palettes & Schemes"
        description="Browse thousands of popular color palettes created by the DigiSwatch community. Find inspiration for your next web design or branding project."
        keywords="popular color palettes, trending colors, color schemes, web design inspiration, color combinations"
        url="/popular-palettes"
      />
      <div className="pp-hero">
        <div className="pp-hero-title">Discover Color Magic</div>
        <div className="pp-hero-subtitle">
          Explore trending palettes curated by our community and top designers.
          Find the perfect combination for your next masterpiece.
        </div>
      </div>

      <Container>
        <div className="d-flex justify-content-center">
          <div className="pp-nav-pills">
            <div
              className={`pp-nav-link ${activeTab === 'predefined' ? 'active' : ''}`}
              onClick={() => setActiveTab('predefined')}
            >
              <i className="bi bi-fire"></i> Popular
            </div>
            <div
              className={`pp-nav-link ${activeTab === 'userCreated' ? 'active' : ''}`}
              onClick={() => setActiveTab('userCreated')}
            >
              <i className="bi bi-people-fill"></i> Community
            </div>
          </div>
        </div>

        {activeTab === 'userCreated' && renderPalettes(userPalettes)}
        {activeTab === 'predefined' && renderPalettes(palettes)}
      </Container>

      {selectedPalette && (
        <SharePalette
          show={showShareModal}
          onClose={() => setShowShareModal(false)}
          palette={selectedPalette}
        />
      )}

      <Toast
        onClose={() => setToast({ show: false, message: '' })}
        show={toast.show}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 1200,
          minWidth: '240px'
        }}
      >
        <Toast.Header>
          <strong className="me-auto">DigiSwatch</strong>
        </Toast.Header>
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default PopularPalettes;
