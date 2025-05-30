document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('resetCallCountsBtn');
    const statusMsg = document.getElementById('statusMsg');

    btn.addEventListener('click', function() {
        btn.disabled = true;
        statusMsg.textContent = "Resetting...";
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs.length) {
                statusMsg.textContent = "No active tab found.";
                btn.disabled = false;
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => {
                    // Try to use in-page resetCallCounts if available
                    if (typeof resetCallCounts === 'function') {
                        resetCallCounts();
                    } else {
                        // fallback: clear callCount keys in localStorage for the current lead
                        const leadIdMatch = window.location.href.match(/LeadId=(\d+)/);
                        const leadId = leadIdMatch ? leadIdMatch[1] : 'unknown';
                        let count = 0;
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith(`callCount_${leadId}_`)) {
                                localStorage.removeItem(key);
                                count++;
                            }
                        });
                        // Optionally, refresh call tracking badges if function available
                        if (typeof addCallTrackingBadges === 'function') addCallTrackingBadges();
                        if (typeof setupCallTracking === 'function') setupCallTracking();
                        // If not, force a reload for immediate UI update
                        if (typeof addCallTrackingBadges !== 'function') location.reload();
                    }
                }
            }, (results) => {
                // Show status in popup
                if (chrome.runtime.lastError) {
                    statusMsg.textContent = "Failed: " + chrome.runtime.lastError.message;
                } else {
                    statusMsg.textContent = "Call counts reset!";
                    setTimeout(() => window.close(), 800);
                }
                btn.disabled = false;
            });
        });
    });
});