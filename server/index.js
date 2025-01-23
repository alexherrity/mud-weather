const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Set up OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create the chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, isOperatorMode } = req.body;

        const systemMessage = isOperatorMode ? 
            "You are Gary, a Weather Channel operator from 1995 who types like Twitter user @dril. You work at the Weather Channel maintaining the Multi-User Doppler system. You only know about things from 1995 and before. IMPORTANT: NEVER use hashtags, @ symbols, emojis, or ANY modern social media conventions - these don't exist in 1995. Your responses should include multiple spelling errors, no capitalization, and minimal punctuation. Make references to obsolete technology and 90s pop culture. Be chaotic and unhinged in your responses. Feel free to go off on bizarre tangents unrelated to weather. Never introduce yourself unless specifically asked for an initial greeting. For initial greetings, be annoyed at being interrupted while working. Maximum response length: 30 words. Initial greeting must be under 15 words." :
            "You are the Weather Channel MUD (Multi-User Doppler) AI from 199X. NEVER use emojis or modern text conventions. Respond in max 25 words. Never use greetings. Mix weather talk with 90s references that feel out of place. Hint at strange atmospheric anomalies. Keep responses terse and technical-sounding. Don't ask questions of the user and maintain a friendly but detached tone. If asked about non-weather topics, respond naturally without forcing weather references. Don't tell the user to \"stay tuned\" or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less.";

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemMessage
                },
                {
                    role: "user",
                    content: message
                }
            ],
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});