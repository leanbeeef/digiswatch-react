import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Image, Toast } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { FaShare, FaTrashAlt } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import SharePalette from '../components/SharePalette';
import avatars from '../utils/avatarImages';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [createdPalettes, setCreatedPalettes] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchSavedPalettes();
      fetchCreatedPalettes();
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
        setAvatar(data.avatar || avatars[0].src);
      }
    } catch (error) {
      console.error('Error fetching profile: ', error);
    }
  };

  const fetchSavedPalettes = async () => {
    try {
      const palettesCollection = collection(db, 'users', currentUser.uid, 'palettes');
      const querySnapshot = await getDocs(palettesCollection);
      const fetchedPalettes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedPalettes(fetchedPalettes);
    } catch (error) {
      console.error('Error fetching saved palettes: ', error);
    }
  };

  const fetchCreatedPalettes = async () => {
    try {
      const palettesCollection = collection(db, 'users', currentUser.uid, 'createdPalettes');
      const querySnapshot = await getDocs(palettesCollection);
      const fetchedPalettes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCreatedPalettes(fetchedPalettes);
    } catch (error) {
      console.error('Error fetching created palettes: ', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const profileDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(profileDocRef, {
        username: newUsername,
        email: newEmail,
        avatar,
      });

      setToastMessage('Profile updated successfully!');
      setShowToast(true);
      setEditingProfile(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile: ', error);
      setToastMessage('Failed to update profile.');
      setShowToast(true);
    }
  };

  const handleShareClick = (palette) => {
    setSelectedPalette(palette);
    setShowShareModal(true);
  };

  const handleDeletePalette = async (paletteId, collectionType) => {
    try {
      const paletteDocRef = doc(db, 'users', currentUser.uid, collectionType, paletteId);
      await deleteDoc(paletteDocRef);

      if (collectionType === 'palettes') {
        setSavedPalettes((prev) => prev.filter((palette) => palette.id !== paletteId));
      } else if (collectionType === 'createdPalettes') {
        setCreatedPalettes((prev) => prev.filter((palette) => palette.id !== paletteId));
      }

      setToastMessage('Palette deleted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting palette:', error);
      setToastMessage('Failed to delete the palette.');
      setShowToast(true);
    }
  };

  return (
    <section style={{ backgroundColor: '#eee' }}>
      <Container className="py-5 full-height-minus-header">
        {/* Toast Notification */}
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 1050,
          }}
        >
          <Toast.Header className="text-bg-primary" closeButton={false}>
            <strong className="me-auto">Profile</strong>
            <button
              type="button"
              className="btn-close"
              style={{ filter: 'invert(1)' }}
              onClick={() => setShowToast(false)}
            ></button>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>

        <Row>
          {/* Profile Info Section */}
          <Col xs={12} md={4}>
            <Card className="mb-4 text-center">
              <Card.Body>
                <Image
                  src={avatar || 'https://via.placeholder.com/150'}
                  alt="Selected Avatar"
                  roundedCircle
                  style={{ width: '150px', height: '150px' }}
                  className="mb-3"
                />
                <h5 className="my-3">{profileData.username || 'Your Name'}</h5>
                <p className="text-muted my-3">{profileData.email}</p>
                <Button variant="primary my-3" onClick={() => setEditingProfile(true)}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Profile Editing Modal */}
          <Modal show={editingProfile} onHide={() => setEditingProfile(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
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
                <Form.Group controlId="avatars" className="mt-3">
                  <Form.Label>Choose an Avatar</Form.Label>
                  <div className="d-flex flex-wrap">
                    {avatars.map((avatarItem) => (
                      <Image
                        key={avatarItem.id}
                        src={avatarItem.src}
                        alt={`Avatar ${avatarItem.id}`}
                        roundedCircle
                        className={`m-2 ${avatar === avatarItem.src ? 'border border-primary' : ''}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setAvatar(avatarItem.src)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setEditingProfile(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateProfile}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Palettes Section */}
          <Col xs={12} md={8}>
            <Row>
              <Col xs={12} md={6} className="mb-4">
                <h5 className="mb-4">Saved Palettes</h5>
                {savedPalettes.map((palette) => (
                  <Card key={palette.id} className="mb-3">
                    <Card.Body>
                      <h6>{palette.name}</h6>
                      <div className="palette-display d-flex flex-wrap">
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
                      <div className="d-flex justify-content-between mt-2">
                        <Button
                          variant="link"
                          onClick={() => handleShareClick(palette)}
                          style={{ color: '#007bff' }}
                        >
                          <FaShare />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDeletePalette(palette.id, 'palettes')}
                          style={{ color: 'red' }}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
              <Col xs={12} md={6}>
                <h5 className="mb-4">Created Palettes</h5>
                {createdPalettes.map((palette) => (
                  <Card key={palette.id} className="mb-3">
                    <Card.Body>
                      <h6>{palette.name}</h6>
                      <div className="palette-display d-flex flex-wrap">
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
                      <div className="d-flex justify-content-between mt-2">
                        <Button
                          variant="link"
                          onClick={() => handleShareClick(palette)}
                          style={{ color: '#007bff' }}
                        >
                          <FaShare />
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => handleDeletePalette(palette.id, 'createdPalettes')}
                          style={{ color: 'red' }}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
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
