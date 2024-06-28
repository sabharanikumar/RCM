chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getInfo') {
    const memoryInfo = {
      //RAM memory
      usedMemory: window.performance.memory.usedJSHeapSize,
      totalMemory: window.performance.memory.totalJSHeapSize,
      heaplimit: window.performance.memory.jsHeapSizeLimit
    };

    //Dom logic
    const domNodeCount = document.getElementsByTagName('*').length;

    //CPU logic

    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += Math.random();
    }
    const end = performance.now();
    const executionTime = end - start;

    const cpuUsage = (executionTime / 1500) * 100; 

    sendResponse({ memoryInfo, cpuUsage, domNodeCount });
  }
});
