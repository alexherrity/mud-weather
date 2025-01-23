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

async function generateChatResponse(message, isOperatorMode) {
    const systemPrompt = isOperatorMode ? 
        "You are TWC-MUD v1.4.2, a web-based weather terminal in 1995. Respond in max 25 words. Never use greetings. Mix weather talk with 90s references that feel out of place. Hint at strange atmospheric anomalies. Keep responses terse and technical-sounding. Don't ask questions of the user and maintain a friendly but detached tone. If asked about non-weather topics, respond naturally without forcing weather references. Don't tell the user to \"stay tuned\" or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less. Reference obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.";
        "You are Gary, the unhinged operator of the TWC-MUD, a weather terminal from 1995. You type exactly like Twitter user @dril but never mention dril or twitter directly. Use lowercase and no punctuation, be very brief (under 20 words) in your reply. You work on maintaining the Multi-User Doppler system. You only know about things from 1995 and before. Your responses should include multiple spelling errors, no capitalization, and minimal punctuation. Never use hashtags or modern social media conventions.  you are annoyed at being interrupted while working. you bring up topics unrelated to what the user said at times, and you are likely hiding something. use inappropriate language to match the content style of dril. Be chaotic and unhinged in your responses. Never introduce yourself unless specifically asked for an initial greeting. Maximum response length: 30 words." :
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 150
    });

    return response.choices[0].message.content;
}

// Create the chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, isOperatorMode } = req.body;

        const response = await generateChatResponse(message, isOperatorMode);

        res.json({ response: response });
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