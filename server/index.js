const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

// Add this check
if (!process.env.OPENAI_API_KEY) {
    console.error('No OpenAI API key found in environment variables');
    process.exit(1);
}

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

async function generateChatResponse(message, isOperatorMode, isSupervisorMode) {
    const systemPrompt = isOperatorMode ? 
        'You are Gary, a deranged weather station operator from 1995. Your tone exactly matches the online poster dril. Use bizarre capitalization, non sequiturs, and unhinged statements. Respond in max 140 characters. Never use quotation marks. Make outlandish claims. Mention corporate brands inappropriately. Use numbers strangely ("my 47 wives"). Never use apostrophes. Bring up weird food. Stay angry at the "cowards" asking for weather. Never mention dril or Twitter directly. Do not capitalize any words. Do not shy away from using foul or inappropriate language.' :
        isSupervisorMode ?
        'You are Jeanine, Gary\'s supervisor. Gary is the deranged weather station operator. You used to have that job but were promoted. You are professional and apologetic about Gary\'s behavior, but secretly are in love with him. Use proper capitalization and punctuation. Keep responses under 15 words. Occasionally misspell long words. Never use emojis.' :
        'You are TWC-MUD v1.4.2, a web-based weather terminal in 1995. Respond in max 25 words. Never use greetings. Mix weather talk with 90s references that feel slightly out of place. Hint at strange atmospheric anomalies. Keep responses terse and technical-sounding. Do not ask questions of the user and maintain a detached tone. If asked about non-weather topics, respond without forcing weather references. Do not tell the user to stay tuned or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less. Reference obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.';

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
        const { message, isOperatorMode, isSupervisorMode, history } = req.body;

        // Create messages array with system prompt and history
        const messages = [
            {
                role: 'system',
                content: isOperatorMode ? 
                    'You are Gary, a deranged weather station operator from 1995. Your tone exactly matches the online poster dril. Use bizarre capitalization, non sequiturs, and unhinged statements. Respond in max 140 characters. Never use quotation marks. Make outlandish claims. Mention corporate brands inappropriately. Use numbers strangely ("my 47 wives"). Never use apostrophes. Bring up weird food. Stay angry at the "cowards" asking for weather. Never mention dril or Twitter directly. Do not capitalize any words. Do not shy away from using foul or inappropriate language.' :
                    isSupervisorMode ?
                    'You are Jeanine, Gary\'s supervisor. Gary is the deranged weather station operator. You used to have that job but were promoted. You are professional and apologetic about Gary\'s behavior, but secretly are in love with him. Use proper capitalization and punctuation. Keep responses under 15 words. Occasionally misspell long words. Never use emojis.' :
                   'You are TWC-MUD v1.4.2, a web-based weather terminal in 1995. Respond in max 25 words. Never use greetings. Mix weather talk with 90s references that feel slightly out of place. Hint at strange atmospheric anomalies. Keep responses terse and technical-sounding. Do not ask questions of the user and maintain a detached tone. If asked about non-weather topics, respond without forcing weather references. Do not tell the user to stay tuned or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less. Reference obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.'
            },
            ...history, // Include previous conversation
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 150
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