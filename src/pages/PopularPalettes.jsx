import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaShareAlt, FaBookmark, FaRegBookmark, FaFire } from 'react-icons/fa';
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
  const [palettes, setPalettes] = useState(paletteData); // Load palettes from external data
  const [likes, setLikes] = useState({});
  const [savedPalettes, setSavedPalettes] = useState({});
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [animateLike, setAnimateLike] = useState({});
  const { currentUser } = useAuth(); // Access currentUser from AuthContext

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

  // Fetch likes from Firestore
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

  // Fetch saved palettes for the logged-in user
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

  return (
    <Container className="mt-4">
      <Row>
        {palettes.map((palette) => (
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
                  {/* Like Icon */}
                  <div
                    className={`like-icon ${animateLike[palette.name] ? "animate" : ""}`}
                    onClick={() => handleLike(palette.name)}
                    style={{
                      cursor: "pointer",
                      color: "tomato",
                      fontSize: "1.5rem",
                    }}
                  >
                    <FaFire /> <span>{likes[palette.name] || 0}</span>
                  </div>

                  {/* Bookmark Icon */}
                  <div
                    onClick={() => handleSave(palette)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: savedPalettes[palette.name] ? "gold" : "gray",
                    }}
                  >
                    {savedPalettes[palette.name] ? <FaBookmark /> : <FaRegBookmark />}
                  </div>

                  {/* Share Icon */}
                  <div
                    onClick={() => handleShareClick(palette)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.5rem",
                      color: "dodgerblue",
                    }}
                  >
                    <FaShareAlt />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

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
