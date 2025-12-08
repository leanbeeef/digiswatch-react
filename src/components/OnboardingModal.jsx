import { useEffect, useState } from 'react';
import { Modal, Button, Form, Image, Spinner } from 'react-bootstrap';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import avatars from '../utils/avatarImages';
import { storage } from '../firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const OnboardingModal = ({ show, onClose, onSave, currentUser }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]?.src || '');
  const [username, setUsername] = useState('');
  const [usageGoal, setUsageGoal] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      setUsername((prev) => prev || emailName);
    }
  }, [currentUser]);

  const handleFileChange = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Max 5MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const safeName = file.name.replace(/\s+/g, '_');
      const path = `avatars/${currentUser?.uid || 'anonymous'}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSelectedAvatar(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      setError('Please enter a display name.');
      return;
    }
    onSave({
      avatar: selectedAvatar,
      username: username.trim(),
      usageGoal: usageGoal.trim(),
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Set up your profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <Form.Label>Choose an avatar</Form.Label>
          <div className="d-flex flex-wrap">
            {avatars.map((avatarItem) => (
              <Image
                key={avatarItem.id}
                src={avatarItem.src}
                alt={`Avatar ${avatarItem.id}`}
                roundedCircle
                className={`m-2 ${selectedAvatar === avatarItem.src ? 'border border-primary' : ''}`}
                style={{
                  width: '60px',
                  height: '60px',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedAvatar(avatarItem.src)}
              />
            ))}
          </div>
        </div>
        <div className="mb-3">
          <Form.Label>Or upload your own (max 5MB)</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          {uploading && (
            <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
              <Spinner animation="border" size="sm" /> Uploading...
            </div>
          )}
        </div>
        <Form.Group className="mb-3">
          <Form.Label>Display name</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>What are you using DigiSwatch for?</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={usageGoal}
            onChange={(e) => setUsageGoal(e.target.value)}
            placeholder="e.g. Brand palettes, UI design, interior moodboards"
          />
        </Form.Group>
        {error && <div className="text-danger small mt-2">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={uploading}>
          Skip for now
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={uploading}>
          Save profile
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OnboardingModal;
