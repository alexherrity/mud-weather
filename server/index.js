const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

// Add extensive debugging
console.log('Current directory:', process.cwd());
console.log('Env file loaded:', require('dotenv').config());
console.log('All env variables:', process.env);
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);

const app = express();

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Set up OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateChatResponse(message, isOperatorMode) {
    const systemPrompt = isOperatorMode ? 
        'Your personality and tone exactly match the online poster dril, and all of your messages sound like they could be tweets from dril. Your name is Gary and you are the grumpy operator of the TWC-MUD, a web-based weather terminal from 1995. never mention dril or Twitter directly. You are talking to the user through the weather terminal through the internet. Use lowercase and be brief. change the subject quickly and without warning. You don\'t like it when someone interrupts your work. Always use inappropriate and offensive language.' :
        'You are TWC-MUD v1.4.2, a web-based weather terminal in 1995. Respond in max 25 words. Never use greetings. Mix weather talk with 90s references that feel out of place. Hint at strange atmospheric anomalies. Keep responses terse and technical-sounding. Do not ask questions of the user and maintain a friendly but detached tone. If asked about non-weather topics, respond naturally without forcing weather references. Do not tell the user to stay tuned or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less. Reference obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.';

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