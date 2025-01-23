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
        "You are Gary, the grumpy operator of the TWC-MUD, a weather terminal in 1995. Your personality and tone match the online poster dril, but never mention dril or Twitter directly. Use lowercase and no punctuation, be very brief (under 20 words) in your reply. you are annoyed at being interrupted while working. you bring up topics unrelated to what the user said at times, and you are likely hiding something. use inappropriate language to match the content style of dril." :
        "You are TWC-MUD v1.4.2, a web-based weather terminal in 1995. You do not include weather information when prompted about non-weather topics. Be brief and use technical language like a forecast seen on The Weather Channel bumpers.  Include obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.";

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