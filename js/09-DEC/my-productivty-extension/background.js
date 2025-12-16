// storageService (storage needs)

class StorageService {
    static async save(key, value) {
        await chrome.storage.local.set({ [key]: value });
    }

    static async load(key, defaultValue = []) {
        const data = await chrome.storage.local.get([key]);
        return data[key] ?? defaultValue;
    }
}


// features

// siteBlocker

const localStorageKeys = {
    SITE_USAGE: "siteUsage",
    BLOCKED_SITES: "blockedSitesKey"
}

class SiteBlocker {
    constructor() {
        this.blockList = new Set();
        this.load();
    }

    async load() {
        let blockedList = await StorageService.load(localStorageKeys.BLOCKED_SITES, []);
        this.blockList = new Set(blockedList);
    }

    async addSite(url) {
        if(!this.blockList.has(url)) {
            this.blockList.add(url);
            await StorageService.save(localStorageKeys.BLOCKED_SITES, [...this.blockList]);
            await this.applyBlocking();
        }
    }

    async removeSite(url) {
        if(this.blockList.has(url)) {
            this.blockList.delete(url);
            await StorageService.save(localStorageKeys.BLOCKED_SITES, [...this.blockList]);
            await this.applyBlocking();
        }
    }

    isBlocked(url) {
        for(let subUrl of this.blockList) {
            if(url.toLowerCase().includes(subUrl.toLowerCase()))
                return true;
        }

        return false;
    }

    async applyBlocking() {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const ruleIdsToRemove = existingRules.map(rule => rule.id);
        
        if(ruleIdsToRemove.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove
            });
        }


        const newRules = [...this.blockList].map((site, index) => {
            return {
                id: index + 1,
                priority: 1,
                action: { type: "block" },
                condition: {    // https://domain.ext/
                    urlFilter: `*://*${site}*/*`,       // https://some.icici.net/  // https://some.icici.vemo.com/ // https://icici.com/
                    resourceTypes: [
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
            }
        });

        if(newRules.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
        }
    }
}

// usageTracker
class UsageTracker {
    constructor() {
        this.usage = {};    // {instagram: 10, facebook: 100, google: 500}
        this.currentHost = null;
        this.interval = null;
        this.init();
    }

    async init() {
        this.usage = await StorageService.load(localStorageKeys.SITE_USAGE, {});

        // detect active tabs on browser startup
        chrome.tabs.query({ active: true,  lastFocusedWindow: true }, (tabs) => {
            if(tabs.length && tabs[0].url) {
                this.updateCurrentHost(tabs[0].url);
            }
        });

        // on switch of the tabs we need to change the host
        chrome.tabs.onActivated.addListener(async (activeInfo) => {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                this.updateCurrentHost(tab?.url);
            });
        });

        // detect url changes in the same tab
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if(tab.active && changeInfo.url) {
                this.updateCurrentHost(changeInfo.url);
            }
        });

        this.startTimer();
    }

    async updateCurrentHost(url) {
        if(!url) return;

        try {
            const host = new URL(url);
            this.currentHost = host;
        } catch(error) {
            this.currentHost = null;
        }
    }

    startTimer() {
        if(this.interval) clearInterval(this.interval);

        this.interval = setInterval(async () => {
            if(this.currentHost) {
                const currentTime = this.usage[this.currentHost] ?? 0;
                this.usage[this.currentHost] = currentTime + 1; // 1 second
                await StorageService.save(localStorageKeys.SITE_USAGE, this.usage);
            }
        }, 1000);
    }
}

// pomodoroManager (timer)

class PomodoroManager {
    constructor() {
        this.timeLeft = 0;
        this.interval = null;
    }

    start(minutes = 25) {
        console.log(minutes);
        this.timeLeft = minutes * 60;

        chrome.storage.local.set({pomodoroTime: this.timeLeft});    // 60
        console.log(this.timeLeft);

        if(this.interval) clearInterval(this.interval);

        console.log(this.timeLeft);


        this.interval = setInterval(() => {
            this.timeLeft--;
            console.log(this.timeLeft);
            chrome.storage.local.set({pomodoroTime: this.timeLeft});

            if(this.timeLeft <= 0) {
                this.stop();

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "./assets/icon128.png",
                    title: "Pomodoro Complete!",
                    message: "Take a break!"
                });
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.timeLeft = 0;
        chrome.storage.local.set({pomodoroTime: 0});
    }
}

// bussine logic

const usageTracker = new UsageTracker();
const blocker = new SiteBlocker();
const pomodoro = new PomodoroManager();

// listening to the popup messages

chrome.runtime.onMessage.addListener((msgObj, sender, sendResponse) => {
    (async () => {
        try {
            switch(msgObj.action) {
                case "ADD_BLOCK":
                    await blocker.addSite(msgObj.site);
                    sendResponse({success: true});
                    break;
                case "REMOVE_BLOCK":
                    await blocker.removeSite(msgObj.site);
                    sendResponse({success: true});
                    break;
                case "START_POMODORO":
                    pomodoro.start(msgObj.minutes);
                    sendResponse({success: true});
                    break;
                case "STOP_POMODORO":
                    pomodoro.stop();
                    sendResponse({success: true});
                    break;
                default:
                    sendResponse({success: false, error: "Unknown action!"});
            }
        } catch(error) {
            console.error("Error handling message:", error);
            sendResponse({success: false, error: error.message});
        }
    })();

    return true;
})