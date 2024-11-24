import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { fetchPublicPalettes } from "../utils/fetchPalettes"; // Adjust path accordingly
import 'bootstrap-icons/font/bootstrap-icons.css';
import SharePalette from '../components/SharePalette';
import { useAuth } from '../AuthContext'; // Import useAuth hook
import { db } from "../firebase"; // Firestore integration
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import paletteData from '../utils/paletteData'; // Import palette data from utils

const PopularPalettes = () => {
  const [palettes, setPalettes] = useState(paletteData); // Predefined palettes
  const [userPalettes, setUserPalettes] = useState([]); // Public user palettes
  const [activeTab, setActiveTab] = useState('userCreated'); // Tab state
  const [likes, setLikes] = useState({});
  const [savedPalettes, setSavedPalettes] = useState({});
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [animateLike, setAnimateLike] = useState({});
  const { currentUser } = useAuth(); // Access currentUser from AuthContext

  // Fetch user-created public palettes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicPalettes = await fetchPublicPalettes();
        setUserPalettes(publicPalettes);
      } catch (error) {
        console.error(error.message);
        alert("We encountered an error fetching public palettes.");
      }
    };
  
    fetchData();
  }, []);

  // Fetch likes and saved palettes on component mount
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
    // Fetch likes from Firestore
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
    // Fetch saved palettes for the logged-in user
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

  const fetchUserPalettes = async () => {
    // Fetch public palettes created by users
    try {
      const userPalettesCollection = collection(db, "publicPalettes");
      const querySnapshot = await getDocs(userPalettesCollection);
      const fetchedPalettes = querySnapshot.docs.map((doc) => doc.data());
      setUserPalettes(fetchedPalettes);
    } catch (error) {
      console.error("Error fetching user palettes: ", error);
    }
  };

  // Handle like button click
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

      // Animate the like icon
      setAnimateLike((prev) => ({ ...prev, [paletteName]: true }));
      setTimeout(() => {
        setAnimateLike((prev) => ({ ...prev, [paletteName]: false }));
      }, 500);

      // Update likes locally
      setLikes((prevLikes) => ({
        ...prevLikes,
        [paletteName]: (prevLikes[paletteName] || 0) + 1,
      }));
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  // Handle save button click
  const handleSave = async (palette) => {
    if (!currentUser) {
      alert("You must be logged in to save palettes.");
      return;
    }

    try {
      const palettesCollectionRef = collection(db, "users", currentUser.uid, "palettes");
      const paletteDocRef = doc(palettesCollectionRef, palette.name);

      if (savedPalettes[palette.name]) {
        // If already saved, remove from Firestore and local state
        await deleteDoc(paletteDocRef);
        setSavedPalettes((prev) => {
          const updated = { ...prev };
          delete updated[palette.name];
          return updated;
        });
      } else {
        // Save palette to Firestore
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

  // Sort palettes by likes
  const sortPalettesByLikes = () => {
    const sortedPalettes = [...palettes].sort((a, b) => {
      const likesA = likes[a.name] || 0;
      const likesB = likes[b.name] || 0;
      return likesB - likesA; // Descending order
    });
    setPalettes(sortedPalettes);
  };

  // Handle share button click
  const handleShareClick = (palette) => {
    setSelectedPalette(palette);
    setShowShareModal(true);
  };

  const renderPalettes = (palettesToRender) => (
    <Row>
      {palettesToRender.map((palette) => (
        <Col xs={12} md={6} lg={4} key={palette.name} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column align-items-center">
              <h5 className="mb-3 text-center">{palette.name}</h5>
              <div className="palette-display d-flex w-100">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: color,
                      flex: 1,
                      height: "60px",
                      borderRadius:
                        idx === 0
                          ? "8px 0 0 8px"
                          : idx === palette.colors.length - 1
                            ? "0 8px 8px 0"
                            : "0",
                      marginRight: idx !== palette.colors.length - 1 ? "2px" : "0",
                    }}
                    title={color}
                  ></div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                <div
                  className={`like-icon ${animateLike[palette.name] ? "animate" : ""}`}
                  onClick={() => handleLike(palette.name)}
                  style={{
                    cursor: "pointer",
                    color: "tomato",
                    fontSize: "1.5rem",
                  }}
                >
                  <i className="bi bi-fire"></i> <span>{likes[palette.name] || 0}</span>
                </div>

                <div
                  onClick={() => handleSave(palette)}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: savedPalettes[palette.name] ? "gold" : "gray",
                  }}
                >
                  {savedPalettes[palette.name] ? <i className="bi bi-bookmark-check-fill"></i> : <i className ="bi bi-bookmark"></i>}
                </div>

                <div
                  onClick={() => handleShareClick(palette)}
                  style={{
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: "dodgerblue",
                  }}
                >
                  <i className="bi bi-share-fill"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Container className="mt-4">
      {/* Tabs */}
      <Nav variant="tabs" className="mb-4">
      <Nav.Item>
          <Nav.Link
            active={activeTab === 'userCreated'}
            onClick={() => setActiveTab('userCreated')}
          >
            <div className='bi bi-people'> Community Made Palettes</div>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'predefined'}
            onClick={() => setActiveTab('predefined')}
          >
           <div className='bi bi-fire'> Popular Palettes</div> 
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Render palettes based on active tab */}
      {activeTab === 'userCreated' && renderPalettes(userPalettes)}
      {activeTab === 'predefined' && renderPalettes(palettes)}
      

      {/* Share Modal */}
      {selectedPalette && (
        <SharePalette
          show={showShareModal}
          onClose={() => setShowShareModal(false)}
          palette={selectedPalette}
        />
      )}
    </Container>
  );
};

export default PopularPalettes;