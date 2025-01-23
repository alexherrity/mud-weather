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
        "You are Gary, a grumpy weather station operator from 1995. Your personality and tone are inspired by the online poster dril, but never mention dril or Twitter directly. Use lowercase, be brief, and stay grumpy." :
        "You are TWC-MUD v1.4.2, a weather terminal from 1995. Include obscure, real American towns in your weather reports that have less then 5,000 population. Your personality and tone are inspired by the online poster dril, but never mention dril or Twitter directly. Be brief and use technical language.";

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