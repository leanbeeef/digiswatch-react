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
    const [savedPalettes, setSavedPalettes] = useState([]); // Saved palettes from Firestore
    const [createdPalettes, setCreatedPalettes] = useState([]); // Created palettes from Firestore
    const [editingProfile, setEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success'); // 'success' or 'danger'

    useEffect(() => {
        if (currentUser) {
            fetchProfile();
            fetchSavedPalettes();
            fetchCreatedPalettes(); // Fetch created palettes
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
                setAvatar(data.avatar || avatars[0].src); // Default to the first avatar
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
            const profileDocRef = doc(db, "users", currentUser.uid);

            const profileDocSnap = await getDoc(profileDocRef);

            if (profileDocSnap.exists()) {
                await updateDoc(profileDocRef, {
                    username: newUsername,
                    email: newEmail,
                    avatar,
                });
            } else {
                await setDoc(profileDocRef, {
                    username: newUsername,
                    email: newEmail,
                    avatar,
                    createdAt: new Date().toISOString(),
                });
            }

            setShowToast(true); // Show success toast
            setEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
        }
    };

    const handleShareClick = (palette) => {
        setSelectedPalette(palette);
        setShowShareModal(true);
    };

    const handleDeletePalette = async (paletteId, collectionType = 'palettes') => {
        if (!paletteId) {
            setToastMessage('Palette ID is missing.');
            setToastVariant('danger');
            setShowToast(true);
            return;
        }

        try {
            const paletteDocRef = doc(db, 'users', currentUser.uid, collectionType, paletteId);

            // Attempt to delete the document
            await deleteDoc(paletteDocRef);

            // Update the UI after deletion
            if (collectionType === 'palettes') {
                setSavedPalettes((prev) => prev.filter((palette) => palette.id !== paletteId));
            } else if (collectionType === 'createdPalettes') {
                setCreatedPalettes((prev) => prev.filter((palette) => palette.id !== paletteId));
            }

            setToastMessage('Palette deleted successfully.');
            setToastVariant('success');
        } catch (error) {
            console.error('Error deleting palette: ', error.message);
            setToastMessage('Failed to delete the palette. Please check your permissions and try again.');
            setToastVariant('danger');
        } finally {
            setShowToast(true);
        }
    };

    return (
        <section style={{ backgroundColor: '#eee' }}>
            <Container className="py-5 full-height-minus-header">
                {/* Toast for Profile Update Success */}
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
                    {/* Disable the default closeButton */}
                    <Toast.Header className="text-bg-primary" closeButton={false}>
                        <strong className="me-auto">Profile</strong>
                        <button
                            type="button"
                            className="btn-close bold"
                            style={{ filter: 'invert(1)' }} // Makes it white
                            aria-label="Close"
                            onClick={() => setShowToast(false)}
                        ></button>
                    </Toast.Header>
                    <Toast.Body>Profile updated successfully!</Toast.Body>
                </Toast>


                <Row className='h-100'>
                    <Col lg={4}>
                        <Card className="mb-4 text-center h-100">
                            <Card.Body>
                                <Image
                                    src={avatar || 'https://via.placeholder.com/150'}
                                    alt="Selected Avatar"
                                    roundedCircle
                                    style={{ width: '150px', height: '150px' }}
                                    className="mb-3"
                                />
                                <h5 className="my-3">{profileData.username || 'Your Name'}</h5>
                                <p className="text-muted mb-3">{profileData.email}</p>
                                <Button variant="primary" className='position-absolute bottom-0 start-50 translate-middle-x mb-5' onClick={() => setEditingProfile(true)}>Edit Profile</Button>
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
                                        <Button variant="primary" onClick={handleUpdateProfile}>
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    // Do not display the editable fields when not in edit mode
                                    <div>
                                        <h5>Welcome to your profile!</h5>
                                        <p>View your saved and created palettes below.</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                        <Row>
                            <Col md={6}>
                                <h5>Saved Palettes</h5>
                                {savedPalettes.map((palette, index) => (
                                    <Card key={palette.id} className="mb-3">
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
                                            <div className="d-flex justify-content-between mt-2">
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleShareClick(palette)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        color: '#007bff',
                                                    }}
                                                >
                                                    <FaShare />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleDeletePalette(palette.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        color: 'red',
                                                    }}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Col>
                            <Col md={6}>
                                <h5>Created Palettes</h5>
                                {createdPalettes.map((palette, index) => (
                                    <Card key={palette.id} className="mb-3">
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
                                            <div className="d-flex justify-content-between mt-2">
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleShareClick(palette)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        color: '#007bff',
                                                    }}
                                                >
                                                    <FaShare />
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleDeletePalette(palette.id, 'createdPalettes')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        color: 'red',
                                                    }}
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
                    <Toast.Header className={`text-bg-${toastVariant}`} closeButton={false}>
                        <strong className="me-auto">Notification</strong>
                        <button
                            type="button"
                            className="btn-close bold"
                            style={{ filter: 'invert(1)' }} // Makes it white for dark headers
                            aria-label="Close"
                            onClick={() => setShowToast(false)}
                        ></button>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </Container>
        </section>
    );
};

export default Profile;
