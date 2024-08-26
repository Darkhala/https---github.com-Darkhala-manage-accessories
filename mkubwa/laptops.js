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

// Call the function to fetch initial laptop counts during DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    fetchInitialLaptopCounts();
});

// Function to fetch initial laptop counts from the database and update HTML
function fetchInitialLaptopCounts() {
    console.log("Fetching initial laptop counts");
    const laptopsRef = database.ref('laptops');
    laptopsRef.once('value', snapshot => {
        console.log("Data fetched successfully");
        // Fetch each laptop count individually
        const laptop1Count = snapshot.child('Asus Laptop/count').val() || 0;
        const laptop2Count = snapshot.child('Macbook Laptop/count').val() || 0;
        const laptop3Count = snapshot.child('Dell Laptop/count').val() || 0;
        const laptop4Count = snapshot.child('hp Laptop/count').val() || 0;

        // Update HTML with fetched counts
        document.getElementById('laptop1Count').innerText = laptop1Count;
        document.getElementById('laptop2Count').innerText = laptop2Count;
        document.getElementById('laptop3Count').innerText = laptop3Count;
        document.getElementById('laptop4Count').innerText = laptop4Count;
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

// Function to select a laptop
function selectLaptop(laptopNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before selecting an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`laptop${laptopNumber}Count`);
            const count = parseInt(countSpan.innerText);

            if (count > 0) {
                const itemNameElement = document.getElementById(`laptop${laptopNumber}`).getElementsByClassName('laptop-name')[0];
                const itemName = itemNameElement ? itemNameElement.innerText : '';

                if (itemName) {
                    updateDatabase(username, itemName, -1)
                        .then(updatedCount => {
                            countSpan.innerText = updatedCount;
                            alert("Laptop selected successfully!");
                        })
                        .catch(error => {
                            alert(error);
                        });
                } else {
                    alert("Invalid laptop name.");
                }
            } else {
                alert("Accessory Out Of Stock");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to return a laptop
function returnLaptop(laptopNumber) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert("Please enter your username before returning an item.");
        return;
    }

    // Check if the username exists
    checkUsername(username)
        .then(() => {
            const countSpan = document.getElementById(`laptop${laptopNumber}Count`);
            const count = parseInt(countSpan.innerText);
            const itemNameElement = document.getElementById(`laptop${laptopNumber}`).getElementsByClassName('laptop-name')[0];
            const itemName = itemNameElement ? itemNameElement.innerText : '';

            if (itemName) {
                updateDatabase(username, itemName, 1)
                    .then(updatedCount => {
                        countSpan.innerText = updatedCount;
                        alert("Laptop returned successfully!");
                    })
                    .catch(error => {
                        alert(error);
                    });
            } else {
                alert("Invalid laptop name.");
            }
        })
        .catch(error => {
            alert(error);
        });
}

// Function to update the database
async function updateDatabase(username, itemName, change) {
    const selectedRef = database.ref(`selectedlaptops/${username}`);
    const returnedRef = database.ref(`returnedlaptops/${username}`);

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
    const countSnapshot = await database.ref(`laptops/${itemName}/count`).once('value');
    let updatedCount = countSnapshot.val() || 0; // Get the current count or default to 0 if it doesn't exist

    // Update the count based on the change
    updatedCount += change;

    // Ensure the count is not negative
    updatedCount = Math.max(updatedCount, 0);

    // Update the count in the database
    await database.ref(`laptops/${itemName}`).update({ count: updatedCount });

    return updatedCount;
}

// Function to update all values on the page to the database
function updatePageToDatabase() {
    const laptops = document.querySelectorAll('.laptop');
    
    laptops.forEach(laptop => {
        const laptopId = laptop.id;
        const countSpan = laptop.querySelector('span');
        const count = parseInt(countSpan.innerText);

        // Get laptop name
        const laptopNameElement = laptop.querySelector('.laptop-name');
        const laptopName = laptopNameElement ? laptopNameElement.innerText : '';

        // Update the database with the new count
        updateDatabaseCount(laptopName, count);
    });

    alert("Page updated successfully!");
}

// Function to update the database count for a specific laptop
async function updateDatabaseCount(itemName, count) {
    try {
        await database.ref(`laptops/${itemName}`).update({ count: count });
    } catch (error) {
        console.error("Error updating count in database:", error);
    }
}