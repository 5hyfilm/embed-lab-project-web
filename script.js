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

// Chart.js setup
let chart;
const ctx = document.getElementById('sensorChart').getContext('2d');

// Example data for chart
const carbonMonoxideData = [5, 10, 15, 20, 25, 30, 35];
const lightData = [350, 400, 450, 500, 550, 600, 650];

function createChart(data, label) {
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7'],
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
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
    if (sensorType === 'carbonMonoxide') {
        createChart(carbonMonoxideData, 'Carbon Monoxide (ppm)');
    } else if (sensorType === 'light') {
        createChart(lightData, 'Photoresistor (Lux)');
    } else if (sensorType === 'both') {
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1', '2', '3', '4', '5', '6', '7'],
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
}

// Initialize with Carbon Monoxide data
window.onload = function() {
    showLastModified();
    toggleData('carbonMonoxide');
}
