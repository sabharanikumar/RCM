chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getInfo') {
        const memInfo = (function() {
            const mem = window.performance.memory;
            return {
                uM: mem.usedJSHeapSize,
                tM: mem.totalJSHeapSize,
                hL: mem.jsHeapSizeLimit
            };
        })();

        const dCount = (function() {
            return document.getElementsByTagName('*').length;
        })();

        const cpuUtilization = (function() {
            const tStart = performance.now();
            let s = 0;
            for (let i = 0; i < 1e6; i++) {
                s += Math.random();
            }
            const tEnd = performance.now();
            const execTime = tEnd - tStart;
            return (execTime / 1500) * 100;
        })();

        sendResponse({ memoryInfo: memInfo, cpuUsage: cpuUtilization, domNodeCount: dCount });
    }
});
