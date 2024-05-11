let dustData = { label: 'Dust Sensor', data: [100, 120, 110], backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgba(255, 99, 132, 1)' };
let lightData = { label: 'Photoresistor', data: [300, 350, 340], backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)' };

let ctx = document.getElementById('sensorChart').getContext('2d');
let sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['1 PM', '2 PM', '3 PM'],
        datasets: [dustData, lightData]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        }
    }
});

function toggleData(sensorType) {
    sensorChart.data.datasets.forEach((dataset) => {
        if (dataset.label.includes('Dust') && (sensorType === 'light' || sensorType === 'both')) {
            dataset.hidden = (sensorType === 'light');
        }
        if (dataset.label.includes('Photoresistor') && (sensorType === 'dust' || sensorType === 'both')) {
            dataset.hidden = (sensorType === 'dust');
        }
    });
    sensorChart.update();
}
