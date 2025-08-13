
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

// Render events to the page
function getCategoryColor(category) {
	const colors = {
		"anime": "#ffcc00",
		"games": "#ff5733",
		"fitness": "#33cc33",
		"gaming": "#3399ff",
		"other": "#d633ff"
	};
	return colors[category] || "#7b68ee";
}

function renderEvent(key, data) {
	const eventDiv = document.createElement("div");
	eventDiv.className = "event-card";
	eventDiv.innerHTML = `
		<div class="event-image" style="background-color: ${getCategoryColor(data.category)};">
			<span class="event-title-label">${data.title}</span>
		</div>
		<div class="event-details">
			<div class="event-meta">
				<span>${data.city}, ${data.state}</span>
				<span>${new Date(data.dateTime).toLocaleString()}</span>
			</div>
			<p class="event-description">${data.description ? data.description : "No description provided."}</p>
			<p class="event-category"><strong>Category:</strong> ${data.category}</p>
			<button class="signup-btn">Sign Up</button>
		</div>
	`;
	// Add click event to the signup button
	const signupBtn = eventDiv.querySelector('.signup-btn');
	signupBtn.addEventListener('click', function() {
		alert('Signed up!');
	});
	eventList.appendChild(eventDiv);
}

// Listen for new events in Firebase and display them
database.child("events").on("child_added", function(snapshot) {
	renderEvent(snapshot.key, snapshot.val());
});

eventsContainer.innerHTML = eventsContainer.map(event =>`
    div class = "event-card" style="background-color: ${getCategoryColor(event.category)};">
        <h3 class = "event-title>${event.title}</h3>
        <div class = "event-meta">
            <span>${event.location}</span>
            <span>${event.dateTime}</span>
        </div>
        <p class = "event-description">${event.description || "No description provided."}</p>
        
    `).join(``)
function getCategoryColor(category) 
{
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
    }
    return colors[category] || colors.default;
}


                    
                    

