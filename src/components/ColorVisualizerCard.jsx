// src/components/ColorVisualizerCard.jsx
import React, { useState } from 'react';
import { Card, ButtonGroup, Button, Form } from 'react-bootstrap';
import DashboardCard from './DashboardCard';
import tinycolor from 'tinycolor2';

const ColorVisualizerCard = ({ color, colorInfo, index, moveCard, isExpanded, onToggleExpand }) => {
    const [context, setContext] = useState('button'); // button, input, header, card, text
    const [background, setBackground] = useState('light'); // light, dark

    const getTextColor = (bg) => {
        return tinycolor.readability(bg, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#000000";
    };

    const bgColor = background === 'light' ? '#f8f9fa' : '#212529';
    const textColor = background === 'light' ? '#212529' : '#f8f9fa';

    const renderContext = () => {
        switch (context) {
            case 'button':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', background: bgColor, borderRadius: '8px' }}>
                        <button style={{
                            background: color,
                            color: getTextColor(color),
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Primary Button
                        </button>
                        <button style={{
                            background: 'transparent',
                            color: color,
                            border: `2px solid ${color}`,
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Outline Button
                        </button>
                        <button style={{
                            background: tinycolor(color).setAlpha(0.1).toRgbString(),
                            color: color,
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>
                            Ghost Button
                        </button>
                    </div>
                );

            case 'input':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: bgColor, borderRadius: '8px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: textColor, fontSize: '0.875rem', fontWeight: 600 }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `2px solid ${color}`,
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    background: background === 'light' ? '#fff' : '#1a1a1a',
                                    color: textColor
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div>
                            <input
                                type="checkbox"
                                id="remember"
                                style={{ accentColor: color, marginRight: '0.5rem' }}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                            <label htmlFor="remember" style={{ color: textColor, fontSize: '0.875rem' }}>
                                Remember me
                            </label>
                        </div>
                    </div>
                );

            case 'header':
                return (
                    <div style={{ background: color, color: getTextColor(color), padding: '1.5rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Brand Header</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <a style={{ color: getTextColor(color), textDecoration: 'none', fontWeight: 500 }}>Home</a>
                                <a style={{ color: getTextColor(color), textDecoration: 'none', fontWeight: 500 }}>About</a>
                                <a style={{ color: getTextColor(color), textDecoration: 'none', fontWeight: 500 }}>Contact</a>
                            </div>
                        </div>
                    </div>
                );

            case 'card':
                return (
                    <div style={{ background: bgColor, padding: '1.5rem', borderRadius: '8px' }}>
                        <div style={{
                            background: background === 'light' ? '#fff' : '#1a1a1a',
                            borderLeft: `4px solid ${color}`,
                            padding: '1.25rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <h4 style={{ margin: '0 0 0.75rem 0', color: color, fontSize: '1.125rem', fontWeight: 600 }}>
                                Featured Card
                            </h4>
                            <p style={{ margin: 0, color: textColor, fontSize: '0.875rem', lineHeight: '1.5' }}>
                                This is how your brand color looks as an accent in a card-style layout with text content.
                            </p>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div style={{ background: bgColor, padding: '1.5rem', borderRadius: '8px' }}>
                        <h2 style={{ color: color, margin: '0 0 1rem 0', fontSize: '1.75rem', fontWeight: 700 }}>
                            Heading Text
                        </h2>
                        <p style={{ color: textColor, margin: '0 0 0.75rem 0', fontSize: '1rem', lineHeight: '1.6' }}>
                            Regular paragraph text with a <a href="#" style={{ color: color, textDecoration: 'underline' }}>colored link</a> embedded within the content to show how it reads.
                        </p>
                        <p style={{ color: color, margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
                            Entire paragraph in the brand color to test readability and visual weight.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DashboardCard
            index={index}
            title="Color Visualizer"
            moveCard={moveCard}
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            previewContent={
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: color }}></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--dashboard-text-muted)' }}>
                        Visualizing {context} context
                    </div>
                </div>
            }
        >
            <Card.Body>

                {/* Context Selector */}
                <div className="mb-3">
                    <label className="form-label text-muted small">Context</label>
                    <ButtonGroup size="sm" className="w-100 mb-2">
                        <Button
                            variant={context === 'button' ? 'primary' : 'outline-primary'}
                            onClick={() => setContext('button')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            Buttons
                        </Button>
                        <Button
                            variant={context === 'input' ? 'primary' : 'outline-primary'}
                            onClick={() => setContext('input')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            Inputs
                        </Button>
                        <Button
                            variant={context === 'header' ? 'primary' : 'outline-primary'}
                            onClick={() => setContext('header')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            Header
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup size="sm" className="w-100">
                        <Button
                            variant={context === 'card' ? 'primary' : 'outline-primary'}
                            onClick={() => setContext('card')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            Card
                        </Button>
                        <Button
                            variant={context === 'text' ? 'primary' : 'outline-primary'}
                            onClick={() => setContext('text')}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            Text
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Background Toggle */}
                <div className="mb-3">
                    <Form.Check
                        type="switch"
                        id="dark-mode"
                        label={`${background === 'light' ? 'Light' : 'Dark'} Background`}
                        checked={background === 'dark'}
                        onChange={(e) => setBackground(e.target.checked ? 'dark' : 'light')}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Preview */}
                <div>
                    {renderContext()}
                </div>
            </Card.Body>
        </DashboardCard>
    );
};

export default ColorVisualizerCard;
