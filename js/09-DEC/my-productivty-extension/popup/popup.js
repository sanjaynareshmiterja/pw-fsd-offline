class PopupUI {
    constructor() {
        this.blockListEl = document.getElementById("blocked-website-list");
        this.usageListEl = document.getElementById("usage-list");
        this.pomodoroDisplay = document.getElementById('timer-display');

        this.init();
        this.listenPomodoro();
    }

    async init() {
        const data = await chrome.storage.local.get(["siteUsage", "blockedSitesKey"]);

        console.log(data);
        
        this.renderBlockList(data.blockedSitesKey || []);
        this.renderUsage(data.siteUsage || []);

        document.getElementById('block-add-btn').addEventListener('click', () => this.addBlockSite());
        document.getElementById('timer-start').addEventListener('click', () => this.startPomodoro());
        document.getElementById('timer-stop').addEventListener('click', () => this.stopPomodoro());
    }

    renderBlockList(list) {
        this.blockListEl.innerHTML = "";

        list.forEach(eItem => {
            const li = document.createElement('li');
            li.textContent = eItem;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = "X";
            removeBtn.style.float = "right";
            removeBtn.onclick = () => this.removeSite(eItem);

            li.appendChild(removeBtn);
            this.blockListEl.appendChild(li);
        });
    }

    renderUsage(usage) {
        this.usageListEl.innerHTML = "";

        Object.entries(usage).forEach(([site, seconds]) => {
            const li = document.createElement('li');
            li.textContent = `${site}: ${Math.round(seconds / 60)} mins`;
            this.usageListEl.appendChild(li);
        });
    }

    addBlockSite() {
        const raw = document.getElementById('block-input').value.trim();
        if(!raw) return;

        const host = new URL("https://" + raw.replace(/https?:\/\//, "")).hostname;

        chrome.runtime.sendMessage({action: "ADD_BLOCK", site: host});
        location.reload();
    }

    removeSite(site) {
        chrome.runtime.sendMessage({action: "REMOVE_BLOCK", site});
        location.reload();
    }

    startPomodoro() {
        const minutes = +document.getElementById('pomodoro-time').value;
        console.log(minutes);
        chrome.runtime.sendMessage({action: "START_POMODORO", minutes});
    }

    stopPomodoro() {
        chrome.runtime.sendMessage({action: "STOP_POMODORO"});
    }

    async refreshPomodoro() {
        const data = await chrome.storage.local.get(["pomodoroTime"]);
        const time = data.pomodoroTime ?? 0;
        
        const mins = Math.floor(time / 60); // 1.1 => 1
        const secs = time % 60;     // 6

        this.pomodoroDisplay.textContent = `Time Left: ${mins}:${secs.toString().padStart(2, "0")}`;
    }

    listenPomodoro() {
        setInterval(() => this.refreshPomodoro(), 1000);
    }
}


new PopupUI();