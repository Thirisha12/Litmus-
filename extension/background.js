chrome.tabs.onActivated.addListener(tab => {
    chrome.storage.local.get("websites", data => {
        // console.log("Retrieved websites from local storage:", data);
        const { websites } = data || {};
        const { tabId } = tab;
        chrome.tabs.get(tabId, currentTab => {
            if (!currentTab || !currentTab.url) {
                return;
            }
            const { hostname } = new URL(currentTab.url);
            const currentTime = new Date().getTime();
            if (!websites[hostname]) {
                websites[hostname] = { total: 0 };
            }
            websites[hostname].lastVisited = currentTime;
            chrome.storage.local.set({ websites });
        });
    });
});

chrome.windows.onRemoved.addListener(() => {
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        chrome.tabs.query({}, tabs => {
            tabs.forEach(tab => {
                if (!tab || !tab.url) {
                    return;
                }
                const { hostname } = new URL(tab.url);
                const currentTime = new Date().getTime();
                if (websites[hostname] && websites[hostname].lastVisited) {
                    const timeSpent = currentTime - websites[hostname].lastVisited;
                    websites[hostname].total += timeSpent;
                    delete websites[hostname].lastVisited;
                }
            });
            chrome.storage.local.set({ websites });
        });
    });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "getWebsiteData") {
        chrome.storage.local.get("websites", (data) => {
            sendResponse(data.websites); // Send the data back to the popup script
        });
        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ websites: {} });
    // console.log("hi");
});
let intervalId;

// Event listener for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
    // console.log("Tab activated:", tabId);
    clearInterval(intervalId); // Clear any existing interval
    intervalId = setInterval(() => updateTimeSpent(tabId), 1000); // Set interval to update time spent
});

function updateTimeSpent(tabId) {
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        if (!websites) return;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) return;

            const currentTab = tabs[0];
            const { hostname } = new URL(currentTab.url);
            const currentTime = new Date().getTime();
            
            if (!websites[hostname]) {
                websites[hostname] = { total: 0 };
            }
            const lastVisited = websites[hostname].lastVisited || currentTime;
            const timeSpent = currentTime - lastVisited;
            websites[hostname].total += timeSpent;
            websites[hostname].lastVisited = currentTime;
            chrome.storage.local.set({ websites });
        });
    });
}

// background.js

// Function to block access to restricted sites
function blockAccessToRestrictedSites(details) {
    const { url } = details;
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        if (!websites) return;

        const { hostname } = new URL(url);
        if (websites[hostname]?.restricted) {
            return { redirectUrl: "blocked.html" };
        }
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    blockAccessToRestrictedSites,
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Function to set time limits on websites
function setTimeLimits(website, timeLimit) {
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        if (!websites) return;

        websites[website].timeLimit = timeLimit;
        chrome.storage.local.set({ websites });
    });
}

// Function to automatically close tabs when time limit is exceeded
function closeTabIfTimeLimitExceeded(tabId, website) {
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        if (!websites) return;

        const currentTime = new Date().getTime();
        const timeLimit = websites[website].timeLimit;
        if (timeLimit && (currentTime - websites[website].lastVisited) > timeLimit) {
            chrome.tabs.remove(tabId);
        }
    });
}

// Event listener for tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
    clearInterval(intervalId); // Clear any existing interval
    intervalId = setInterval(() => updateTimeSpent(tabId), 1000); // Set interval to update time spent
});

// Function to add or remove websites from restricted list
function toggleRestrictedWebsite(hostname, isRestricted) {
    chrome.storage.local.get("websites", data => {
        const { websites } = data || {};
        if (!websites) return;

        if (isRestricted) {
            websites[hostname].restricted = true;
        } else {
            delete websites[hostname].restricted;
        }
        chrome.storage.local.set({ websites });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "setTimeLimit") {
        const { website, timeLimit } = message;
        setTimeLimits(website, timeLimit);
    }
    sendResponse(); // Send an empty response
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "toggleRestrictedWebsite") {
        const { hostname, isRestricted } = message;
        toggleRestrictedWebsite(hostname, isRestricted);
    }
    sendResponse(); // Send an empty response
});
