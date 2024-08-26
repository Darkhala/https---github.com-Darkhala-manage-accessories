// Your web app's Firebase configuration
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
// Function to handle form submission
document.getElementById("sendRequestButton").addEventListener("click", function() {
    // Retrieve the employee's name and requested accessory
    const employeeName = document.getElementById("employeeName").value;
    const accessoryRequest = document.getElementById("accessoryRequest").value;

    // Ensure both fields are filled
    if (employeeName.trim() === "" || accessoryRequest.trim() === "") {
        alert("Please fill in all fields");
        return;
    }

    // Save the request to the Firebase database
    database.ref('requested_accessories').push().set({
        employeeName: employeeName,
        accessoryRequest: accessoryRequest
    }, function(error) {
        if (error) {
            console.error("Error saving request:", error);
            alert("Failed to save request. Please try again.");
        } else {
            console.log("Request saved successfully");
            // Display confirmation message
            alert("Request sent to HR");
            // Optionally, you can clear the form fields here
            document.getElementById("employeeName").value = "";
            document.getElementById("accessoryRequest").value = "";
        }
    });
});

