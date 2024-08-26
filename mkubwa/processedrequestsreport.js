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

// Function to fetch and display processed requests
function fetchAndDisplayProcessedRequests() {
    const processedRequestsList = document.getElementById("processedRequests");

    // Clear existing content
    processedRequestsList.innerHTML = "";

    // Retrieve processed requests from Firebase
    database.ref('processed_requests').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const request = childSnapshot.val();
            const requestId = childSnapshot.key;

            // Create list item element
            const listItem = document.createElement("li");
            listItem.textContent = `Request ID: ${requestId} ||| Employee: ${request.employeeName} ||| Accessory: ${request.accessoryRequest} ||| Date: ${request.processedDate}`;

            // Append list item to the processed requests list
            processedRequestsList.appendChild(listItem);
        });
    });
}

// Function to filter processed requests by date
function filterByDate() {
    const filterDateInput = document.getElementById("filterDate");
    const selectedDate = filterDateInput.value;

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    const formattedDate = selectedDate; // Assuming selectedDate is already in "YYYY-MM-DD" format
    const processedRequestsList = document.getElementById("processedRequests");
    processedRequestsList.innerHTML = ""; // Clear existing content

    // Retrieve processed requests filtered by date from Firebase
    const processedRequestsRef = database.ref('processed_requests');

    processedRequestsRef.orderByChild('processedDate').equalTo(formattedDate).once('value', function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
                const requestId = childSnapshot.key;
                const request = childSnapshot.val();

                // Create list item element
                const listItem = document.createElement("li");
                listItem.textContent = `Request ID: ${requestId} ||| Employee: ${request.employeeName} ||| Accessory: ${request.accessoryRequest} ||| Date: ${request.processedDate}`;

                // Append list item to the processed requests list
                processedRequestsList.appendChild(listItem);
            });
        } else {
            alert("No processed requests found for the selected date.");
        }
    });
}

// Function to generate and display a preview of weekly processed requests
function viewWeeklyReport() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Calculate start date (7 days ago)
    
    const endDate = new Date(); // Today's date
    
    const processedRequestsList = document.getElementById("processedRequests");

    // Clear existing content
    processedRequestsList.innerHTML = "";

    // Retrieve processed requests filtered by date range from Firebase
    const processedRequestsRef = database.ref('processed_requests');

    processedRequestsRef.orderByChild('processedDate').startAt(formatDate(startDate)).endAt(formatDate(endDate)).once('value', function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(function(childSnapshot) {
                const requestId = childSnapshot.key;
                const request = childSnapshot.val();

                // Create list item element
                const listItem = document.createElement("li");
                listItem.textContent = `Request ID: ${requestId} ||| Employee: ${request.employeeName} ||| Accessory: ${request.accessoryRequest} ||| Date: ${request.processedDate}`;

                // Append list item to the processed requests list
                processedRequestsList.appendChild(listItem);
            });
        } else {
            alert("No processed requests found for the past week.");
        }
    });
}

function generateWeeklyReport() {
    viewWeeklyReport(); // Display preview of weekly data before generating PDF
    setTimeout(() => {
        const processedRequestsList = Array.from(document.querySelectorAll("#processedRequests li")).map(li => li.textContent);
        
        generatePDF(processedRequestsList);
    }, 1000); // Wait for the data to be displayed (adjust delay as needed)
}

function generatePDF(processedRequestsList) {
    const doc = new jsPDF();
    doc.text("Weekly Processed Requests Report", 20, 10);

    let y = 30;
    processedRequestsList.forEach((text, index) => {
        doc.text(text, 20, y);
        y += 10;
    });

    // Save the PDF file
    doc.save("weekly_report.pdf");
}

// Function to format date as "YYYY-MM-DD"
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Event listener to populate processed requests when the page loads
window.addEventListener('load', function() {
    fetchAndDisplayProcessedRequests();
});