// src/components/SharePalette.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaPinterest, FaRedditAlien, FaWhatsapp, FaEnvelope, FaLink } from 'react-icons/fa';
import './SharePalette.css';

const SharePalette = ({ show, onClose, palette, shareUrl }) => {
    const paletteName = palette?.name || "Color Palette";
    const paletteColors = (palette?.colors || []).map((c) => c.hex || c);
    const baseURL = window.location.origin;
    const defaultUrl = `${baseURL}/popular-palettes`;
    const resolvedShareUrl = typeof shareUrl === 'function' ? shareUrl() : shareUrl;
    const urlToShare = resolvedShareUrl || defaultUrl;
    const shareMessage = `Check out the color palette ${paletteName} ${paletteColors.join(", ")} I made on DigiSwatch.io: ${urlToShare}`;

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}&quote=${encodeURIComponent(shareMessage)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(urlToShare)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(urlToShare)}&title=${encodeURIComponent(paletteName)}&summary=${encodeURIComponent(shareMessage)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(urlToShare)}&description=${encodeURIComponent(shareMessage)}`,
        reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(paletteName)}&url=${encodeURIComponent(urlToShare)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
        email: `mailto:?subject=${encodeURIComponent(paletteName)}&body=${encodeURIComponent(shareMessage)}`,
    };

    const copyLink = () => {
        navigator.clipboard.writeText(urlToShare);
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="share-modal">
            <Modal.Header closeButton className="border-0">
                <div className="w-100">
                    <p className="share-chip">Share palette</p>
                    <h4 className="share-title">{paletteName}</h4>
                    <p className="share-subtitle">Spread the word or copy the link</p>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="share-preview">
                    <div className="share-palette-strip">
                        {paletteColors.slice(0, 10).map((c, i) => (
                            <div key={i} style={{ background: c }} title={c} />
                        ))}
                    </div>
                    <div className="share-link-row">
                        <input
                            className="share-link-input"
                            type="text"
                            value={urlToShare}
                            readOnly
                            onFocus={(e) => e.target.select()}
                        />
                        <Button variant="outline-primary" onClick={copyLink} className="share-copy-btn">
                            <FaLink /> Copy
                        </Button>
                    </div>
                </div>
                <div className="share-grid">
                    <a className="share-card facebook" href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <FaFacebookF /> Facebook
                    </a>
                    <a className="share-card twitter" href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <FaTwitter /> Twitter
                    </a>
                    <a className="share-card linkedin" href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedinIn /> LinkedIn
                    </a>
                    <a className="share-card pinterest" href={shareLinks.pinterest} target="_blank" rel="noopener noreferrer">
                        <FaPinterest /> Pinterest
                    </a>
                    <a className="share-card reddit" href={shareLinks.reddit} target="_blank" rel="noopener noreferrer">
                        <FaRedditAlien /> Reddit
                    </a>
                    <a className="share-card whatsapp" href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp /> WhatsApp
                    </a>
                    <a className="share-card email" href={shareLinks.email} target="_blank" rel="noopener noreferrer">
                        <FaEnvelope /> Email
                    </a>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SharePalette;
