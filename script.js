const hostBtn = document.getElementById("hostBtn");
const modal = document.getElementById("eventModal");
const closeBtn = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const database = firebase.database().ref();

// Create a container for events if not present
let eventList = document.getElementById("eventList");
if (!eventList) {
	eventList = document.createElement("div");
	eventList.id = "eventList";
	eventList.className = "events-container";
	eventList.style.marginTop = "2rem";
	document.querySelector("main.container")?.appendChild(eventList);
}

//open modal when hostBtn is clicked
hostBtn.addEventListener('click', ()=>{
	modal.style.display = "flex";
});
//close modal when closeBtn is clicked
closeBtn.addEventListener('click', ()=>{
	modal.style.display = "none";
});
// Close if clicked outside modal
window.addEventListener("click", (e) => {
	if (e.target === modal) {
		modal.style.display = "none";
	}
});

// Save event to Firebase and update UI
function updateDB(e) 
{
	e.preventDefault();
	const title = document.getElementById("eventTitle").value.trim();
	const description = document.getElementById("eventDescription").value.trim();
	const city = document.getElementById("eventCity").value.trim();
	const state = document.getElementById("eventState").value.trim();
	const dateTime = document.getElementById("eventDateTime").value;
	const category = document.getElementById("eventCategory").value;

	if (!title || !city || !state || !dateTime || !category) {
		alert("Please fill in all required fields.");
		return;
	}

	const eventData = {
		title,
		description,
		city,
		state,
		dateTime,
		category
	};

	// Save to Firebase
	database.child("events").push(eventData, function(error) {
		if (error) {
			alert("Error saving event. Please try again.");
		} else {
			modal.style.display = "none";
			eventForm.reset();
		}
	});
}

// Listen for form submission
eventForm.addEventListener("submit", updateDB);

// Store all events locally for filtering
let allEvents = [];

function getCategoryColor(category) {
	const colors = {
		"anime": "#ffcc00",
        "games": "#ff5733",
        "fitness": "#33cc33",
        "music": "#466d94ff",
        "art": "#ff66b3",
        "food": "#ff9966",
        "sports": "#66ccff",
        "tech": "#267526ff",
        "movies": "#4e182aff",
        "books": "#634174ff",
        "social": "#69552cff",
        "other": "#5b5c9bff"
	};
	return colors[category] || "#7b68ee";
}

function renderEvent(key, data) {
    const eventDiv = document.createElement("div");
    eventDiv.className = "event-card";
    eventDiv.innerHTML = `
        <div class="event-image" style="background-color: ${getCategoryColor(data.category)}; font-family: 'Montserrat', 'Roboto', Arial, sans-serif;">
            <span class="event-title-label" style="font-family: 'Montserrat', 'Roboto', Arial, sans-serif;">${data.title}</span>
        </div>
        <div class="event-details" style="font-family: 'Roboto', Arial, sans-serif;">
            <div class="event-meta" style="font-family: 'Roboto', Arial, sans-serif;">
                <span>${data.city}, ${data.state}</span>
                <span>${new Date(data.dateTime).toLocaleString()}</span>
            </div>
            <p class="event-description" style="font-family: 'Roboto', Arial, sans-serif;">${data.description ? data.description : "No description provided."}</p>
            <p class="event-category" style="font-family: 'Montserrat', 'Roboto', Arial, sans-serif;"><strong>Category:</strong> ${data.category}</p>
            <button class="signup-btn" style="font-family: 'Montserrat', 'Roboto', Arial, sans-serif;">Sign Up</button>
        </div>
    `;
    // Add click event to the signup button
    const signupBtn = eventDiv.querySelector('.signup-btn');
    signupBtn.addEventListener('click', function() {
        openRsvpModal();
    });
    eventList.appendChild(eventDiv);
}

// Helper to clear and render a list of events
function renderEventsList(events) {
    eventList.innerHTML = "";
    if (events.length === 0) {
        // Show message if no events found
        const msgDiv = document.createElement("div");
        msgDiv.className = "no-events-msg";
        msgDiv.style.textAlign = "center";
        msgDiv.style.fontFamily = "Montserrat, Roboto, Arial, sans-serif";
        msgDiv.style.fontSize = "1.2rem";
        msgDiv.style.margin = "2rem auto";
        msgDiv.innerHTML = `<p>No events found for your search.<br><strong>Host the first one now!</strong></p>`;
        eventList.appendChild(msgDiv);
        return;
    }
    events.forEach(ev => renderEvent(ev.key, ev.data));
}

// Listen for new events in Firebase and store them
allEvents = [];
database.child("events").on("child_added", function(snapshot) {
    allEvents.push({ key: snapshot.key, data: snapshot.val() });
    renderEventsList(allEvents);
});

// Search bar functionality
const searchBtn = document.querySelector('.search-btn');
const cityInput = document.querySelector('.city-input');
const stateInput = document.querySelector('.state-input');

searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim().toLowerCase();
    const state = stateInput.value.trim().toLowerCase();
    if (!city && !state) {
        // Show all events if nothing entered
        renderEventsList(allEvents);
        return;
    }
    // Filter events by city and/or state
    const filtered = allEvents.filter(ev => {
        const evCity = (ev.data.city || "").trim().toLowerCase();
        const evState = (ev.data.state || "").trim().toLowerCase();
        if (city && state) {
            return evCity === city && evState === state;
        } else if (city) {
            return evCity === city;
        } else if (state) {
            return evState === state;
        }
        return true;
    });
    renderEventsList(filtered);
});

// Optional: allow Enter key to trigger search
cityInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchBtn.click();
});
stateInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchBtn.click();
});

// RSVP Modal
let rsvpModal = document.getElementById('rsvpModal');
if (!rsvpModal) {
    rsvpModal = document.createElement('div');
    rsvpModal.id = 'rsvpModal';
    rsvpModal.className = 'modal rsvp-modal';
    rsvpModal.innerHTML = `
        <div class="modal-content rsvp-modal-content">
            <span class="close-btn" id="closeRsvpModal">&times;</span>
            <h2>RSVP for Event</h2>
            <form id="rsvpForm">
                <input type="text" id="rsvpName" placeholder="Your Name" required>
                <input type="email" id="rsvpEmail" placeholder="Your Email" required>
                <input type="text" id="rsvpPhone" placeholder="Phone Number">
                <textarea id="rsvpNote" placeholder="Note (optional)"></textarea>
                <button type="submit">Submit RSVP</button>
            </form>
        </div>
    `;
    document.body.appendChild(rsvpModal);
}

const closeRsvpModal = rsvpModal.querySelector('#closeRsvpModal');
closeRsvpModal.addEventListener('click', () => {
    rsvpModal.style.display = 'none';
    document.body.classList.remove('blur-bg');
});
window.addEventListener('click', (e) => {
    if (e.target === rsvpModal) {
        rsvpModal.style.display = 'none';
        document.body.classList.remove('blur-bg');
    }
});

function openRsvpModal() {
    rsvpModal.style.display = 'flex';
    document.body.classList.add('blur-bg');
}

// RSVP form submission
const rsvpForm = rsvpModal.querySelector('#rsvpForm');
rsvpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('RSVP submitted!');
    rsvpModal.style.display = 'none';
    document.body.classList.remove('blur-bg');
    rsvpForm.reset();
});





