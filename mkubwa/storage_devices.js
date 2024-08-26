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


// Call the function to fetch initial device counts during DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    fetchInitialDeviceCounts();
});

// Function to fetch initial device counts from the database and update HTML
function fetchInitialDeviceCounts() {
    console.log("Fetching initial device counts");
    const devicesRef = database.ref('devices');
    devicesRef.once('value', snapshot => {
        console.log("Data fetched successfully");
        // Fetch each device count individually
        const device1Count = snapshot.child('Flash Drive/count').val() || 0;
        const device2Count = snapshot.child('External Hard Drive/count').val() || 0;
        const device3Count = snapshot.child('SD_card/count').val() || 0;

        // Update HTML with fetched counts
        document.getElementById('device1Count').innerText = device1Count;
        document.getElementById('device2Count').innerText = device2Count;
        document.getElementById('device3Count').innerText = device3Count;
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

// Function to select a storage device
function selectDevice(deviceNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`device${deviceNumber}Count`);
            const count = parseInt(countSpan.innerText);

            if (count > 0) {
                const itemNameElement = document.getElementById(`device${deviceNumber}`).getElementsByClassName('device-name')[0];
                const itemName = itemNameElement ? itemNameElement.innerText : '';

                if (itemName) {
                    updateDatabase(username, itemName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            alert("Storage device selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid storage device name.");
                }
            } else {
                alert("Accessory Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a storage device
function returnDevice(deviceNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`device${deviceNumber}Count`);
            const count = parseInt(countSpan.innerText);
            const itemNameElement = document.getElementById(`device${deviceNumber}`).getElementsByClassName('device-name')[0];
            const itemName = itemNameElement ? itemNameElement.innerText : '';

            if (itemName) {
                updateDatabase(username, itemName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        alert("Storage device returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid storage device name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to update the database
async function updateDatabase(username, itemName, change) {
    const selectedRef = database.ref(`selecteddevices/${username}`);
    const returnedRef = database.ref(`returneddevices/${username}`);

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
    const countSnapshot = await database.ref(`devices/${itemName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`devices/${itemName}`).update({ count: updatedCount });

    return updatedCount;
}
// Function to update all values on the page to the database
function updatePageToDatabase() {
    const devices = document.querySelectorAll('.storage-device');
    
    devices.forEach(device => {
        const deviceNumber = device.id.replace('device', '');
        const countSpan = device.querySelector('span');
        const count = parseInt(countSpan.innerText);

        // Get device name
        const itemNameElement = device.getElementsByClassName('device-name')[0];
        const itemName = itemNameElement ? itemNameElement.innerText : '';

        // Update the database with the new count
        updateDatabaseCount(itemName, count);
    });

    alert("Page updated successfully!");
}

// Function to update the database count for a specific device
async function updateDatabaseCount(itemName, count) {
    try {
        await database.ref(`devices/${itemName}`).update({ count: count });
    } catch (error) {
        console.error("Error updating count in database:", error);
    }
}
