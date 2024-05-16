// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCg0ztemq1zeGhu2GA3MiZHQjHws4n7qUo",
    authDomain: "embedsyslabproj.firebaseapp.com",
    projectId: "embedsyslabproj",
    storageBucket: "embedsyslabproj.appspot.com",
    messagingSenderId: "696453054033",
    appId: "1:696453054033:web:1a4e98677c198dcd7ec270",
    measurementId: "G-T24SWGTVT3"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to format the date and time
function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
}

function showLastModified() {
    // Get the current time
    const now = new Date();

    // Get the last opened time from localStorage
    const lastOpened = localStorage.getItem('lastOpened');

    // Display the last opened time
    const timeElement = document.getElementById('time');
    if (lastOpened) {
        timeElement.textContent = formatDateTime(new Date(lastOpened));
    } else {
        timeElement.textContent = 'This is your first visit!';
    }

    // Update the last opened time in localStorage
    localStorage.setItem('lastOpened', now.toISOString());
}

// Function to fetch data from Firestore and update the chart
function fetchData() {
    db.collection("testset").orderBy("timestamp", "asc").get().then((querySnapshot) => {
        if (!querySnapshot.empty) {
            const data = [];
            querySnapshot.forEach(doc => data.push(doc.data()));

            // Get the most recent document
            const mostRecentDoc = data[data.length - 1];
            document.getElementById("carbonMonoxideValue").textContent = mostRecentDoc.coPPM + " ppm";
            document.getElementById("lightValue").textContent = mostRecentDoc.lightPercent + " Lux";

            updateChart(data);
        } else {
            console.log("No documents found!");
        }
    }).catch((error) => {
        console.error("Error getting documents:", error);
    });
}

// Chart.js setup
let chart;
const ctx = document.getElementById('sensorChart').getContext('2d');

// Function to update the chart with data
function updateChart(data) {
    const timestamps = data.map(entry => new Date(entry.timestamp * 1000).toLocaleString());
    const carbonMonoxideData = data.map(entry => entry.coPPM);
    const lightData = data.map(entry => entry.lightPercent);

    createChart(timestamps, carbonMonoxideData, lightData);
}

function createChart(timestamps, carbonMonoxideData, lightData) {
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Carbon Monoxide (ppm)',
                data: carbonMonoxideData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }, {
                label: 'Photoresistor (Lux)',
                data: lightData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function toggleData(sensorType) {
    fetchData();  // Fetch new data from Firestore whenever toggling
}

// Initialize with Carbon Monoxide data
window.onload = function() {
    showLastModified();
    fetchData();  // Fetch initial data from Firestore
}
