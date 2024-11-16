// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SharePalette from '../components/SharePalette';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [createdPalettes, setCreatedPalettes] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchPalettes();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const profileDoc = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(profileDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);
        setNewUsername(data.username || '');
        setNewEmail(currentUser.email || '');
      }
    } catch (error) {
      console.error('Error fetching profile: ', error);
    }
  };

  const fetchPalettes = async () => {
    try {
      // Fetch saved palettes
      const savedPalettesDoc = doc(db, 'users', currentUser.uid);
      const savedSnap = await getDoc(savedPalettesDoc);

      if (savedSnap.exists()) {
        setSavedPalettes(savedSnap.data().palettes || []);
      }

      // Fetch created palettes (example: replace with actual implementation)
      setCreatedPalettes([
        { name: 'My Custom Palette', colors: ['#123456', '#654321', '#abcdef', '#ff0000'] },
      ]);
    } catch (error) {
      console.error('Error fetching palettes: ', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const profileDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(profileDoc, {
        username: newUsername,
        email: newEmail,
      });
      alert('Profile updated successfully!');
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile: ', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleUploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicture(downloadURL);
      await updateDoc(doc(db, 'users', currentUser.uid), { profilePicture: downloadURL });
      alert('Profile picture updated successfully!');
    }
  };

  const handleShareClick = (palette) => {
    setSelectedPalette(palette);
    setShowShareModal(true);
  };

  return (
    <section style={{ backgroundColor: '#eee' }}>
      <Container className="py-5">
        <Row>
          <Col>
            <nav aria-label="breadcrumb" className="bg-body-tertiary rounded-3 p-3 mb-4">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item active" aria-current="page">User Profile</li>
              </ol>
            </nav>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <Card className="mb-4 text-center">
              <Card.Body>
                <img
                  src={profilePicture || 'https://via.placeholder.com/150'}
                  alt="avatar"
                  className="rounded-circle img-fluid"
                  style={{ width: '150px' }}
                />
                <h5 className="my-3">{profileData.username || 'Your Name'}</h5>
                <Form.Control type="file" onChange={handleUploadProfilePicture} />
                <Button variant="outline-primary" className="mt-3" onClick={() => setEditingProfile(true)}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                {editingProfile ? (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <p><strong>Username:</strong> {profileData.username}</p>
                    <p><strong>Email:</strong> {currentUser.email}</p>
                  </>
                )}
              </Card.Body>
            </Card>
            <Row>
              <Col md={6}>
                <h5>Saved Palettes</h5>
                {savedPalettes.map((palette, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <h6>{palette.name}</h6>
                      <div className="palette-display d-flex">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: color,
                              flex: 1,
                              height: '30px',
                            }}
                          />
                        ))}
                      </div>
                      <Button
                        variant="link"
                        onClick={() => handleShareClick(palette)}
                      >
                        Share
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
              <Col md={6}>
                <h5>Created Palettes</h5>
                {createdPalettes.map((palette, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <h6>{palette.name}</h6>
                      <div className="palette-display d-flex">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: color,
                              flex: 1,
                              height: '30px',
                            }}
                          />
                        ))}
                      </div>
                      <Button
                        variant="link"
                        onClick={() => handleShareClick(palette)}
                      >
                        Share
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
            </Row>
          </Col>
        </Row>
        {selectedPalette && (
          <SharePalette
            show={showShareModal}
            onClose={() => setShowShareModal(false)}
            palette={selectedPalette}
          />
        )}
      </Container>
    </section>
  );
};

export default Profile;
