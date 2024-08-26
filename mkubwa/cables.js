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

// Call the function to fetch initial cable counts during DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    fetchInitialCableCounts();
});

// Function to fetch initial cable counts from the database and update HTML
function fetchInitialCableCounts() {
    console.log("Fetching initial cable counts");
    const cablesRef = database.ref('cables');
    cablesRef.once('value', snapshot => {
        console.log("Data fetched successfully");
        // Fetch each cable count individually
        const cable1Count = snapshot.child('Monitor power cable/count').val() || 0;
        const cable2Count = snapshot.child('Laptop power cable/count').val() || 0;
        const cable3Count = snapshot.child('HDMI to HDMI cable/count').val() || 0;
        const cable4Count = snapshot.child('VGA cable/count').val() || 0;
        const cable5Count = snapshot.child('HDMI to VGA cable/count').val() || 0;
        const cable6Count = snapshot.child('USB printer cable/count').val() || 0;
        const cable7Count = snapshot.child('2-pin power cable/count').val() || 0;
        const cable8Count = snapshot.child('Ethernet cable/count').val() || 0;

        // Update HTML with fetched counts
        document.getElementById('cable1Count').innerText = cable1Count;
        document.getElementById('cable2Count').innerText = cable2Count;
        document.getElementById('cable3Count').innerText = cable3Count;
        document.getElementById('cable4Count').innerText = cable4Count;
        document.getElementById('cable5Count').innerText = cable5Count;
        document.getElementById('cable6Count').innerText = cable6Count;
        document.getElementById('cable7Count').innerText = cable7Count;
        document.getElementById('cable8Count').innerText = cable8Count;
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

// Function to select a cable
function selectCable(cableNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`cable${cableNumber}Count`);
            let count = parseInt(countSpan.innerText);

            if (count > 0) {
                const cableImg = document.getElementById(`cable${cableNumber}`).getElementsByTagName('img')[0];
                const cableName = cableImg ? cableImg.alt : '';

                if (cableName) {
                    updateDatabase(username, cableName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            count = updatedCount; // Update count variable
                            alert("Cable selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid cable name.");
                }
            } else {
                alert("Accessory Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a cable
function returnCable(cableNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`cable${cableNumber}Count`);
            let count = parseInt(countSpan.innerText);
            const cableImg = document.getElementById(`cable${cableNumber}`).getElementsByTagName('img')[0];
            const cableName = cableImg ? cableImg.alt : '';

            if (cableName) {
                updateDatabase(username, cableName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        count = updatedCount; // Update count variable
                        alert("Cable returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid cable name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to update the database
async function updateDatabase(username, cableName, change) {
    const cableRef = database.ref(`selectedcables/${username}`);
    const itemRef = database.ref(`returnedcables/${username}`);

    const currentDate = new Date().toLocaleString(); // Get current date and time

    const cableItem = {
        cableName: cableName,
        change: change,
        date: currentDate
    };

    // Push the cable item to the appropriate reference
    if (change < 0) {
        await cableRef.push(cableItem);
    } else {
        await itemRef.push(cableItem);
    }

    // Fetch updated count from database
    const countSnapshot = await database.ref(`cables/${cableName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`cables/${cableName}`).update({ count: updatedCount });

    return updatedCount;
}

// Function to update all values on the page to the database
function updatePageToDatabase() {
    const cables = document.querySelectorAll('.cables');
    
    cables.forEach(cable => {
        const cableId = cable.id;
        const countSpan = cable.querySelector('span');
        const count = parseInt(countSpan.innerText);

        // Get cable name
        const cableImg = cable.querySelector('img');
        const cableName = cableImg ? cableImg.alt : '';

        // Update the database with the new count
        updateDatabaseCount(cableName, count);
    });

    alert("Page updated successfully!");
}

// Function to update the database count for a specific cable
async function updateDatabaseCount(cableName, count) {
    try {
        await database.ref(`cables/${cableName}`).update({ count: count });
    } catch (error) {
        console.error("Error updating count in database:", error);
    }
}