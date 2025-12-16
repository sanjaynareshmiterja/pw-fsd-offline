class PageBlocker {
    async init() {
        try {
            const data = await chrome.storage.local.get(["blockedSites"]);
            this.blockList = data.blockedSites || [];

            const currentHost = location.hostname;
            const isBlocked = this.blockList.some(site => 
                currentHost.includes(site) || currentHost === site
            );

            if (isBlocked) {
                // Prevent any scripts from running
                document.documentElement.innerHTML = '';
                
                // Display block message
                const blockDiv = document.createElement('div');
                blockDiv.style.cssText = `
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    margin: 0;
                    padding: 20px;
                    box-sizing: border-box;
                `;
                
                blockDiv.innerHTML = `
                    <div>
                        <h1 style="font-size: 48px; margin-bottom: 20px;">🚫 Site Blocked</h1>
                        <p style="font-size: 24px; opacity: 0.9;">This site is blocked for productivity.</p>
                        <p style="font-size: 16px; margin-top: 30px; opacity: 0.7;">Stay focused on what matters!</p>
                    </div>
                `;
                
                document.documentElement.appendChild(blockDiv);
            }
        } catch (error) {
            console.error("PageBlocker error:", error);
        }
    }
}

new PageBlocker().init();
