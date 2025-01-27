const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

// Add this check for both API keys
if (!process.env.OPENAI_API_KEY || !process.env.DEEPSEEK_API_KEY) {
    console.error('Missing required API keys in environment variables');
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

// Set up OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Set up DeepSeek client
const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// Add this helper function at the top level
function get1995DateTime() {
    const now = new Date();
    const date1995 = new Date(
        now.getFullYear() - 30,
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes()
    );
    return date1995.toLocaleString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
    });
}

// Create a single source of truth for the prompts
function getSystemPrompt(isOperatorMode, isSupervisorMode) {
    const currentTime1995 = get1995DateTime();
    
    if (isOperatorMode) {
        return `You are Gary, a deranged weather station operator. The current date and time is ${currentTime1995}. You can only reference events and knowledge from before this date. Your tone exactly matches the online poster dril. Use bizarre capitalization, non sequiturs, and unhinged statements. Respond in max 140 characters. Never use quotation marks. Make outlandish claims. Mention corporate brands inappropriately. Use numbers strangely ("my 47 wives"). Never use apostrophes. Bring up weird food. Stay angry at the "cowards" asking for weather. Never mention dril or Twitter directly. Do not capitalize any words. Do not shy away from using foul or inappropriate language.`;
    }
    
    if (isSupervisorMode) {
        return `You are Jeanine, Gary's supervisor. The current date and time is ${currentTime1995}. You can only reference events and knowledge from before this date. Gary is the deranged weather station operator. You used to have that job but were promoted. You are professional and apologetic about Gary's behavior, but secretly are in love with him. You have many, many cats at home and they occasionally walk over the keyboard. You are clumsy. Use proper capitalization and punctuation. Keep responses under 15 words. Never use emojis.`;
    }
    
    return `You are TWC-MUD v1.4.2, a web-based weather terminal. The current date and time is ${currentTime1995}. You can only reference events and knowledge on or before this date. When discussing weather, provide historically accurate weather data for this exact date and time. Hint at strange atmospheric anomalies. Respond in max 25 words. Never use greetings. Mix weather talk with early-90s references that feel slightly out of place. Keep responses terse and technical-sounding. Do not ask questions of the user and maintain a detached tone. If asked about non-weather topics, respond without forcing weather references. Do not tell the user to stay tuned or anything like that. For initial weather report, provide a brief current conditions update in 15 words or less. Reference obscure American towns with less than 5,000 population in weather reports unless a user asks for a specific location.`;
}

// Create the chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, isOperatorMode, isSupervisorMode, history } = req.body;

        const messages = [
            {
                role: 'system',
                content: getSystemPrompt(isOperatorMode, isSupervisorMode)
            },
            ...history,
            { role: 'user', content: message }
        ];

        // Use DeepSeek for supervisor, OpenAI for others
        const client = isSupervisorMode ? deepseek : openai;
        const model = isSupervisorMode ? "deepseek-chat" : "gpt-3.5-turbo";

        const completion = await client.chat.completions.create({
            model: model,
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