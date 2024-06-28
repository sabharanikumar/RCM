// Initialize empty arrays to store chart data
let labels = [];
let usedMemoryData = [];
let cpuUsageData = [];
let domNodeCountData = [];

// Create a chart instance for memory usage
const ctxMemory = document.getElementById('memoryChart').getContext('2d');
const memoryChart = new Chart(ctxMemory, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Heap Used Memory (MB)',
      data: usedMemoryData,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Used Memory (MB)'
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
              label += context.parsed.y.toFixed(2) + ' MB';
            }
            return label;
          }
        }
      }
    }
  }
});

// Create a chart instance for DOM node count
const ctxDomNodeCount = document.getElementById('domNodeCountChart').getContext('2d');
const domNodeCountChart = new Chart(ctxDomNodeCount, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'DOM Node Count',
      data: domNodeCountData,
      borderColor: 'rgb(255, 159, 64)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'DOM Node Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  }
});

// Create a chart instance for CPU usage
const ctxCPU = document.getElementById('cpuChart').getContext('2d');
const cpuChart = new Chart(ctxCPU, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'CPU Usage (%)',
      data: cpuUsageData,
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'CPU Usage (%)'
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
              label += context.parsed.y.toFixed(2) + ' %';
            }
            return label;
          }
        }
      }
    }
  }
});

function updateCharts(memoryInfo, cpuUsage, domNodeCount) {
  // Convert bytes to megabytes
  const usedMemoryMB = memoryInfo.usedMemory / 1048576;

  // Add current time to labels array
  labels.push(new Date().toLocaleTimeString());

  // Add used memory to usedMemoryData array
  usedMemoryData.push(usedMemoryMB);

  // Add CPU usage to cpuUsageData array (multiplied by 100 to represent percentage)
  cpuUsageData.push(cpuUsage * 100);

  // Add DOM node count to domNodeCountData array
  domNodeCountData.push(domNodeCount);

  // Update memory chart data
  memoryChart.data.datasets[0].data.push(usedMemoryMB);
  memoryChart.update();

  // Update CPU chart data
  cpuChart.data.datasets[0].data.push(cpuUsage * 100); // Multiply by 100 for percentage
  cpuChart.update();

  // Update DOM node count chart data
  domNodeCountChart.data.datasets[0].data.push(domNodeCount);
  domNodeCountChart.update();

  // Display total heap memory and max heap memory
  document.getElementById('totalMemory').innerText = 'Total Heap Memory: ' + (memoryInfo.totalMemory / 1048576).toFixed(2) + ' MB';
  document.getElementById('maxHeap').innerText = 'Max Heap Memory: ' + (memoryInfo.heaplimit / 1048576).toFixed(2) + ' MB';

  // Display CPU usage
  document.getElementById('cpuUsage').innerText = 'CPU Usage: ' + (cpuUsage * 100).toFixed(2) + ' %';

  // Display DOM node count
  document.getElementById('domNodeCount').innerText = 'DOM Node Count: ' + domNodeCount;
}

// Function to send message to content script to get memory and CPU info
function getInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getInfo" }, function (response) {
      if (response) {
        updateCharts(response.memoryInfo, response.cpuUsage, response.domNodeCount);
      } else {
        console.error('Failed to retrieve memory and CPU info.');
      }
    });
  });
}

// Send message to content script every second
setInterval(getInfo, 1500);