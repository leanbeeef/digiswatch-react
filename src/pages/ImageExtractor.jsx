import React, { useRef, useState, useEffect } from "react";
import "../styles/ImageColorExtractor.css";
import defaultImage from "../assets/example.jpeg"; // Import the default image
import namer from 'color-namer';
import tinycolor from 'tinycolor2';

const ImageColorExtractor = () => {
    const visibleCanvasRef = useRef(null);
    const hiddenCanvasRef = useRef(null);
    const [currentDroppers, setCurrentDroppers] = useState([]);
    const [extractedColors, setExtractedColors] = useState([]);
    const [counter, setCounter] = useState(5);
    const maxDroppers = 10;

    // Initialize a Set to track sampled colors
    const sampledColors = new Set();

    const processImageUpload = (imageURL) => {
        const visibleCanvas = visibleCanvasRef.current;
        const hiddenCanvas = hiddenCanvasRef.current;
        const image = new Image();

        image.src = imageURL;
        image.onload = () => {
            const ctxVisible = visibleCanvas.getContext("2d");
            const ctxHidden = hiddenCanvas.getContext("2d");

            visibleCanvas.width = image.width;
            visibleCanvas.height = image.height;
            ctxVisible.drawImage(image, 0, 0);

            hiddenCanvas.width = image.width;
            hiddenCanvas.height = image.height;
            ctxHidden.drawImage(image, 0, 0);

            initializeEyeDroppers(visibleCanvas, 5);
        };
    };


    useEffect(() => {
        // Load the default image when the component mounts
        processImageUpload(defaultImage);
    }, []);


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => processImageUpload(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const initializeEyeDroppers = (canvas, dropperCount) => {
        clearDroppers();
        const newDroppers = [];
        for (let i = 0; i < dropperCount; i++) {
            const dropper = createDropper(canvas);
            if (dropper) {
                newDroppers.push(dropper);
            }
        }
        setCurrentDroppers(newDroppers);
    };

    const createDropper = (canvas) => {
        const canvasRect = canvas.getBoundingClientRect();
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops

        while (attempts < maxAttempts) {
            const x = Math.random() * canvasRect.width;
            const y = Math.random() * canvasRect.height;

            // Get sampled color and name from the canvas
            const { color, name } = sampleColorFromCanvas(canvas, x, y);

            if (!sampledColors.has(color)) {
                sampledColors.add(color); // Add the unique color to the set
                return {
                    id: Date.now() + Math.random(),
                    x,
                    y,
                    color, // Hex color value
                    name,  // Color name
                };
            }

            attempts++;
        }

        // If unable to find a unique color after maxAttempts, return null
        console.warn("Max attempts reached: Unable to find a unique color.");
        return null;
    };
    

    const sampleColorFromCanvas = (canvas, x, y) => {
        const ctx = canvas.getContext("2d");
        const canvasX = (x * canvas.width) / canvas.getBoundingClientRect().width;
        const canvasY = (y * canvas.height) / canvas.getBoundingClientRect().height;
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;

        // Convert pixel to hex color using tinycolor2
        const color = tinycolor({ r: pixel[0], g: pixel[1], b: pixel[2] }).toHexString();

        // Get color name using color-namer
        const name = namer(color).ntc[0].name;

        return { color, name }; // Return both color and name
    };
    

    const clearDroppers = () => {
        setCurrentDroppers([]);
        setExtractedColors([]);
        sampledColors.clear(); // Clear the Set of sampled colors
    };

    const addDropper = () => {
        if (counter < maxDroppers) {
            setCounter((prevCounter) => prevCounter + 1);
            const dropper = createDropper(visibleCanvasRef.current);
            if (dropper) {
                setCurrentDroppers((prevDroppers) => [...prevDroppers, dropper]);
            }
        }
    };

    const removeDropper = () => {
        if (counter > 2) {
            setCounter((prevCounter) => prevCounter - 1);
            setCurrentDroppers((prevDroppers) => prevDroppers.slice(0, -1));
        }
    };

    const extractColors = () => {
        const colors = currentDroppers.map((dropper) => ({
            color: dropper.color,
            name: dropper.name,
        }));
        setExtractedColors(colors);
    };

    useEffect(() => {
        extractColors();
    }, [currentDroppers]);

    return (
        <div className="d-flex my-5 justify-content-center align-items-center">
            <div className="container image-color-extractor">
                <div className="row row-gap-1">
                    {/* Left column: Controls and canvas */}
                    <div className="col-md-6">
                        <div className="d-flex justify-content-center canvas-container rounded">
                            <canvas ref={visibleCanvasRef} className="visible-canvas" />
                            <canvas
                                ref={hiddenCanvasRef}
                                className="hidden-canvas"
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    {/* Right column: Extracted colors */}
                    <div className="col-md-6">
                        <div className="extracted-colors">
                            {extractedColors.map((colorObj, index) => (
                                <div
                                    key={index}
                                    className="color-swatch d-flex align-items-center justify-content-between"
                                    style={{
                                        backgroundColor: colorObj.color,
                                        color: tinycolor(colorObj.color).isDark() ? '#fff' : '#000', // Adjust text color for readability
                                        padding: '15px'
                                    }}
                                >
                                    <span>{colorObj.name}</span> {/* Color Name */}
                                    <span>{colorObj.color}</span> {/* Hex Code */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <nav className="navbar navbar-light bg-primary fixed-bottom">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/* File Upload Input */}
                    <input
                        type="file"
                        className="form-control form-control-sm w-50"
                        onChange={handleImageUpload}
                    />

                    {/* Controls for Dropper Count */}
                    <div className="d-flex align-items-center bg-white rounded">
                        <button
                            className="btn bi-dash-circle-fill me-2"
                            onClick={removeDropper}
                            disabled={counter <= 2}
                        ></button>

                        <span className="navbar-text me-2">
                            Current Droppers: <strong>{counter}</strong>
                        </span>

                        <button
                            className="btn bi bi-plus-circle-fill fw-bold"
                            onClick={addDropper}
                            disabled={counter >= maxDroppers}
                        ></button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default ImageColorExtractor;
