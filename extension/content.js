// content.js

let intervalId;

// Event listener for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
    console.log("Tab activated:", tabId);
    clearInterval(intervalId); // Clear any existing interval
    intervalId = setInterval(() => updateTimeSpent(tabId), 1000); // Set interval to update time spent
});

// Function to update time spent on websites
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

// Event listener for window blur (when user switches to another window or tab)
window.addEventListener('blur', () => {
    clearInterval(intervalId); // Clear interval when window is blurred
    console.log("Window blurred, interval cleared");
});

console.log("Content script loaded");
