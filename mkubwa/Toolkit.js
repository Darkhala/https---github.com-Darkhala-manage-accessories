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

 // Call the function to fetch initial toolkit counts during DOMContentLoaded event
 document.addEventListener('DOMContentLoaded', () => {
    fetchInitialToolkitCounts();
});

// Function to fetch initial toolkit counts from the database and update HTML
function fetchInitialToolkitCounts() {
    console.log("Fetching initial toolkit counts");
    const toolkitsRef = database.ref('toolkits');

    toolkitsRef.once('value', snapshot => {
        console.log("Data fetched successfully");

        // Fetch each toolkit count individually
        const toolkit1Count = snapshot.child('hi_spec/count').val() || 0;
        const toolkit2Count = snapshot.child('ifixit/count').val() || 0;
        const toolkit3Count = snapshot.child('Kalaidun_33/count').val() || 0;
        const toolkit4Count = snapshot.child('Kalaidun_82/count').val() || 0;
        const toolkit5Count = snapshot.child('Oria_Precision/count').val() || 0;
        const toolkit6Count = snapshot.child('Rosewill_RTK/count').val() || 0;
        const toolkit7Count = snapshot.child('Wirehard/count').val() || 0;

        // Update HTML with fetched counts
        document.getElementById('toolkit1Count').innerText = toolkit1Count;
        document.getElementById('toolkit2Count').innerText = toolkit2Count;
        document.getElementById('toolkit3Count').innerText = toolkit3Count;
        document.getElementById('toolkit4Count').innerText = toolkit4Count;
        document.getElementById('toolkit5Count').innerText = toolkit5Count;
        document.getElementById('toolkit6Count').innerText = toolkit6Count;
        document.getElementById('toolkit7Count').innerText = toolkit7Count;
    });
}

// Function to select a toolkit
function selectToolkit(toolkitNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`toolkit${toolkitNumber}Count`);
            let count = parseInt(countSpan.innerText);

            if (count > 0) {
                const toolkitNameElement = document.getElementById(`toolkit${toolkitNumber}`).getElementsByClassName('toolkit-name')[0];
                const toolkitName = toolkitNameElement ? toolkitNameElement.innerText : '';

                if (toolkitName) {
                    updateDatabase(username, toolkitName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            alert("Toolkit selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid toolkit name.");
                }
            } else {
                alert("Toolkit Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a toolkit
function returnToolkit(toolkitNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`toolkit${toolkitNumber}Count`);
            let count = parseInt(countSpan.innerText);
            const toolkitNameElement = document.getElementById(`toolkit${toolkitNumber}`).getElementsByClassName('toolkit-name')[0];
            const toolkitName = toolkitNameElement ? toolkitNameElement.innerText : '';

            if (toolkitName) {
                updateDatabase(username, toolkitName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        alert("Toolkit returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid toolkit name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to check if the username exists in the database
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

// Function to update the database
async function updateDatabase(username, toolkitName, change) {
    const selectedRef = database.ref(`selectedtoolkits/${username}`);
    const returnedRef = database.ref(`returnedtoolkits/${username}`);

    const currentDate = new Date().toLocaleString(); // Get current date and time

    const item = {
        toolkitName: toolkitName,
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
    const countSnapshot = await database.ref(`toolkits/${toolkitName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`toolkits/${toolkitName}`).update({ count: updatedCount });

    return updatedCount;
}
// Function to update all values on the page to the database
function updatePageToDatabase() {
    const toolkits = document.querySelectorAll('.toolkit');
    
    toolkits.forEach(toolkit => {
        const toolkitId = toolkit.id;
        const countSpan = toolkit.querySelector('span');
        const count = parseInt(countSpan.innerText);

        // Get toolkit name
        const toolkitImg = toolkit.querySelector('img');
        const toolkitName = toolkitImg ? toolkitImg.alt : '';

        // Update the database with the new count
        updateDatabaseCount(toolkitName, count);
    });

    alert("Page updated successfully!");
}

// Function to update the database count for a specific toolkit
async function updateDatabaseCount(toolkitName, count) {
    try {
        await database.ref(`toolkits/${toolkitName}`).update({ count: count });
    } catch (error) {
        console.error("Error updating count in database:", error);
    }
}
