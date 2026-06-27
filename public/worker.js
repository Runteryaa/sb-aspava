let interval = null;

self.onmessage = function(e) {
    if (e.data === 'start') {
        if (!interval) {
            interval = setInterval(() => {
                self.postMessage('tick');
            }, 5000);
        }
    } else if (e.data === 'stop') {
        clearInterval(interval);
        interval = null;
    }
};
