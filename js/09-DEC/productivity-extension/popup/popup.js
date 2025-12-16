class PopupUI {
    constructor() {
        this.blockListEl = document.getElementById("block-list");
        this.usageListEl = document.getElementById("usage-list");
        this.pomodoroDisplay = document.getElementById("pomodoro-display");
        this.totalTimeEl = document.getElementById("total-time");

        this.init();
    }

    async init() {
        const data = await chrome.storage.local.get(["blockedSites", "siteUsage", "blockingEnabled"]);
        this.renderBlockList(data.blockedSites || []);
        this.renderUsage(data.siteUsage || {});
        
        // Feature 5: Show total screen time
        this.updateTotalTime(data.siteUsage || {});
        
        // Feature 6: Initialize blocking toggle state
        const blockingToggle = document.getElementById("blocking-toggle");
        blockingToggle.checked = data.blockingEnabled !== false; // Default to true

        // Setup event listeners
        this.setupEventListeners();
        
        // Start refresh intervals
        this.startRefreshIntervals();
    }

    setupEventListeners() {
        // Original event listeners
        document.getElementById("block-add").addEventListener("click", () => this.addBlockSite());
        document.getElementById("pomodoro-start").addEventListener("click", () => this.startPomodoro());
        document.getElementById("pomodoro-stop").addEventListener("click", () => this.stopPomodoro());

        // Feature 4: Preset buttons
        document.querySelectorAll(".preset").forEach(btn => {
            btn.addEventListener("click", () => {
                const mins = parseInt(btn.dataset.mins);
                chrome.runtime.sendMessage({ action: "START_POMODORO", minutes: mins });
            });
        });

        // Feature 2: Quick Block Current Site
        document.getElementById("block-current").addEventListener("click", () => this.blockCurrentSite());

        // Feature 3: Clear Usage Stats
        document.getElementById("clear-stats").addEventListener("click", () => this.clearStats());

        // Feature 6: Blocking Toggle
        document.getElementById("blocking-toggle").addEventListener("change", (e) => this.toggleBlocking(e));
    }

    startRefreshIntervals() {
        // Refresh pomodoro every second
        setInterval(() => this.refreshPomodoro(), 1000);
        
        // Refresh usage stats every 5 seconds
        setInterval(() => this.refreshUsageStats(), 5000);
    }

    // Feature 5: Calculate and display total screen time
    updateTotalTime(usage) {
        const totalSeconds = Object.values(usage).reduce((a, b) => a + b, 0);
        
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            this.totalTimeEl.textContent = `${hours}h ${mins}m`;
        } else if (mins > 0) {
            this.totalTimeEl.textContent = `${mins} minutes`;
        } else {
            this.totalTimeEl.textContent = `< 1 minute`;
        }
    }

    // Feature 2: Block current active tab's site
    async blockCurrentSite() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.url) {
                const url = new URL(tab.url);
                const host = url.hostname.replace(/^www\./, '');
                
                if (host && !host.includes('chrome://') && !host.includes('chrome-extension://')) {
                    chrome.runtime.sendMessage({ action: "ADD_BLOCK", site: host });
                    // Delay reload to allow message processing
                    setTimeout(() => location.reload(), 100);
                } else {
                    alert("Cannot block this page (system page)");
                }
            }
        } catch (error) {
            console.error("Error blocking current site:", error);
        }
    }

    // Feature 3: Clear all usage statistics
    async clearStats() {
        if (confirm("Are you sure you want to clear all usage statistics?")) {
            chrome.runtime.sendMessage({ action: "CLEAR_USAGE" });
            setTimeout(() => location.reload(), 100);
        }
    }

    // Feature 6: Toggle blocking on/off
    toggleBlocking(e) {
        const action = e.target.checked ? "ENABLE_BLOCKING" : "DISABLE_BLOCKING";
        chrome.runtime.sendMessage({ action });
        
        // Update toggle text
        const toggleText = e.target.nextElementSibling;
        toggleText.textContent = e.target.checked ? "Blocking Enabled" : "Blocking Paused";
        toggleText.style.color = e.target.checked ? "#68d391" : "#fc8181";
    }

    renderBlockList(list) {
        this.blockListEl.innerHTML = "";
        
        if (list.length === 0) {
            const emptyLi = document.createElement("li");
            emptyLi.textContent = "No sites blocked";
            emptyLi.style.opacity = "0.6";
            emptyLi.style.fontStyle = "italic";
            this.blockListEl.appendChild(emptyLi);
            return;
        }

        list.forEach(site => {
            const li = document.createElement("li");
            li.textContent = site;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "✕";
            removeBtn.onclick = () => this.removeSite(site);

            li.appendChild(removeBtn);
            this.blockListEl.appendChild(li);
        });
    }

    renderUsage(usage) {
        this.usageListEl.innerHTML = "";
        
        // Sort by time spent (descending)
        const sortedUsage = Object.entries(usage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10 sites

        if (sortedUsage.length === 0) {
            const emptyLi = document.createElement("li");
            emptyLi.textContent = "No usage data yet";
            emptyLi.style.opacity = "0.6";
            emptyLi.style.fontStyle = "italic";
            this.usageListEl.appendChild(emptyLi);
            return;
        }

        sortedUsage.forEach(([site, seconds]) => {
            const li = document.createElement("li");
            const mins = Math.round(seconds / 60);
            const timeText = mins >= 60 
                ? `${Math.floor(mins / 60)}h ${mins % 60}m` 
                : `${mins} min${mins !== 1 ? 's' : ''}`;
            li.textContent = `${site}: ${timeText}`;
            this.usageListEl.appendChild(li);
        });
    }

    addBlockSite() {
        const raw = document.getElementById("block-input").value.trim();
        if (!raw) return;
    
        try {
            const host = new URL("https://" + raw.replace(/https?:\/\//, "")).hostname.replace(/^www\./, '');
            chrome.runtime.sendMessage({ action: "ADD_BLOCK", site: host });
            setTimeout(() => location.reload(), 100);
        } catch (error) {
            alert("Invalid URL format");
        }
    }    

    removeSite(site) {
        chrome.runtime.sendMessage({ action: "REMOVE_BLOCK", site });
        setTimeout(() => location.reload(), 100);
    }

    startPomodoro() {
        const minutes = +document.getElementById("pomodoro-min").value;
        if (minutes > 0) {
            chrome.runtime.sendMessage({ action: "START_POMODORO", minutes });
        }
    }

    stopPomodoro() {
        chrome.runtime.sendMessage({ action: "STOP_POMODORO" });
    }

    async refreshPomodoro() {
        const data = await chrome.storage.local.get(["pomodoroTime"]);
        const time = data.pomodoroTime ?? 0;

        const mins = Math.floor(time / 60);
        const secs = time % 60;

        this.pomodoroDisplay.textContent = time > 0 
            ? `⏱️ ${mins}:${secs.toString().padStart(2, "0")}`
            : "Time Left: 0:00";
        
        // Add visual indicator when timer is active
        if (time > 0) {
            this.pomodoroDisplay.style.color = "#68d391";
        } else {
            this.pomodoroDisplay.style.color = "#fbd38d";
        }
    }

    async refreshUsageStats() {
        const data = await chrome.storage.local.get(["siteUsage"]);
        const usage = data.siteUsage || {};
        this.renderUsage(usage);
        this.updateTotalTime(usage);
    }
}

// Initialize popup
new PopupUI();
