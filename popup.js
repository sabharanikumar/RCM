(function() {
    const dataStorage = {
        labels: [],
        usedMemoryData: [],
        cpuUsageData: [],
        domNodeCountData: []
    };

    const initializeChart = (ctx, label, data, color, yAxisTitle) => new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataStorage.labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisTitle
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + (label.includes('CPU') ? ' %' : ' MB');
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    const domNodeCtx = document.getElementById('domNodeCountChart').getContext('2d');
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');

    const charts = {
        memoryChart: initializeChart(memoryCtx, 'Heap Used Memory (MB)', dataStorage.usedMemoryData, 'rgb(75, 192, 192)', 'Used Memory (MB)'),
        domNodeCountChart: initializeChart(domNodeCtx, 'DOM Node Count', dataStorage.domNodeCountData, 'rgb(255, 159, 64)', 'DOM Node Count'),
        cpuChart: initializeChart(cpuCtx, 'CPU Usage (%)', dataStorage.cpuUsageData, 'rgb(255, 99, 132)', 'CPU Usage (%)')
    };

    const updateDisplay = (memoryInfo, cpuUsage, domNodeCount) => {
        document.getElementById('totalMemory').innerText = 'Total Heap Memory: ' + (memoryInfo.totalMemory / 1048576).toFixed(2) + ' MB';
        document.getElementById('maxHeap').innerText = 'Max Heap Memory: ' + (memoryInfo.heaplimit / 1048576).toFixed(2) + ' MB';
        document.getElementById('cpuUsage').innerText = 'CPU Usage: ' + (cpuUsage * 100).toFixed(2) + ' %';
        document.getElementById('domNodeCount').innerText = 'DOM Node Count: ' + domNodeCount;
    };

    const updateCharts = (memoryInfo, cpuUsage, domNodeCount) => {
        const currentTime = new Date().toLocaleTimeString();
        const usedMemoryMB = memoryInfo.usedMemory / 1048576;
        const cpuUsagePercentage = cpuUsage * 100;

        dataStorage.labels.push(currentTime);
        dataStorage.usedMemoryData.push(usedMemoryMB);
        dataStorage.cpuUsageData.push(cpuUsagePercentage);
        dataStorage.domNodeCountData.push(domNodeCount);

        charts.memoryChart.data.datasets[0].data.push(usedMemoryMB);
        charts.cpuChart.data.datasets[0].data.push(cpuUsagePercentage);
        charts.domNodeCountChart.data.datasets[0].data.push(domNodeCount);

        charts.memoryChart.update();
        charts.cpuChart.update();
        charts.domNodeCountChart.update();

        updateDisplay(memoryInfo, cpuUsage, domNodeCount);
    };

    const getInfo = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getInfo" }, function (response) {
                if (response) {
                    updateCharts(response.memoryInfo, response.cpuUsage, response.domNodeCount);
                } else {
                    console.error('Failed to retrieve memory and CPU info.');
                }
            });
        });
    };

    setInterval(getInfo, 1500);
})();
