// src/components/SharePalette.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterest, FaRedditAlien, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const SharePalette = ({ show, onClose, palette }) => {
    const websiteURL = window.location.origin; // Replace with actual website URL
    const paletteName = palette?.name || "Color Palette";
    const paletteColors = palette?.colors?.join(", ") || "";
    const baseURL = window.location.origin; // Get the base URL of your site
    const popularPalettesURL = `${baseURL}/popular-palettes`;
    const shareMessage = `Check out the color palette ${paletteName} ${paletteColors} I just made on DigiSwatch.io: ${popularPalettesURL}`;

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(websiteURL)}&quote=${encodeURIComponent(shareMessage )}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage )}&url=${encodeURIComponent(websiteURL)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(websiteURL)}&title=${encodeURIComponent(paletteName)}&summary=${encodeURIComponent(shareMessage )}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(websiteURL)}&description=${encodeURIComponent(shareMessage )}`,
        reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(paletteName)}&url=${encodeURIComponent(websiteURL)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
        email: `mailto:?subject=${encodeURIComponent(paletteName)}&body=${encodeURIComponent(shareMessage )}`,
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Share This Palette</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <p>Share this palette with others!</p>
                <div className="d-flex justify-content-center gap-3">
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <FaFacebookF size={30} style={{ color: '#4267B2' }} />
                    </a>
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <FaTwitter size={30} style={{ color: '#1DA1F2' }} />
                    </a>
                    <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedinIn size={30} style={{ color: '#0077B5' }} />
                    </a>
                    <a href={shareLinks.pinterest} target="_blank" rel="noopener noreferrer">
                        <FaPinterest size={30} style={{ color: '#E60023' }} />
                    </a>
                    <a href={shareLinks.reddit} target="_blank" rel="noopener noreferrer">
                        <FaRedditAlien size={30} style={{ color: '#FF4500' }} />
                    </a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp size={30} style={{ color: '#25D366' }} />
                    </a>
                    <a href={shareLinks.email} target="_blank" rel="noopener noreferrer">
                        <FaEnvelope size={30} style={{ color: '#0072C6' }} />
                    </a>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SharePalette;
