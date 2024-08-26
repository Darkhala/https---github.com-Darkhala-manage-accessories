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

// Function to populate returned items
async function populateReturnedItems(containerId, table, selectedDate) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous data

    const itemsRef = database.ref(table);

    // Return a promise that resolves with true if items are found for the selected date
    return new Promise(resolve => {
        itemsRef.once('value')
            .then(snapshot => {
                let itemsFound = false; // Flag to track if items were found for the selected date

                snapshot.forEach(userSnapshot => {
                    const username = userSnapshot.key;

                    userSnapshot.forEach(itemSnapshot => {
                        const itemData = itemSnapshot.val();

                        // Parse the date from itemData
                        const dateString = itemData.date.split(',')[0]; // Extract date part without time
                        const itemDate = new Date(dateString);

                        // Check if the item's date matches the selected date (by year, month, and day)
                        if (
                            itemDate.getFullYear() === new Date(selectedDate).getFullYear() &&
                            itemDate.getMonth() === new Date(selectedDate).getMonth() &&
                            itemDate.getDate() === new Date(selectedDate).getDate()
                        ) {
                            itemsFound = true; // Set flag to true since items are found

                            const itemInfo = document.createElement('p');
                            // Adjusted to match the structure of each item
                            switch (table) {
                                case 'returnedcables':
                                    itemInfo.textContent = `${username} ----- ${itemData.cableName} ----- ${itemData.date}`;
                                    break;
                                case 'returnedkeyboards':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'returnedmouse':
                                    itemInfo.textContent = `${username} ----- ${itemData.mouseName} ----- ${itemData.date}`;
                                    break;
                                case 'returnedlaptops':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'returneddevices':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'returnedtoolkits':
                                    itemInfo.textContent = `${username} ----- ${itemData.toolkitName} ----- ${itemData.date}`;
                                    break;
                                default:
                                    break;
                            }
                            container.appendChild(itemInfo);
                        }
                    });
                });

                // Resolve the promise with itemsFound value
                resolve(itemsFound);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                resolve(false); // Resolve with false in case of an error
            });
    });
}

// Function to handle filtering by date
async function filterByDate() {
    const selectedDate = document.getElementById('filterDate').value;

    // Array to store promises for each table's data retrieval
    const promises = [];

    // Call populateReturnedItems function for each section and store the promises
    promises.push(populateReturnedItems('returnedCablesContainer', 'returnedcables', selectedDate));
    promises.push(populateReturnedItems('returnedKeyboardsContainer', 'returnedkeyboards', selectedDate));
    promises.push(populateReturnedItems('returnedMouseContainer', 'returnedmouse', selectedDate));
    promises.push(populateReturnedItems('returnedLaptopsContainer', 'returnedlaptops', selectedDate));
    promises.push(populateReturnedItems('returnedDevicesContainer', 'returneddevices', selectedDate));
    promises.push(populateReturnedItems('returnedToolkitsContainer', 'returnedtoolkits', selectedDate));

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Check if all results are false (meaning no data found for all tables)
    const allTablesEmpty = results.every(found => !found);

    // If all tables are empty, display the alert
    if (allTablesEmpty) {
        alert(`No data available for the selected date: ${selectedDate}`);
    }
}