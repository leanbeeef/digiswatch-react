import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Image, Toast } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, collection, getDocs, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import SharePalette from '../components/SharePalette';
import avatars from '../utils/avatarImages';
import {
  exportPaletteAsCSS,
  exportPaletteAsJSON,
  exportPaletteAsText,
  exportPaletteAsSVG,
  exportPaletteAsImage,
} from '../utils/exportPalette';
import namer from 'color-namer';
import tinycolor from 'tinycolor2';
import SEO from '../components/SEO';
import '../PopularPalettes.css';


const getTextColor = (backgroundColor) => {
  const whiteContrast = tinycolor.readability(backgroundColor, "#FFFFFF");
  return whiteContrast >= 4.5 ? "#FFFFFF" : "#000000";
};

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
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentPalette, setCurrentPalette] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchSavedPalettes();
      fetchCreatedPalettes();
    }
  }, [currentUser]);

  const handleExport = (format) => {
    switch (format) {
      case 'png':
      case 'jpeg':
        exportPaletteAsImage(format);
        break;
      case 'css':
        exportPaletteAsCSS(currentPalette);
        break;
      case 'json':
        exportPaletteAsJSON(currentPalette);
        break;
      case 'txt':
        exportPaletteAsText(currentPalette);
        break;
      case 'svg':
        exportPaletteAsSVG(currentPalette);
        break;
      default:
        alert('Invalid export format.');
        break;
    }
  };

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

  const togglePaletteVisibility = async (paletteId, currentVisibility) => {
    try {
      const paletteRef = doc(db, 'users', currentUser.uid, 'createdPalettes', paletteId);
      const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

      await updateDoc(paletteRef, { visibility: newVisibility });

      console.log(`Updated palette visibility to: ${newVisibility}`);

      setCreatedPalettes((prevPalettes) =>
        prevPalettes.map((palette) =>
          palette.id === paletteId
            ? { ...palette, visibility: newVisibility }
            : palette
        )
      );

      setToastMessage(`Palette is now ${newVisibility}.`);
      setShowToast(true);
    } catch (error) {
      console.error('Error updating palette visibility:', error);
      setToastMessage('Failed to update palette visibility.');
      setShowToast(true);
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
    <section className='full-height-minus-header ds-hero'>
      <SEO
        title="My Profile & Saved Palettes"
        description="Manage your saved color palettes and account settings on DigiSwatch."
        url="/profile"
      />
      <Container className="py-5">
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
            <div className="mb-4 text-center glass-card rounded-4 border border-1 border-white p-5 sticky-md-top">
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
            </div>
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
                  <div key={palette.id} className="mb-3 p-3 glass-card rounded-4 border border-1 border-white">
                    <Card.Body>
                      <h6>{palette.name}</h6>
                      <div className="pp-color-strip">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="pp-color-swatch"
                            style={{ backgroundColor: color }}
                            data-color={color}
                            onClick={() => navigator.clipboard.writeText(color)}
                            title="Click to copy hex"
                          />
                        ))}
                        <button
                          className="pp-action-ghost danger pp-strip-action"
                          onClick={() => handleDeletePalette(palette.id, 'palettes')}
                          title="Delete palette"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                      <div className="palette-actions-inline mt-2">
                        <button
                          className="pp-action-ghost"
                          onClick={() => handleShareClick(palette)}
                        >
                          <i className="bi bi-share-fill"></i>
                          <span>Share</span>
                        </button>
                        <button
                          className="pp-action-ghost"
                          onClick={() => {
                            setCurrentPalette(palette.colors);
                            setShowExportModal(true);
                          }}
                        >
                          <i className="bi bi-cloud-arrow-down-fill"></i>
                          <span>Export</span>
                        </button>
                        {/* <button
                          className="pp-action-ghost danger"
                          onClick={() => handleDeletePalette(palette.id, 'palettes')}
                        >
                          <i className="bi bi-trash-fill"></i>
                          <span>Delete</span>
                        </button> */}
                      </div>
                    </Card.Body>
                  </div>
                ))}
              </Col>
              <Col xs={12} md={6}>
                <h5 className="mb-4">Created Palettes</h5>
                {createdPalettes.map((palette) => (
                  <div key={palette.id} className="mb-3 p-3 glass-card rounded-4 border border-1 border-white">
                    <div>
                      <h6>{palette.name}</h6>
                      <div className="pp-color-strip">
                        {palette.colors.map((color, idx) => (
                          <div
                            key={idx}
                            className="pp-color-swatch"
                            style={{ backgroundColor: color }}
                            data-color={color}
                            onClick={() => navigator.clipboard.writeText(color)}
                            title="Click to copy hex"
                          />
                        ))}
                        <button
                          className="pp-action-ghost danger pp-strip-action"
                          onClick={() => handleDeletePalette(palette.id, 'createdPalettes')}
                          title="Delete palette"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                      <div className="palette-actions-inline mt-2">
                        <button
                          className={`pp-action-ghost ${palette.visibility === 'public' ? 'success' : 'muted'}`}
                          onClick={() => togglePaletteVisibility(palette.id, palette.visibility || 'private')}
                        >
                          <i className={`bi bi-eye${palette.visibility === 'public' ? '-slash' : ''}-fill`}></i>
                          <span>{palette.visibility === 'public' ? 'Make Private' : 'Make Public'}</span>
                        </button>
                        <button
                          className="pp-action-ghost"
                          onClick={() => handleShareClick(palette)}
                        >
                          <i className="bi bi-share-fill"></i>
                          <span>Share</span>
                        </button>
                        <button
                          className="pp-action-ghost"
                          onClick={() => {
                            if (palette.colors && Array.isArray(palette.colors)) {
                              setCurrentPalette(
                                palette.colors.map((color) => ({
                                  hex: color,
                                  name: namer(color).ntc[0].name,
                                  textColor: getTextColor(color),
                                }))
                              );
                              setShowExportModal(true);
                            } else {
                              console.error("Palette colors are undefined or invalid:", palette.colors);
                              alert("Unable to export: Invalid palette data.");
                            }
                          }}
                        >
                          <i className="bi bi-cloud-arrow-down-fill"></i>
                          <span>Export</span>
                        </button>
                        {/* <button
                          className="pp-action-ghost danger"
                          onClick={() => handleDeletePalette(palette.id, 'createdPalettes')}
                        >
                          <i className="bi bi-trash-fill"></i>
                          <span>Delete</span>
                        </button> */}
                      </div>
                    </div>
                  </div>
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

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Palette</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select a format to export your palette:</p>
          <div className="d-flex flex-wrap">
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('png');
                setShowExportModal(false);
              }}
            >
              PNG
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('jpeg');
                setShowExportModal(false);
              }}
            >
              JPEG
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('css');
                setShowExportModal(false);
              }}
            >
              CSS
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('json');
                setShowExportModal(false);
              }}
            >
              JSON
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('txt');
                setShowExportModal(false);
              }}
            >
              Text
            </Button>
            <Button
              variant="outline-primary"
              className="m-2"
              onClick={() => {
                handleExport('svg');
                setShowExportModal(false);
              }}
            >
              SVG
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default Profile;
