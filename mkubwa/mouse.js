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

        // Call the function to fetch initial mouse counts during DOMContentLoaded event
        document.addEventListener('DOMContentLoaded', () => {
            fetchInitialMouseCounts();
        });

        // Function to fetch initial mouse counts from the database and update HTML
        function fetchInitialMouseCounts() {
            console.log("Fetching initial mouse counts");
            const mouseRef = database.ref('mouse');
            mouseRef.once('value', snapshot => {
                console.log("Data fetched successfully");
                // Fetch each mouse count individually
                const mouse1Count = snapshot.child('Dell wired mouse/count').val() || 0;
                const mouse2Count = snapshot.child('Dell wireless mouse/count').val() || 0;
                const mouse3Count = snapshot.child('HP wireless mouse/count').val() || 0;
                const mouse4Count = snapshot.child('HP wired mouse/count').val() || 0;

                // Update HTML with fetched counts
                document.getElementById('mouse1Count').innerText = mouse1Count;
                document.getElementById('mouse2Count').innerText = mouse2Count;
                document.getElementById('mouse3Count').innerText = mouse3Count;
                document.getElementById('mouse4Count').innerText = mouse4Count;
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

// Function to select a mouse
function selectMouse(mouseNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`mouse${mouseNumber}Count`);
            const count = parseInt(countSpan.innerText);

            if (count > 0) {
                const mouseImg = document.getElementById(`mouse${mouseNumber}`).getElementsByTagName('img')[0];
                const mouseName = mouseImg ? mouseImg.alt : '';

                if (mouseName) {
                    updateDatabase(username, mouseName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            alert("Mouse selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid mouse name.");
                }
            } else {
                alert("Accessory Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a mouse
function returnMouse(mouseNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`mouse${mouseNumber}Count`);
            const count = parseInt(countSpan.innerText);
            const mouseImg = document.getElementById(`mouse${mouseNumber}`).getElementsByTagName('img')[0];
            const mouseName = mouseImg ? mouseImg.alt : '';

            if (mouseName) {
                updateDatabase(username, mouseName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        alert("Mouse returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid mouse name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to update the database
async function updateDatabase(username, mouseName, change) {
    const selectedRef = database.ref(`selectedmouse/${username}`);
    const returnedRef = database.ref(`returnedmouse/${username}`);

    const currentDate = new Date().toLocaleString(); // Get current date and time

    const item = {
        mouseName: mouseName,
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
    const countSnapshot = await database.ref(`mouse/${mouseName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`mouse/${mouseName}`).update({ count: updatedCount });

    return updatedCount;
}

        // Function to update all values on the page to the database
        function updatePageToDatabase() {
            const mice = document.querySelectorAll('.mouse');
            
            mice.forEach(mouse => {
                const mouseId = mouse.id;
                const countSpan = mouse.querySelector('span');
                const count = parseInt(countSpan.innerText);

                // Get mouse name
                const mouseImg = mouse.querySelector('img');
                const mouseName = mouseImg ? mouseImg.alt : '';

                // Update the database with the new count
                updateDatabaseCount(mouseName, count);
            });

            alert("Page updated successfully!");
        }

        // Function to update the database count for a specific mouse
        async function updateDatabaseCount(mouseName, count) {
            try {
                await database.ref(`mouse/${mouseName}`).update({ count: count });
            } catch (error) {
                console.error("Error updating count in database:", error);
            }
        }


