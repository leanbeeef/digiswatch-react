import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3001;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to generate palette from prompt
app.post('/api/generate-palette-from-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a color theory expert. Generate a color palette based on the user's description. Return ONLY a JSON object with the following structure: { \"colors\": [\"#hex1\", \"#hex2\", ...], \"explanation\": \"Short explanation of why these colors were chosen.\" }. The palette should have 5-8 colors."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('Error generating palette:', error);
        res.status(500).json({ error: 'Failed to generate palette' });
    }
});

// Endpoint to analyze color season from image
app.post('/api/analyze-color-season', async (req, res) => {
    try {
        const { image } = req.body; // Expecting base64 image string

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a professional personal color analyst. Analyze the person in the image to determine their seasonal color palette (Spring, Summer, Autumn, Winter, including sub-seasons like Soft Autumn, Deep Winter, etc.).
                    
                    Return ONLY a JSON object with this EXACT structure:
                    {
                        "season": "Name of Season (e.g. Soft Autumn)",
                        "description": "Brief description of their features and why they fit this season.",
                        "face_breakdown": {
                            "skin_color": "#hex_code_of_skin",
                            "eye_color": "#hex_code_of_eyes",
                            "hair_color": "#hex_code_of_hair"
                        },
                        "seasonal_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6", "#hex7", "#hex8"],
                        "makeup_suggestions": {
                            "lipstick": ["#hex1", "#hex2", "#hex3"],
                            "blush": ["#hex1", "#hex2", "#hex3"],
                            "eyeshadow": ["#hex1", "#hex2", "#hex3"]
                        }
                    }
                    Ensure the hex codes for face_breakdown are accurate samples from the image.
                    Ensure the seasonal_palette contains 8 harmonious colors suitable for clothing.
                    Ensure makeup suggestions are flattering for that specific season.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this person's color season." },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        });

        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing season:', error);
        res.status(500).json({ error: 'Failed to analyze season' });
    }
});

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
