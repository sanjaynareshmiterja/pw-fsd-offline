// storageService (storage needs)

class StorageService {
    static async save(key, value) {
        await chrome.storage.local.set({ [key]: value });
    }

    static async load(key) {
        const data = await chrome.storage.local.get([key]);
        return data[key] ?? [];
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
        this.blockList = new Set(StorageService.load(localStorageKeys.BLOCKED_SITES));
    }

    async addSite(url) {
        this.blockList.add(url);
        await StorageService.save(localStorageKeys.localStorageKeys, this.blockList);
    }

    async removeSite(url) {
        if(this.blockList.has(url))
            this.blockList.delete(url);
        
        await StorageService.save(localStorageKeys.BLOCKED_SITES, this.blockList);
    }

    isBlocked(url) {    // https://google.com
        for(let subUrl of this.blockList) {     // ["google", "facebook"]
            if(url.includes(subUrl))
                return true;
        }

        return false;
    }
}

// usageTracker
class UsageTracker {
    constructor() {
        this.usage = {};    // {instagram: 10, facebook: 100, google: 500}
        init();
    }

    async init() {
        this.usage = await StorageService.load(localStorageKeys.SITE_USAGE);
        chrome.tabs.onActivated.addListener(tabsInfo => this.track(tabsInfo));
    }

    async track(tabsInfo) {
        chrome.tabs.get(tabsInfo.tabId, async (tab) => {
            if(!tab?.url)
                return;
            
            let hostName = new URL(tab.url).hostname;
            let currentTime = this.usage[hostName] ?? 0;
            this.usage[hostName] = currentTime + 1;

            await StorageService.save(localStorageKeys.SITE_USAGE, this.usage);
        });
    }
}

// pomodoroManager (timer)

class pomodoroManager {
    constructor() {
        this.timeLeft = 0;
        this.interval = null;
    }

    start(minutes) {
        this.timeLeft = minutes * 60;

        chrome.storage.local.set({pomodoroTime: this.timeLeft});    // 60

        this.interval = setInterval(() => {
            this.timeLeft--;
            chrome.storage.local.set({pomodoroTime: this.timeLeft});

            if(this.timeLeft <= 0) {
                this.stop();

                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "../assets/icone128.png",
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
    }
}

// bussine logic