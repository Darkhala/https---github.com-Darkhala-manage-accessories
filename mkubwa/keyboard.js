// Initialize Firebase
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

document.addEventListener('DOMContentLoaded', () => {
    fetchInitialKeyboardCounts();
});

// Function to fetch initial keyboard counts from the database and update HTML
function fetchInitialKeyboardCounts() {
    console.log("Fetching initial keyboard counts");
    const keyboardsRef = database.ref('keyboards');
    keyboardsRef.once('value', snapshot => {
        console.log("Data fetched successfully");
        // Fetch each keyboard count individually
        const keyboard1Count = snapshot.child('hp Qwerty/count').val() || 0;
        const keyboard2Count = snapshot.child('Dell Keyboard/count').val() || 0;
        const keyboard3Count = snapshot.child('Lenovo Keyboard/count').val() || 0;

        // Update HTML with fetched counts
        document.getElementById('keyboard1Count').innerText = keyboard1Count;
        document.getElementById('keyboard2Count').innerText = keyboard2Count;
        document.getElementById('keyboard3Count').innerText = keyboard3Count;
    });
}
// Check if the username exists in the database
function checkUsername(username) {
    return new Promise((resolve, reject) => {
        const userRef = database.ref('usercredentials');
        userRef.orderByChild('username').equalTo(username).once('value', snapshot => {
            if (snapshot.exists()) {
                resolve(true); // Username exists
            } else {
                reject("Username does not exist"); // Username does not exist
            }
        });
    });
}

// Function to select a keyboard
function selectKeyboard(keyboardNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`keyboard${keyboardNumber}Count`);
            const count = parseInt(countSpan.innerText);

            if (count > 0) {
                const itemNameElement = document.getElementById(`keyboard${keyboardNumber}`).getElementsByClassName('keyboard-name')[0];
                const itemName = itemNameElement ? itemNameElement.innerText : '';

                if (itemName) {
                    updateDatabase(username, itemName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            alert("Keyboard selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid keyboard name.");
                }
            } else {
                alert("Accessory Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a keyboard
function returnKeyboard(keyboardNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`keyboard${keyboardNumber}Count`);
            const count = parseInt(countSpan.innerText);
            const itemNameElement = document.getElementById(`keyboard${keyboardNumber}`).getElementsByClassName('keyboard-name')[0];
            const itemName = itemNameElement ? itemNameElement.innerText : '';

            if (itemName) {
                updateDatabase(username, itemName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        alert("Keyboard returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid keyboard name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to update the database
async function updateDatabase(username, itemName, change) {
    const selectedRef = database.ref(`selectedkeyboards/${username}`);
    const returnedRef = database.ref(`returnedkeyboards/${username}`);

    const currentDate = new Date().toLocaleString(); // Get current date and time

    const item = {
        itemName: itemName,
        change: change,
        date: currentDate
    };

    // Push the item to the appropriate reference
    if (change < 0) {
        await selectedRef.push(item);
    } else {
        await returnedRef.push(item);
    }

    // Fetch updated count from database
    const countSnapshot = await database.ref(`keyboards/${itemName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`keyboards/${itemName}`).update({ count: updatedCount });

    return updatedCount;
}

// Call the function to fetch initial keyboard counts during DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    fetchInitialKeyboardCounts();
});



// Function to update all values on the page to the database
function updatePageToDatabase() {
    const keyboards = document.querySelectorAll('.keyboard');
    
    keyboards.forEach(keyboard => {
        const keyboardId = keyboard.id;
        const countSpan = keyboard.querySelector('span');
        const count = parseInt(countSpan.innerText);

        // Get keyboard name
        const itemNameElement = keyboard.getElementsByClassName('keyboard-name')[0];
        const itemName = itemNameElement ? itemNameElement.innerText : '';

        // Update the database with the new count
        updateDatabaseCount(itemName, count);
    });

    alert("Page updated successfully!");
}

// Function to update the database count for a specific keyboard
async function updateDatabaseCount(itemName, count) {
    try {
        await database.ref(`keyboards/${itemName}`).update({ count: count });
    } catch (error) {
        console.error("Error updating count in database:", error);
    }
}
