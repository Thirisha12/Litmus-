chrome.runtime.sendMessage({ message: "getWebsiteData" }, (websiteData) => {
    if (!websiteData ) {
        renderNoDataMessage();
    } else {
        renderTimeData(websiteData);
    }
});

function renderTimeData(websiteData) {
    const container = document.getElementById("timeDataContainer");
    container.innerHTML = "";

    if (Object.keys(websiteData).length === 0) {
        renderNoDataMessage();
    } else {
        for (const [website, time] of Object.entries(websiteData)) {
            const websiteInfo = document.createElement("p");
            // websiteInfo.textContent = `${website}: ${formatTime(time)}`;
            container.appendChild(websiteInfo); // Here's where container is used
        }
    }
}


function renderNoDataMessage() {
    const container = document.getElementById("timeDataContainer");
    container.innerHTML = "";

    const message = document.createElement("p");
    message.textContent = "No website data available";
    container.appendChild(message);
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

chrome.storage.local.get("websites", (data) => {
    const { websites } = data || {};
    const websiteList = document.getElementById("websiteList");

    websiteList.innerHTML = "";

    if (websites) {
        for (const [hostname, info] of Object.entries(websites)) {
            const listItem = document.createElement("li");
            const totalTime = info.total;
            const hours = Math.floor(totalTime / (1000 * 60 * 60));
            const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);
            listItem.textContent = `${hostname}: ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
            websiteList.appendChild(listItem);
        }
    } else {
        websiteList.textContent = "No data available";
    }
});

// popup.js

// Function to send message to background script to toggle restricted website
function toggleRestrictedWebsite(hostname, isRestricted) {
    chrome.runtime.sendMessage({ message: "toggleRestrictedWebsite", hostname, isRestricted });
}

// Function to send message to background script to set time limit for a website
function setTimeLimit(website, timeLimit) {
    chrome.runtime.sendMessage({ message: "setTimeLimit", website, timeLimit });
}

// Event listener for form submission to set time limit for a website
document.getElementById("setTimeLimitForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const website = document.getElementById("website").value;
    const timeLimit = parseInt(document.getElementById("timeLimit").value) * 60 * 1000; // Convert minutes to milliseconds
    setTimeLimit(website, timeLimit);
    // Clear the input fields after setting time limit
    document.getElementById("website").value = "";
    document.getElementById("timeLimit").value = "";
});

// Function to handle adding website to restricted list
function addWebsiteToRestrictedList() {
    const hostname = document.getElementById("hostname").value;
    toggleRestrictedWebsite(hostname, true);
    // Clear the input field after adding the website
    document.getElementById("hostname").value = "";
}

// popup.js

// Function to render the list of restricted websites
function renderRestrictedWebsites(websites) {
    const listContainer = document.getElementById("restrictedWebsiteList");
    listContainer.innerHTML = "";

    if (!websites || Object.keys(websites).length === 0) {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = "No restricted websites found.";
        listContainer.appendChild(noDataMessage);
    } else {
        for (const [hostname, info] of Object.entries(websites)) {
            if (info.restricted) {
                const listItem = document.createElement("li");
                listItem.textContent = hostname;
                listContainer.appendChild(listItem);
            }
        }
    }
}

// Fetch restricted websites from storage and render them
chrome.storage.local.get("websites", data => {
    const { websites } = data || {};
    renderRestrictedWebsites(websites);
});
