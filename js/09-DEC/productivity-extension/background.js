// __define-ocg__ Productivity Dashboard Background Script

// ------------------------------
// Storage Helper
// ------------------------------
class StorageService {
    static async save(key, value) {
        await chrome.storage.local.set({ [key]: value });
    }

    static async load(key, fallback = null) {
        const data = await chrome.storage.local.get([key]);
        return data[key] ?? fallback;
    }
}

// ------------------------------
// Site Blocker
// ------------------------------
class SiteBlocker {
    constructor() {
        this.blockList = [];
        this.init();
    }

    async init() {
        await this.load();
        await this.applyBlocking();
    }

    async load() {
        this.blockList = await StorageService.load("blockedSites", []);
    }

    async addSite(url) {
        if (!this.blockList.includes(url)) {
            this.blockList.push(url);
            await StorageService.save("blockedSites", this.blockList);
            await this.applyBlocking();
        }
    }

    async removeSite(url) {
        this.blockList = this.blockList.filter(s => s !== url);
        await StorageService.save("blockedSites", this.blockList);
        await this.applyBlocking();
    }

    isBlocked(url) {
        return this.blockList.some(site =>
            url.toLowerCase().includes(site.toLowerCase())
        );
    }

    // Use declarativeNetRequest for Manifest V3
    async applyBlocking() {
        // Feature 6: Check if blocking is enabled
        const blockingEnabled = await StorageService.load("blockingEnabled", true);
        
        // First, remove all existing rules
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);
        
        if (ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }

        // Only add rules if blocking is enabled
        if (!blockingEnabled) {
            return;
        }

        // Create new rules for blocked sites
        const newRules = this.blockList.map((site, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: {
                urlFilter: `*://*.${site}/*`,
                resourceTypes: [
                    "main_frame",
                    "sub_frame",
                    "stylesheet",
                    "script",
                    "image",
                    "font",
                    "object",
                    "xmlhttprequest",
                    "ping",
                    "csp_report",
                    "media",
                    "websocket",
                    "other"
                ]
            }
        }));

        if (newRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
        }
    }
}

// ------------------------------
// Usage Tracker
// ------------------------------
class UsageTracker {
    constructor() {
        this.usage = {};
        this.currentHost = null;
        this.interval = null;
        this.init();
    }

    async init() {
        this.usage = await StorageService.load("siteUsage", {});

        // Detect active tab on browser startup
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs.length && tabs[0].url) {
                this.updateCurrentHost(tabs[0].url);
            }
        });

        // When user switches tabs
        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                this.updateCurrentHost(tab?.url);
            });
        });

        // Detect URL changes inside same tab
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tab.active && changeInfo.url) {
                this.updateCurrentHost(changeInfo.url);
            }
        });

        // Start tracking every second
        this.startTimer();
    }

    updateCurrentHost(url) {
        if (!url) return;
        try {
            const host = new URL(url).hostname;
            this.currentHost = host;
        } catch {
            this.currentHost = null;
        }
    }

    startTimer() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(async () => {
            if (this.currentHost) {
                const current = this.usage[this.currentHost] ?? 0;
                this.usage[this.currentHost] = current + 1; // 1 second
                await StorageService.save("siteUsage", this.usage);
            }
        }, 1000);
    }
}

// ------------------------------
// Pomodoro Timer
// ------------------------------
class PomodoroManager {
    constructor() {
        this.timeLeft = 0;
        this.interval = null;
    }

    start(minutes = 25) {
        this.timeLeft = minutes * 60;

        if (this.interval) clearInterval(this.interval);

        // Feature 1: Update badge immediately when starting
        this.updateBadge();

        this.interval = setInterval(() => {
            this.timeLeft--;

            chrome.storage.local.set({ pomodoroTime: this.timeLeft });

            // Feature 1: Update badge every second
            this.updateBadge();

            if (this.timeLeft <= 0) {
                this.stop();

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "assets/icon128.png",
                    title: "Pomodoro Complete!",
                    message: "Take a break!"
                });
            }
        }, 1000);
    }

    // Feature 1: Badge Counter - Shows remaining time on extension icon
    updateBadge() {
        const mins = Math.ceil(this.timeLeft / 60);
        chrome.action.setBadgeText({ text: mins > 0 ? `${mins}m` : "" });
        chrome.action.setBadgeBackgroundColor({ color: "#e74c3c" });
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.timeLeft = 0;
        chrome.storage.local.set({ pomodoroTime: 0 });
        // Feature 1: Clear badge when stopped
        chrome.action.setBadgeText({ text: "" });
    }
}

// ------------------------------
// Instantiate Classes
// ------------------------------
const varOcg = new UsageTracker(); // Required by your instructions
const blocker = new SiteBlocker();
const pomodoro = new PomodoroManager();

// ------------------------------
// Listen for popup messages
// ------------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        try {
            switch (msg.action) {
                case "ADD_BLOCK":
                    await blocker.addSite(msg.site);
                    sendResponse({ success: true });
                    break;
                case "REMOVE_BLOCK":
                    await blocker.removeSite(msg.site);
                    sendResponse({ success: true });
                    break;
                case "START_POMODORO":
                    pomodoro.start(msg.minutes);
                    sendResponse({ success: true });
                    break;
                case "STOP_POMODORO":
                    pomodoro.stop();
                    sendResponse({ success: true });
                    break;
                // Feature 6: Enable/Disable blocking toggle
                case "ENABLE_BLOCKING":
                    await StorageService.save("blockingEnabled", true);
                    await blocker.applyBlocking();
                    sendResponse({ success: true });
                    break;
                case "DISABLE_BLOCKING":
                    await StorageService.save("blockingEnabled", false);
                    // Remove all blocking rules when disabled
                    const rules = await chrome.declarativeNetRequest.getDynamicRules();
                    if (rules.length > 0) {
                        await chrome.declarativeNetRequest.updateDynamicRules({
                            removeRuleIds: rules.map(r => r.id)
                        });
                    }
                    sendResponse({ success: true });
                    break;
                // Feature 3: Clear usage stats
                case "CLEAR_USAGE":
                    await StorageService.save("siteUsage", {});
                    varOcg.usage = {};
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: "Unknown action" });
            }
        } catch (error) {
            console.error("Error handling message:", error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true; // Keep the message channel open for async response
});
