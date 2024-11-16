// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Image } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SharePalette from '../components/SharePalette';
import axios from 'axios';

const Profile = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState({});
    const [savedPalettes, setSavedPalettes] = useState([]);
    const [createdPalettes, setCreatedPalettes] = useState([]);
    const [editingProfile, setEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatars, setAvatars] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState(null);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const generatedAvatars = [];
                for (let i = 0; i < 6; i++) {
                    // Generate unique avatar URLs using a random seed
                    const response = await axios.get(`https://avatars.dicebear.com/api/initials/${Math.random().toString(36).substring(7)}.svg`, {
                        responseType: 'text',
                    });
                    generatedAvatars.push(response.config.url);
                }
                setAvatars(generatedAvatars);
            } catch (err) {
                console.error('Error fetching avatars: ', err);
                setError('Failed to load avatars. Please try again.');
            }
        };
        if (currentUser) {
            fetchProfile();
            fetchPalettes();
            fetchAvatars();
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
                setAvatar(data.avatar || '');
            }
        } catch (error) {
            console.error('Error fetching profile: ', error);
        }
    };

    const generateAvatars = async (seed) => {
        const baseUrl = `https://avatars.dicebear.com/api/identicon/`;
        const generatedAvatars = [];
        for (let i = 0; i < 6; i++) {
            generatedAvatars.push(`${baseUrl}${seed}-${i}.svg`);
        }
        setAvatars(generatedAvatars);
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
            const profileDocRef = doc(db, "users", currentUser.uid);

            // Check if the document exists
            const profileDocSnap = await getDoc(profileDocRef);

            if (profileDocSnap.exists()) {
                // Update the document if it exists
                await updateDoc(profileDocRef, {
                    username: newUsername,
                    email: newEmail,
                });
                alert("Profile updated successfully!");
            } else {
                // Create the document if it doesn't exist
                await setDoc(profileDocRef, {
                    username: newUsername,
                    email: newEmail,
                    createdAt: new Date().toISOString(), // Add any additional fields you want
                });
                alert("Profile created and updated successfully!");
            }

            setEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert("Failed to update profile. Please try again.");
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
                                <Image
                                    src={avatar || 'https://via.placeholder.com/150'}
                                    alt="Selected Avatar"
                                    roundedCircle
                                    style={{ width: '150px', height: '150px' }}
                                    className="mb-3"
                                />
                                <h5 className="my-3">{profileData.username || 'Your Name'}</h5>
                                <p className="text-muted mb-1">{profileData.email}</p>
                                <Button variant="primary" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
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
                                            <Form.Group controlId="avatars" className="mt-3">
                                                <Form.Label>Choose an Avatar</Form.Label>
                                                <div className="d-flex flex-wrap">
                                                    {avatars.map((avatarUrl, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={avatarUrl}
                                                            alt={`Avatar ${idx}`}
                                                            roundedCircle
                                                            className={`m-2 ${avatar === avatarUrl ? 'border border-primary' : ''}`}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => setAvatar(avatarUrl)}
                                                        />
                                                    ))}
                                                </div>
                                            </Form.Group>
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
