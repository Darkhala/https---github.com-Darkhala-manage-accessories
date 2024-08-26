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

// Function to populate selected items
async function populateSelectedItems(containerId, table, selectedDate) {
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
                            switch (table) {
                                case 'selectedcables':
                                    itemInfo.textContent = `${username} ----- ${itemData.cableName} ----- ${itemData.date}`;
                                    break;
                                case 'selectedkeyboards':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'selectedmouse':
                                    itemInfo.textContent = `${username} ----- ${itemData.mouseName} ----- ${itemData.date}`;
                                    break;
                                case 'selectedlaptops':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'selecteddevices':
                                    itemInfo.textContent = `${username} ----- ${itemData.itemName} ----- ${itemData.date}`;
                                    break;
                                case 'selectedtoolkits':
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

    // Call populateSelectedItems function for each section
    const cablesFound = await populateSelectedItems('selectedCablesContainer', 'selectedcables', selectedDate);
    const keyboardsFound = await populateSelectedItems('selectedKeyboardsContainer', 'selectedkeyboards', selectedDate);
    const mouseFound = await populateSelectedItems('selectedMouseContainer', 'selectedmouse', selectedDate);
    const laptopsFound = await populateSelectedItems('selectedLaptopsContainer', 'selectedlaptops', selectedDate);
    const devicesFound = await populateSelectedItems('selectedDevicesContainer', 'selecteddevices', selectedDate);
    const toolkitsFound = await populateSelectedItems('selectedToolkitsContainer', 'selectedtoolkits', selectedDate);


    // Check if all items are not found for the selected date
    if (!cablesFound && !keyboardsFound && !mouseFound && !laptopsFound && !devicesFound && !toolkitsFound) {
        alert(`No data available for the selected date: ${selectedDate}`);
    }
}