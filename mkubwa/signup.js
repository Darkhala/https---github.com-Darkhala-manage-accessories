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


// Function to validate email format and check if it's not a disposable email and if it exists
async function validateEmail(email, callback) {
    const re = /\S+@\S+\.\S+/;
    const disposableEmailDomains = [
        'example.com',
        'example.org'
        // Add more disposable email domains to this list
    ];

    if (!re.test(email)) {
        callback(false); // Invalid email format
        return;
    }

    const domain = email.split('@')[1];
    if (disposableEmailDomains.includes(domain)) {
        callback(false); // Disposable email
        return;
    }

    // Check if the email already exists in the database
    const snapshot = await database.ref('usercredentials').orderByChild('email').equalTo(email).once('value');
    if (snapshot.exists()) {
        callback(false); // Email already exists
        return;
    }

    callback(true); // Email is valid and available
}

// Function to validate password strength
function validatePassword(password) {
    // Regular expressions for password criteria
    const lengthRegex = /.{8,}/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    
    // Check if password meets all criteria
    return (
        lengthRegex.test(password) &&
        uppercaseRegex.test(password) &&
        lowercaseRegex.test(password) &&
        specialCharRegex.test(password)
    );
}

// Function to handle form submission
document.querySelector('.signup-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Fetch user input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const fullname = document.getElementById('fullname').value;

    // Validate email format and availability
    validateEmail(email, async function(isValidEmail) {
        if (!isValidEmail) {
            document.getElementById('error-message').innerText = 'Please use a valid and available email';
            alert("Please use a valid and available email");
            return;
        }

        // Validate password strength
        if (!validatePassword(password)) {
            document.getElementById('error-message').innerText = 'Password must be at least 8 characters and must contain at least one uppercase, lowercase, number, and special symbol';
            return;
        }

        // Clear error message if any
        document.getElementById('error-message').innerText = '';

        // Save user data to Firebase
        try {
            await database.ref('usercredentials').push().set({
                username: username,
                password: password,
                email: email,
                fullname: fullname
            });
            document.getElementById('success-message').innerText = 'User signed up successfully';
            window.location.href = "beginpage.html"; // Redirect to the success page
        } catch (error) {
            document.getElementById('error-message').innerText = 'Error saving data: ' + error.message;
        }
    });
});