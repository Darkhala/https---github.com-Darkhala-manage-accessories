const firebaseConfig = {
    apiKey: "AIzaSyBG8xJwFMHzGJgs8w5KEQadHyM2xmFOkV4",
    authDomain: "accessoriesdatabase.firebaseapp.com",
    databaseURL: "https://accessoriesdatabase-default-rtdb.firebaseio.com",
    projectId: "accessoriesdatabase",
    storageBucket: "accessoriesdatabase.appspot.com",
    messagingSenderId: "170193407542",
    appId: "1:170193407542:web:a2bc0ee740c0e641a3d297"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();
// Function to fetch accessory requests and populate the HR page
function populateAccessoryRequests() {
    const accessoryRequestsList = document.getElementById("accessoryRequests");

    // Clear existing content
    accessoryRequestsList.innerHTML = "";

    // Retrieve accessory requests from Firebase
    database.ref('requested_accessories').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const request = childSnapshot.val();
            const requestId = childSnapshot.key; // Retrieve the request ID

            // Create list item element
            const listItem = document.createElement("li");
            listItem.textContent = `Request ID: ${requestId}||| Employee: ${request.employeeName}||| Accessory: ${request.accessoryRequest}`;

            // Append list item to the accessory requests list
            accessoryRequestsList.appendChild(listItem);
        });
    });
}

// Populate accessory requests when the page loads
window.addEventListener('load', function() {
    populateAccessoryRequests();
});

// Function to handle processing accessory requests
document.getElementById("processRequestButton").addEventListener("click", function() {
    const requestId = document.getElementById("requestId").value;

    if (requestId.trim() === "") {
        alert("Please enter the request ID");
        return;
    }

// Retrieve the request details from the database
database.ref('requested_accessories').child(requestId).once('value', function(snapshot) {
    const requestDetails = snapshot.val();

    if (requestDetails) {
        // Get the current date
        const currentDate = new Date();
        
        // Format the date to yyyy-mm-dd
        const formattedDate = currentDate.toISOString().slice(0, 10); // Extract yyyy-mm-dd from ISO format
        
        // Add the formatted date to the request details
        requestDetails.processedDate = formattedDate;

        // Save the request details to the "processed_requests" table
        database.ref('processed_requests').child(requestId).set(requestDetails)
        .then(function() {
            // Remove the request from the "requested_accessories" table
            return database.ref('requested_accessories').child(requestId).remove();
        })
        .then(function() {
            // Repopulate accessory requests list after processing
            populateAccessoryRequests();
            alert("Request processed and moved to processed requests");
        })
        .catch(function(error) {
            console.error("Error processing request:", error);
            alert("Failed to process request. Please try again.");
        });
    } else {
        alert("Request with ID " + requestId + " does not exist");
    }
});

});