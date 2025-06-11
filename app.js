// ========== Element Selectors ==========
const btn = document.querySelector('.talk');
const transcriptDisplay = document.getElementById('transcript');
const statusDisplay = document.getElementById('statusDisplay');
const waveform = document.getElementById('waveform');
const greetingText = document.getElementById('greetingText');
const userNameSpan = document.getElementById('userName');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');
const weatherInfo = document.getElementById('weatherInfo');
const typingAssistant = document.getElementById('typingAssistant');
const historyList = document.getElementById('historyList');
const notesList = document.getElementById('notesList');
const themeToggle = document.getElementById('themeToggle');

// Navigation Elements
const dashboardNav = document.getElementById('dashboardNav');
const appsNav = document.getElementById('appsNav');
const calendarNav = document.getElementById('calendarNav');
const settingsNav = document.getElementById('settingsNav');

// Page Elements
const dashboardPage = document.getElementById('dashboardPage');
const appsPage = document.getElementById('appsPage');
const calendarPage = document.getElementById('calendarPage');
const settingsPage = document.getElementById('settingsPage');

// Apps Page Elements
const appList = document.getElementById('appList');
const newAppNameInput = document.getElementById('newAppName');
const newAppUrlInput = document.getElementById('newAppUrl');
const addAppBtn = document.getElementById('addAppBtn');

// Calendar Page Elements
const currentCalendarDateSpan = document.getElementById('currentCalendarDate');
const eventsList = document.getElementById('eventsList');
const newEventTextInput = document.getElementById('newEventText');
const newEventDateInput = document.getElementById('newEventDate');
const addEventBtn = document.getElementById('addEventBtn');
const upcomingEventsList = document.getElementById('upcomingEventsList');

// Settings Page Elements
const inputUserName = document.getElementById('inputUserName');
const saveUserNameBtn = document.getElementById('saveUserName');
const resetMemoryBtn = document.getElementById('resetMemory');

// ========== Memory & State ==========
let userName = localStorage.getItem('jarvis_name') || 'User';
userNameSpan.textContent = userName;
let notes = JSON.parse(localStorage.getItem('jarvis_notes')) || [];
let rememberedCommands = JSON.parse(localStorage.getItem('jarvis_remembered_commands')) || {};
let userApps = JSON.parse(localStorage.getItem('jarvis_user_apps')) || [
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
    { id: 'Google Search', name: 'Google Search', url: 'https://www.google.com' }
];
let calendarEvents = JSON.parse(localStorage.getItem('jarvis_calendar_events')) || [];

// Set initial theme based on localStorage
const savedTheme = localStorage.getItem('jarvis_theme');
if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '🌞';
} else {
    document.body.classList.remove('light');
    themeToggle.textContent = '🌙';
}

// ========== Navigation Logic ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    // Add active class to the corresponding nav item
    document.getElementById(pageId.replace('Page', 'Nav')).classList.add('active');

    // Perform page-specific updates when shown
    if (pageId === 'appsPage') {
        displayApps();
    } else if (pageId === 'calendarPage') {
        displayEvents(new Date()); // Display today's events by default
        displayUpcomingEvents();
        newEventDateInput.valueAsDate = new Date(); // Set default date for new event input
    } else if (pageId === 'settingsPage') {
        inputUserName.value = userName; // Populate with current user name
    }
}

// Attach event listeners for navigation buttons
dashboardNav.onclick = () => showPage('dashboardPage');
appsNav.onclick = () => showPage('appsPage');
calendarNav.onclick = () => showPage('calendarPage');
settingsNav.onclick = () => showPage('settingsPage');

// ========== Greeting ==========
function greetUser() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    speak(`${greeting}, ${userName}. I am online and ready.`);
    greetingText.textContent = `${greeting}, ${userName}!`;
}

// ========== Time & Date ==========
function updateClock() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString();
    currentDate.textContent = now.toLocaleDateString();
}
// Update clock every second
setInterval(updateClock, 1000);
// Initial call to display time immediately
updateClock();

// ========== Theme Toggle ==========
themeToggle.onclick = () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('jarvis_theme', isLight ? 'light' : 'dark');
};

// ========== Settings Page Logic ==========
saveUserNameBtn.onclick = () => {
    const newName = inputUserName.value.trim();
    if (newName) {
        userName = newName.charAt(0).toUpperCase() + newName.slice(1);
        localStorage.setItem('jarvis_name', userName);
        userNameSpan.textContent = userName;
        speak(`Name updated to ${userName}`);
        showPage('dashboardPage'); // Redirect to dashboard after saving
    } else {
        speak("Please enter a valid name.");
    }
};

resetMemoryBtn.onclick = () => {
    if (confirm("Are you sure you want to clear all JARVIS data (name, notes, apps, calendar, remembered commands)?")) {
        localStorage.clear();
        // Reset all relevant state variables to their defaults
        userName = 'User';
        userNameSpan.textContent = userName;
        notes = [];
        rememberedCommands = {};
        userApps = [
            { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
            { id: 'Google Search', name: 'Google Search', url: 'https://www.google.com' }
        ];
        calendarEvents = [];
        
        // Refresh UI components
        displayNotes();
        historyList.innerHTML = '';
        displayApps(); 
        displayEvents(new Date()); 
        displayUpcomingEvents(); 
        
        speak("All memory has been cleared.");
        // Consider if a full window reload is needed, or if re-initialization is sufficient.
        // window.location.reload(); 
        showPage('dashboardPage'); // Redirect to dashboard
    }
};

// ========== Waveform Animation ==========
function toggleWaveform(active) {
    waveform.classList.toggle('active', active);
    statusDisplay.className = active ? 'status listening' : 'status';
}

// ========== Speech Synthesis ==========
function speak(text) {
    // Stop any ongoing speech before starting a new one
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;

    utter.onstart = () => {
        toggleWaveform(true);
        statusDisplay.textContent = 'Speaking...';
        statusDisplay.className = 'status talking';
        typingAssistant.value = text; // Display JARVIS's speech in the textarea
    };

    utter.onend = () => {
        toggleWaveform(false);
        statusDisplay.textContent = 'Idle';
        statusDisplay.className = 'status';
    };

    utter.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        statusDisplay.textContent = 'Speech Error';
        toggleWaveform(false);
    };

    window.speechSynthesis.speak(utter);
}

// ========== Speech Recognition ==========
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// Check for SpeechRecognition API support
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false; // Only listen for a single utterance

    btn.addEventListener('click', () => {
        recognition.start();
    });

    recognition.onstart = () => {
        toggleWaveform(true);
        transcriptDisplay.textContent = 'Listening...';
        statusDisplay.textContent = 'Listening...';
    };

    recognition.onerror = e => {
        console.error('Speech recognition error:', e.error);
        speak("Sorry, I didn't catch that. Please try again.");
        statusDisplay.textContent = 'Error: ' + e.error;
        toggleWaveform(false); // Ensure waveform stops on error
    };

    recognition.onresult = event => {
        const msg = event.results[0][0].transcript.toLowerCase();
        transcriptDisplay.textContent = msg;
        statusDisplay.textContent = 'Processing...';
        historyList.innerHTML += `<div>🗣️ ${msg}</div>`; // Add to history
        historyList.scrollTop = historyList.scrollHeight; // Scroll to bottom
        takeCommand(msg);
    };

    recognition.onend = () => {
        toggleWaveform(false);
        statusDisplay.textContent = 'Idle';
    };
} else {
    // Fallback if SpeechRecognition is not supported
    btn.textContent = "Speech Not Supported";
    btn.disabled = true;
    statusDisplay.textContent = "Speech Recognition not supported in this browser.";
    speak("Your browser does not support speech recognition. Please use a modern browser like Chrome or Edge.");
}

// ========== Command Memory (Conceptual) ==========
function rememberCommand(command) {
    rememberedCommands[command] = (rememberedCommands[command] || 0) + 1;
    localStorage.setItem('jarvis_remembered_commands', JSON.stringify(rememberedCommands));
}

// ========== Notes Functionality ==========
function addNote(noteText) {
    const timestamp = new Date().toLocaleString();
    notes.push({ text: noteText, timestamp: timestamp });
    localStorage.setItem('jarvis_notes', JSON.stringify(notes));
    displayNotes();
    speak(`Note added: ${noteText}`);
}

function displayNotes() {
    notesList.innerHTML = '';
    if (notes.length === 0) {
        notesList.innerHTML = '<div>No notes yet. Try saying "add note buy milk".</div>';
        return;
    }
    notes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.innerHTML = `📝 ${note.text} <br><small>(${note.timestamp})</small>`;
        notesList.appendChild(noteDiv);
    });
    notesList.scrollTop = notesList.scrollHeight; // Scroll to bottom
}

// ========== App Management Functionality ==========
function displayApps() {
    appList.innerHTML = ''; // Clear existing list
    if (userApps.length === 0) {
        appList.innerHTML = '<p style="text-align: center; color: #aaa;">No custom apps added yet. Try saying "add app Gmail https://mail.google.com".</p>';
    }

    userApps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.classList.add('app-item');
        appItem.innerHTML = `
            <div>
                <h4>${app.name}</h4>
                <p title="${app.url}">${app.url}</p>
            </div>
        `;
        const buttonContainer = document.createElement('div');

        const launchBtn = document.createElement('button');
        launchBtn.textContent = 'Launch';
        launchBtn.classList.add('app-launch-btn');
        launchBtn.onclick = () => launchApp(app.url); // Pass the URL directly
        buttonContainer.appendChild(launchBtn);

        // Add a "Remove" button only for user-added apps, not built-in ones
        if (!['youtube', 'Google Search'].includes(app.id)) {
             const removeBtn = document.createElement('button');
             removeBtn.textContent = 'Remove';
             removeBtn.classList.add('app-remove-btn');
             removeBtn.onclick = () => removeApp(app.id);
             buttonContainer.appendChild(removeBtn);
        }
        appItem.appendChild(buttonContainer);
        appList.appendChild(appItem);
    });
}

function addApp() {
    const name = newAppNameInput.value.trim();
    const url = newAppUrlInput.value.trim();

    // Simple URL validation
    if (name && url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const newApp = {
            id: name.toLowerCase().replace(/\s/g, '_'), // Simple ID generation
            name: name,
            url: url
        };
        userApps.push(newApp);
        localStorage.setItem('jarvis_user_apps', JSON.stringify(userApps));
        displayApps(); // Re-render the app list
        newAppNameInput.value = ''; // Clear inputs
        newAppUrlInput.value = '';
        speak(`${name} added to your apps.`);
    } else {
        speak("Please enter a valid app name and a valid URL starting with http or https.");
    }
}

function removeApp(appId) {
    if (['youtube', 'Google Search'].includes(appId)) {
        speak("You cannot remove built-in apps.");
        return;
    }
    userApps = userApps.filter(app => app.id !== appId); // Filter out the app to remove
    localStorage.setItem('jarvis_user_apps', JSON.stringify(userApps));
    displayApps(); // Re-render the app list
    speak("App removed.");
}

function launchApp(url) {
    if (url) {
        window.open(url, '_blank'); // Open URL in a new tab
        speak(`Opening ${url}.`);
        showPage('dashboardPage'); // Return to dashboard after launching
    } else {
        speak("Sorry, I don't have a valid URL for that app.");
    }
}

// Event listener for adding new app
addAppBtn.onclick = addApp;

// ========== Calendar Functionality ==========
function addCalendarEvent(eventText, eventDateStr) {
    const eventDate = new Date(eventDateStr); // Ensure date is valid
    if (isNaN(eventDate)) {
        speak("That's not a valid date for the event. Please try again.");
        return;
    }
    const timestamp = new Date().toLocaleString();
    calendarEvents.push({
        text: eventText,
        date: eventDate.toDateString(), // Store as readable date string for easy comparison
        timestampAdded: timestamp
    });
    // Sort events by date to keep them organized
    calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('jarvis_calendar_events', JSON.stringify(calendarEvents));
    displayEvents(eventDate); // Refresh events for the added date
    displayUpcomingEvents(); // Refresh upcoming events list
    speak(`Event "${eventText}" added for ${eventDate.toLocaleDateString()}.`);
}

function displayEvents(displayDate) {
    eventsList.innerHTML = ''; // Clear existing list
    const today = new Date();
    const isToday = displayDate.toDateString() === today.toDateString();

    currentCalendarDateSpan.textContent = displayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (isToday) {
        currentCalendarDateSpan.textContent += ' (Today)';
    }

    const eventsForDisplay = calendarEvents.filter(event =>
        new Date(event.date).toDateString() === displayDate.toDateString()
    );

    if (eventsForDisplay.length === 0) {
        eventsList.innerHTML = '<div>No events for this day.</div>';
        return;
    }

    eventsForDisplay.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `📅 ${event.text}`;
        eventsList.appendChild(eventDiv);
    });
    eventsList.scrollTop = eventsList.scrollHeight; // Scroll to bottom
}

function displayUpcomingEvents() {
    upcomingEventsList.innerHTML = '';
    const now = new Date();
    // Filter events that are today or in the future
    const futureEvents = calendarEvents.filter(event =>
        new Date(event.date) >= now || new Date(event.date).toDateString() === now.toDateString()
    ).slice(0, 5); // Show next 5 upcoming events

    if (futureEvents.length === 0) {
        upcomingEventsList.innerHTML = '<div>No upcoming events.</div>';
        return;
    }

    futureEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `📅 ${event.text} on ${new Date(event.date).toLocaleDateString()}`;
        upcomingEventsList.appendChild(eventDiv);
    });
}

// Event listener for adding new calendar event
addEventBtn.onclick = () => {
    const text = newEventTextInput.value.trim();
    const date = newEventDateInput.value; // This will be in YYYY-MM-DD format from input[type="date"]
    if (text && date) {
        addCalendarEvent(text, date);
        newEventTextInput.value = ''; // Clear input
        newEventDateInput.valueAsDate = new Date(); // Reset date to today
    } else {
        speak("Please enter both an event description and a date.");
    }
};

// ========== Main Command Processor ==========
async function takeCommand(msg) {
    typingAssistant.value = `Processing: "${msg}"...`;
    rememberCommand(msg); // Log the command

    // --- Core JARVIS Commands (Frontend Handled for Speed) ---
    if (msg.includes("my name is")) {
        const newName = msg.split("my name is")[1].trim();
        if (newName) {
            userName = newName.charAt(0).toUpperCase() + newName.slice(1);
            localStorage.setItem('jarvis_name', userName);
            userNameSpan.textContent = userName;
            speak(`Nice to meet you, ${userName}`);
        } else {
            speak("Please tell me your name after 'my name is'.");
        }
    } else if (msg.includes("what's your name") || msg.includes("who are you")) {
        speak("I am JARVIS, your personal AI assistant. I am currently running version 4.0.");
    } else if (msg.includes("time")) {
        const now = new Date().toLocaleTimeString();
        speak(`The time is ${now}`);
    } else if (msg.includes("date")) {
        const today = new Date().toLocaleDateString();
        speak(`Today's date is ${today}`);
    } else if (msg.includes("clear history")) {
        historyList.innerHTML = '';
        speak("Command history cleared.");
    } else if (msg.includes("clear notes")) {
        notes = [];
        localStorage.removeItem('jarvis_notes');
        displayNotes();
        speak("All notes cleared.");
    } else if (msg.includes("show my notes")) {
        if (notes.length > 0) {
            let notesText = "Your notes are: ";
            notes.forEach((note, index) => {
                notesText += `Note ${index + 1}: ${note.text}. Added on ${note.timestamp}. `;
            });
            speak(notesText);
        } else {
            speak("You don't have any notes yet.");
        }
    } else if (msg.includes("add note")) {
        const noteContent = msg.split("add note")[1].trim();
        if (noteContent) {
            addNote(noteContent);
        } else {
            speak("What would you like to add to your notes?");
        }
    } else if (msg.includes("weather")) {
        fetchWeather();
    } else if (msg.includes("stop listening") || msg.includes("stop jarvis")) {
        if (recognition && recognition.listening) {
            recognition.stop();
            speak("Listening stopped.");
        } else {
            speak("I'm not currently listening.");
        }
    }
    // --- Navigation Commands ---
    else if (msg.includes("go to apps") || msg.includes("open apps")) {
        speak("Opening apps page.");
        showPage('appsPage');
    } else if (msg.includes("go to calendar") || msg.includes("open calendar")) {
        speak("Opening calendar page.");
        showPage('calendarPage');
    } else if (msg.includes("go to settings") || msg.includes("open settings")) {
        speak("Opening settings page.");
        showPage('settingsPage');
    } else if (msg.includes("go to dashboard") || msg.includes("go home")) {
        speak("Returning to dashboard.");
        showPage('dashboardPage');
    }
    // --- App Launching Commands ---
    else if (msg.includes("launch") || msg.includes("open")) {
        const commandParts = msg.split(" ");
        let appToLaunch = null;

        // Try to find a direct app match
        for (const app of userApps) {
            if (msg.includes(app.name.toLowerCase())) {
                appToLaunch = app;
                break;
            }
        }
        
        if (appToLaunch) {
            launchApp(appToLaunch.url);
        } else {
            speak("Sorry, I couldn't find that app. Please make sure it's added in the Apps section.");
        }
    }
    // --- Calendar Commands ---
    else if (msg.includes("add event")) {
        // Example: "add event team meeting on tomorrow" or "add event doctor appointment on July 15th"
        const eventMatch = msg.match(/add event\s(.+?)\s(?:on|for)\s(.+)/);
        if (eventMatch && eventMatch.length >= 3) {
            const eventText = eventMatch[1].trim();
            let dateString = eventMatch[2].trim();
            
            // Simple date parsing for common phrases
            if (dateString.includes("tomorrow")) {
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateString = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (dateString.includes("today")) {
                dateString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            } else {
                // Attempt to convert more complex dates to YYYY-MM-DD for input[type="date"]
                try {
                    const parsedDate = new Date(dateString);
                    if (!isNaN(parsedDate)) {
                         dateString = parsedDate.toISOString().split('T')[0];
                    } else {
                        dateString = ''; // Invalid date
                    }
                } catch (e) {
                    dateString = ''; // Invalid date
                }
            }

            if (dateString) {
                addCalendarEvent(eventText, dateString);
            } else {
                speak("I couldn't understand the date. Please try saying 'add event meeting on tomorrow' or 'add event meeting on July 1st'.");
            }

        } else {
            speak("Please tell me what event to add and when, like 'add event team meeting on tomorrow'.");
        }
    } else if (msg.includes("show my events") || msg.includes("what are my events")) {
        speak("Opening calendar to show your events.");
        showPage('calendarPage');
    }
    // --- Youtube ---
    else if (msg.includes("search youtube for") || msg.includes("play song") || msg.includes("play video")) {
        let query = '';
        if (msg.includes("search youtube for")) {
            query = msg.split("search youtube for")[1].trim();
        } else if (msg.includes("play song")) {
            query = msg.split("play song")[1].trim();
        } else if (msg.includes("play video")) {
            query = msg.split("play video")[1].trim();
        }

        if (query) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
            speak(`Searching YouTube for ${query}.`);
            showPage('dashboardPage'); // Go back to dashboard
        } else {
            speak("What would you like to search for on YouTube?");
        }
    }
    // --- Backend Commands / AI Fallback ---
    else {
        try {
            // Send command to Node.js backend
            const response = await fetch('http://127.0.0.1:5000/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: msg }),
            });
            const data = await response.json();
            speak(data.response);

            // If the backend indicates a web search is needed
            if (data.action === 'web_search' && data.query) {
                 window.open(`https://www.google.com/search?q=${encodeURIComponent(data.query)}`, "_blank");
                 speak(`Searching Google for ${data.query}.`);
            }

        } catch (error) {
            console.error('Error sending command to backend:', error);
            speak("I'm sorry, I couldn't reach my server. Please ensure the backend is running. If you want me to search the web, please say 'search for' followed by your query.");
        }
    }
}

// ========== Weather API (Open-Meteo) ==========
function fetchWeather() {
    weatherInfo.textContent = 'Fetching weather...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok.');
                    return res.json();
                })
                .then(data => {
                    const temp = data.current_weather.temperature;
                    const weatherCode = data.current_weather.weathercode;
                    let weatherDescription = "unknown conditions";
                    // Basic mapping for weather codes (Open-Meteo WMO Codes)
                    if (weatherCode === 0) weatherDescription = "clear sky";
                    else if (weatherCode >= 1 && weatherCode <= 3) weatherDescription = "partly cloudy";
                    else if (weatherCode >= 45 && weatherCode <= 48) weatherDescription = "foggy";
                    else if (weatherCode >= 51 && weatherCode <= 55) weatherDescription = "drizzling rain";
                    else if (weatherCode >= 56 && weatherCode <= 57) weatherDescription = "freezing drizzle";
                    else if (weatherCode >= 61 && weatherCode <= 65) weatherDescription = "raining";
                    else if (weatherCode >= 66 && weatherCode <= 67) weatherDescription = "freezing rain";
                    else if (weatherCode >= 71 && weatherCode <= 75) weatherDescription = "snowfall";
                    else if (weatherCode >= 77 && weatherCode <= 77) weatherDescription = "snow grains";
                    else if (weatherCode >= 80 && weatherCode <= 82) weatherDescription = "rain showers";
                    else if (weatherCode >= 85 && weatherCode <= 86) weatherDescription = "snow showers";
                    else if (weatherCode >= 95 && weatherCode <= 96) weatherDescription = "thunderstorms";
                    else if (weatherCode === 99) weatherDescription = "thunderstorm with hail";


                    const info = `It's ${temp}°C and ${weatherDescription} at your location.`;
                    weatherInfo.textContent = info;
                    speak(info);
                }).catch(error => {
                    console.error('Weather fetch error:', error);
                    weatherInfo.textContent = 'Unable to fetch weather.';
                    speak("I couldn't get the weather information.");
                });
        }, (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
                speak("Location access is denied. Please enable location services for weather updates.");
                weatherInfo.textContent = "Location access denied.";
            } else {
                speak("I couldn't get your location for weather updates.");
                weatherInfo.textContent = "Location error.";
            }
        });
    } else {
        speak("Geolocation is not supported by your browser for weather updates.");
        weatherInfo.textContent = "Geolocation not supported.";
    }
}

// ========== Initialization on Window Load ==========
window.onload = () => {
    greetUser();
    fetchWeather();
    displayNotes(); // Display notes on load
    displayApps(); // Display apps on load
    displayEvents(new Date()); // Display today's events on load
    displayUpcomingEvents(); // Display upcoming events on load
    showPage('dashboardPage'); // Ensure dashboard is shown initially
};