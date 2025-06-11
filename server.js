// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // For making HTTP requests to external APIs

const app = express();
const PORT = 5000; // This is the port your frontend will connect to

// Enable CORS for all routes to allow frontend to connect
app.use(cors());

// Enable JSON body parsing for incoming requests (req.body)
app.use(express.json());

// --- Routes ---

// Root route - simple check to see if backend is running
app.get('/', (req, res) => {
    res.send("JARVIS Node.js Backend is Running");
});

// Main command processing route
app.post('/command', async (req, res) => {
    const msg = req.body.message ? req.body.message.toLowerCase() : '';
    let responseText = "I'm not sure how to respond to that.";
    let action = null; // To indicate specific actions for frontend (e.g., web_search)
    let query = null; // For web search queries

    // General Greetings
    if (msg.includes("hello jarvis") || msg.includes("hi jarvis") || msg.includes("hey jarvis")) {
        responseText = "Hello there! How can I assist you today?";
    }

    // Date & Time (Backend confirmation, frontend handles primary display)
    else if (msg.includes("time")) {
        // Format time similar to Python's strftime("%I:%M %p")
        responseText = `The time according to my server is ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else if (msg.includes("date")) {
        // Format date similar to Python's strftime("%B %d, %Y")
        responseText = `Today's date according to my server is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    }

    // Joke API Integration
    else if (msg.includes("tell me a joke") || msg.includes("joke")) {
        try {
            const jokeResponse = await axios.get("https://official-joke-api.appspot.com/random_joke");
            const jokeData = jokeResponse.data;
            responseText = `${jokeData.setup} ... ${jokeData.punchline}`;
        } catch (error) {
            console.error(`Error fetching joke from API: ${error.message}`);
            responseText = "Sorry, I couldn't fetch a joke right now. The joke service might be unavailable.";
        }
    }

    // Web Search Trigger (Backend suggests action to frontend)
    else if (msg.includes("search for") || msg.includes("find information about")) {
        const searchKeywords = msg.includes("search for") ? "search for" : "find information about";
        query = msg.split(searchKeywords)[1].trim();
        if (query) {
            responseText = `Searching the web for ${query}.`;
            action = "web_search"; // Signal frontend to open Google
        } else {
            responseText = "What would you like me to search for?";
        }
    } else if (msg.includes("google") && (msg.includes("what is") || msg.includes("who is") || msg.includes("how to"))) {
        let queryParts = [];
        if (msg.includes("what is")) queryParts = msg.split("what is", 2);
        else if (msg.includes("who is")) queryParts = msg.split("who is", 2);
        else if (msg.includes("how to")) queryParts = msg.split("how to", 2);

        if (queryParts.length > 1 && queryParts[1].trim()) {
            query = queryParts[1].trim();
            responseText = `I'll search Google for ${query}.`;
            action = "web_search";
        } else {
            responseText = "What would you like me to Google?";
        }
    }

    // Translate (Placeholder)
    else if (msg.includes("translate")) {
        const parts = msg.split("translate");
        if (parts.length > 1 && parts[1].trim()) {
            query = parts[1].trim();
            responseText = `The translation feature is under development. You asked to translate: "${query}"`;
        } else {
            responseText = "Please specify what to translate for me.";
        }
    }

    // Weather (Instructions to frontend)
    else if (msg.includes("weather")) {
        responseText = "I use your browser's location for weather. Please ensure location access is enabled on the frontend.";
    }

    // Advanced AI Query (Placeholder for actual AI model integration)
    // This is where you would call an external AI API (e.g., OpenAI, Gemini).
    else if (msg.includes("what is") || msg.includes("who is") || msg.includes("how do") || msg.includes("explain") || msg.includes("define") || msg.includes("tell me about")) {
        responseText = `That's an interesting question! For advanced queries like "${msg}", I would typically use a powerful AI model. This functionality requires setting up an external AI API key and integrating it here. I can search Google for that if you'd like; just say 'search for [your query]'.`;
    }

    // Default response if no specific command is matched
    else {
        responseText = "I can try to search for that online. Just say 'search for' followed by your query.";
    }

    // Send the response back to the frontend
    res.json({ response: responseText, action: action, query: query });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`JARVIS Node.js Backend listening on port ${PORT}`);
    console.log('Ensure your frontend is also running and accessing http://127.0.0.1:5000');
});