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

// Function to handle login
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Retrieve user credentials from Firebase
    database.ref('usercredentials').once('value', function(snapshot) {
        let userFound = false;

        snapshot.forEach(function(childSnapshot) {
            const user = childSnapshot.val();
            if (user.username === username && user.password === password) {
                // Redirect the user based on their role or any other condition
                window.location.href = "accessories.html";
                userFound = true;
                return; // Exit the loop once user is found
            }
        });

        // If user not found, display error message
        if (!userFound) {
            const errorElement = document.getElementById("error-message");
            errorElement.innerText = "Incorrect username or password";
            alert("Incorrect username or password"); // Optional: Display alert
        }
    });
}

