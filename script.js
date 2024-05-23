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

let chartData = [];
let sensorTypeGlobal = 'both'; // Keep track of the current sensor type
let dataLimit = 25; // Default number of data points to fetch

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
function fetchData(sensorType, initial = true) {
    let query = db.collection("data").orderBy("timestamp", "desc").limit(dataLimit);

    query.get().then((querySnapshot) => {
        if (!querySnapshot.empty) {
            const data = [];
            querySnapshot.forEach(doc => data.push(doc.data()));

            // Reverse the data to have the oldest first
            data.reverse();

            if (initial) {
                chartData = data; // Initial load
            } else {
                chartData = data.concat(chartData); // Append older data
            }

            // Get the most recent document
            const mostRecentDoc = chartData[chartData.length - 1];
            document.getElementById("carbonMonoxideValue").textContent = calculateCarbonMonoxide(mostRecentDoc.coPPM).toFixed(2) + " ppm";
            document.getElementById("lightValue").textContent = calculateLightPercentage(mostRecentDoc.lightPercent).toFixed(2) + "%";

            updateSuggestions(mostRecentDoc);
            updateChart(chartData, sensorType);
        } else {
            console.log("No documents found!");
        }
    }).catch((error) => {
        console.error("Error getting documents:", error);
    });
}

// Function to update suggestions based on sensor data
function updateSuggestions(data) {
    const suggestionsText = document.getElementById("suggestionsText");
    const coPPM = calculateCarbonMonoxide(data.coPPM);

    if (coPPM >= 50 && coPPM < 200) {
        suggestionsText.textContent = "ที่ระดับ 50 ppm จนกระทั่งถึง 200 ppm จะทำให้มีอาการปวดศีรษะเล็กน้อยและอ่อนเพลีย";
    } else if (coPPM >= 200 && coPPM < 400) {
        suggestionsText.textContent = "ที่ระดับ 200 ppm จนกระทั่งถึง 400 ppm จะเริ่มมีอาการคลื่นไส้ อาเจียน วิงเวียนศีรษะอย่างรุนแรง และอาจถึงขั้นเป็นลม";
    } else if (coPPM >= 400 && coPPM < 1200) {
        suggestionsText.textContent = "ที่ระดับประมาณ 1,200 ppm จะเริ่มเกิดอาการหายใจเต้นเร็วขึ้นผิดปกติ และเริ่มเต้นผิดจังหวะ";
    } else if (coPPM >= 1200 && coPPM < 2000) {
        suggestionsText.textContent = "ที่ระดับประมาณ 2,000 ppm อาจถึงขั้นหมดสติ และอาจถึงเสียชีวิต";
    } else if (coPPM >= 2000 && coPPM < 5000) {
        suggestionsText.textContent = "ที่ระดับประมาณ 5,000 ppm อาจทำให้เสียชีวิตภายในไม่กี่นาที แต่อาจจะรอดชีวิตถ้านำผู้ป่วยออกจากบริเวณที่มีอากาศบริสุทธิ์ หรือมีออกซิเจนเพียงพอ";
    } else if (coPPM >= 5000) {
        suggestionsText.textContent = "ที่ระดับประมาณ 5,000 ppm อาจทำให้เสียชีวิตภายในไม่กี่นาที";
    } else {
        suggestionsText.textContent = "อากาศอยู่ในระดับปลอดภัย";
    }
}

// Function to calculate the light percentage
function calculateLightPercentage(lightData) {
    return (lightData * 100) / 4095;
}

// Function to calculate carbon monoxide data
function calculateCarbonMonoxide(coPPM) {
    return Math.pow((((4095 / coPPM) - 1.0) / 19.709), (-1.0 / 0.652));
}

// Function to update the data limit based on user input
function updateDataLimit() {
    const dataLimitInput = document.getElementById('dataLimit');
    dataLimit = parseInt(dataLimitInput.value, 10);
    fetchRecentData();
}

// Fetch recent data points
function fetchRecentData() {
    fetchData(sensorTypeGlobal); // Fetch the most recent data points
}

// Chart.js setup
let chart;
const ctx = document.getElementById('sensorChart').getContext('2d');

// Function to update the chart with data
function updateChart(data, sensorType) {
    const timestamps = data.map(entry => new Date(entry.timestamp * 1000).toLocaleString());
    const carbonMonoxideData = data.map(entry => calculateCarbonMonoxide(entry.coPPM).toFixed(2));
    const lightData = data.map(entry => calculateLightPercentage(entry.lightPercent).toFixed(2));

    createChart(timestamps, carbonMonoxideData, lightData, sensorType);
}

function createChart(timestamps, carbonMonoxideData, lightData, sensorType) {
    if (chart) {
        chart.destroy();
    }

    const datasets = [];
    if (sensorType === 'carbonMonoxide' || sensorType === 'both') {
        datasets.push({
            label: 'Carbon Monoxide (ppm)',
            data: carbonMonoxideData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        });
    }
    if (sensorType === 'light' || sensorType === 'both') {
        datasets.push({
            label: 'Photoresistor (%)',
            data: lightData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        });
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: datasets
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
    sensorTypeGlobal = sensorType;
    fetchData(sensorType);  // Fetch new data from Firestore whenever toggling
}

// Export data to CSV
function exportCSV() {
    // Define the CSV file header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Time,Carbon Monoxide (ppm),Photoresistor (%)\n";

    // Iterate through chartData and format the rows
    chartData.forEach(entry => {
        const date = new Date(entry.timestamp * 1000);
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString();
        const carbonMonoxide = calculateCarbonMonoxide(entry.coPPM).toFixed(2);
        const light = calculateLightPercentage(entry.lightPercent).toFixed(2);
        const row = `${dateString},${timeString},${carbonMonoxide},${light}`;
        csvContent += row + "\n";
    });

    // Encode the CSV content and create a link to download the file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sensor_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

// Export chart as PNG
function exportPNG() {
    const link = document.createElement('a');
    link.href = chart.toBase64Image();
    link.download = 'sensor_chart.png';
    link.click();
}

// Initialize with both datasets
window.onload = function() {
    showLastModified();
    toggleData('both');  // Show both datasets initially
}
