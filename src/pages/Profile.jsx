import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { FaEdit, FaSave, FaShareAlt, FaTrash, FaCamera } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { db, storage } from "../firebase"; // Firestore and Storage
import {
  doc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SharePalette from '../components/SharePalette';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [createdPalettes, setCreatedPalettes] = useState([]);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchSavedPalettes();
      fetchCreatedPalettes();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const profileDoc = doc(db, "users", currentUser.uid);
      const profileData = (await getDoc(profileDoc)).data();
      setUsername(profileData?.username || '');
      setEmail(currentUser.email);
      setProfilePicture(profileData?.profilePicture || null);
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  const fetchSavedPalettes = async () => {
    try {
      const palettesCollection = collection(db, "users", currentUser.uid, "palettes");
      const querySnapshot = await getDocs(palettesCollection);
      const palettes = [];
      querySnapshot.forEach((doc) => {
        palettes.push({ id: doc.id, ...doc.data() });
      });
      setSavedPalettes(palettes);
    } catch (error) {
      console.error("Error fetching saved palettes: ", error);
    }
  };

  const fetchCreatedPalettes = async () => {
    try {
      const createdCollection = collection(db, "users", currentUser.uid, "createdPalettes");
      const querySnapshot = await getDocs(createdCollection);
      const palettes = [];
      querySnapshot.forEach((doc) => {
        palettes.push({ id: doc.id, ...doc.data() });
      });
      setCreatedPalettes(palettes);
    } catch (error) {
      console.error("Error fetching created palettes: ", error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicture(downloadURL);

      // Update Firestore with the profile picture URL
      const profileDoc = doc(db, "users", currentUser.uid);
      await updateDoc(profileDoc, { profilePicture: downloadURL });
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) {
        alert("No user is logged in.");
        return;
    }
    
    try {
        const profileDoc = doc(db, "users", currentUser.uid);
        await updateDoc(profileDoc, { username }); // Add other fields if necessary
        alert("Profile updated successfully!");
    } catch (error) {
        if (error.code === "permission-denied") {
            alert("You don't have permission to update this profile.");
        } else {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    }
};


  const handleShareClick = (palette) => {
    setSelectedPalette(palette);
    setShowShareModal(true);
  };

  const handleDeletePalette = async (paletteId, type) => {
    try {
      const collectionName = type === "saved" ? "palettes" : "createdPalettes";
      const paletteRef = doc(db, "users", currentUser.uid, collectionName, paletteId);
      await deleteDoc(paletteRef);
      if (type === "saved") {
        setSavedPalettes((prev) => prev.filter((p) => p.id !== paletteId));
      } else {
        setCreatedPalettes((prev) => prev.filter((p) => p.id !== paletteId));
      }
    } catch (error) {
      console.error("Error deleting palette: ", error);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col md={4} className="text-center">
          <div className="profile-picture-container">
            {previewImage || profilePicture ? (
              <img
                src={previewImage || profilePicture}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle bg-light d-flex justify-content-center align-items-center"
                style={{ width: '150px', height: '150px' }}
              >
                <FaCamera size={40} />
              </div>
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="mt-2"
            />
          </div>
        </Col>
        <Col md={8}>
          <h2>Profile</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} disabled />
            </Form.Group>
            <Button onClick={handleUpdateProfile} variant="primary">
              Update Profile
            </Button>
          </Form>
        </Col>
      </Row>

      <h3>Saved Palettes</h3>
      <Row>
        {savedPalettes.map((palette) => (
          <Col xs={12} md={6} lg={4} key={palette.id} className="mb-4">
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
                        marginRight: idx !== palette.colors.length - 1 ? "2px" : "0",
                      }}
                      title={color}
                    ></div>
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                  <Button
                    variant="link"
                    onClick={() => handleShareClick(palette)}
                  >
                    <FaShareAlt />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePalette(palette.id, "saved")}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h3>Created Palettes</h3>
      <Row>
        {createdPalettes.map((palette) => (
          <Col xs={12} md={6} lg={4} key={palette.id} className="mb-4">
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
                        marginRight: idx !== palette.colors.length - 1 ? "2px" : "0",
                      }}
                      title={color}
                    ></div>
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 mt-3">
                  <Button
                    variant="link"
                    onClick={() => handleShareClick(palette)}
                  >
                    <FaShareAlt />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePalette(palette.id, "created")}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

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

export default Profile;
