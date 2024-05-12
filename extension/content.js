
let intervalId;

// Event listener for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
    console.log("Tab activated:", tabId);
    clearInterval(intervalId); 
    intervalId = setInterval(() => updateTimeSpent(tabId), 1000); 
});

function updateTimeSpent(tabId) {
    chrome.storage.local.get("websites", data => {
        console.log("Retrieved websites from local storage:", data);
        const { websites } = data || {};
        chrome.tabs.get(tabId, currentTab => {
            const { hostname } = new URL(currentTab.url);
            const currentTime = new Date().getTime();
            if (!websites[hostname]) {
                websites[hostname] = { total: 0 };
            }
            const lastVisited = websites[hostname].lastVisited || currentTime;
            const timeSpent = currentTime - lastVisited;
            websites[hostname].total += timeSpent;
            websites[hostname].lastVisited = currentTime;
            chrome.storage.local.set({ websites }, () => {
                console.log("Time spent updated for", hostname);
            });
        });
    });
}

window.addEventListener('blur', () => {
    clearInterval(intervalId);
    console.log("Window blurred, interval cleared");
});

console.log("Content script loaded");
