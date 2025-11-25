import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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

const PopularPalettes = () => {
  const [palettes, setPalettes] = useState(paletteData);
  const [userPalettes, setUserPalettes] = useState([]);
  const [activeTab, setActiveTab] = useState('predefined');
  const [likes, setLikes] = useState({});
  const [savedPalettes, setSavedPalettes] = useState({});
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [animateLike, setAnimateLike] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicPalettes = await fetchPublicPalettes();
        setUserPalettes(publicPalettes);
      } catch (error) {
        console.error(error.message);
        // alert("We encountered an error fetching public palettes."); // Suppress alert for smoother UX
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
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleSave = async (palette) => {
    if (!currentUser) {
      alert("You must be logged in to save palettes.");
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

  const renderPalettes = (palettesToRender) => (
    <div className="pp-grid">
      {palettesToRender.map((palette) => (
        <div key={palette.name} className="pp-card">
          <div className="pp-card-body">
            <div className="pp-palette-name">{palette.name}</div>

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
                className={`pp-action-btn ${animateLike[palette.name] ? 'animate-like' : ''} ${likes[palette.name] ? 'liked' : ''}`}
                onClick={() => handleLike(palette.name)}
              >
                <i className={`bi ${likes[palette.name] ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span className="pp-like-count">{likes[palette.name] || 0}</span>
              </button>

              <button
                className={`pp-action-btn ${savedPalettes[palette.name] ? 'saved' : ''}`}
                onClick={() => handleSave(palette)}
              >
                <i className={`bi ${savedPalettes[palette.name] ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
              </button>

              <button
                className="pp-action-btn share"
                onClick={() => handleShareClick(palette)}
              >
                <i className="bi bi-share-fill"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="full-page">
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
    </div>
  );
};

export default PopularPalettes;