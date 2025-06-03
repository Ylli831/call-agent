// Tracks every call attempt with timestamp, number, and leadID in chrome.storage.local
(function() {
    const STORAGE_KEY = "callAgentCallLog";
    const SETTINGS_KEY = "callAgentSettings";
    // Call log is an array of {timestamp, phone, leadId}
    function getCallLog(cb) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            cb(result[STORAGE_KEY] ? result[STORAGE_KEY] : []);
        });
    }
    function setCallLog(log, cb) {
        chrome.storage.local.set({ [STORAGE_KEY]: log }, cb);
    }
    function addCall(phone, leadId) {
        getCallLog((log) => {
            log.push({
                timestamp: Date.now(),
                phone,
                leadId
            });
            setCallLog(log);
        });
    }
    document.addEventListener("click", function(e) {
        let tgt = e.target.closest("a[href^='tel:']");
        if (tgt) {
            let phone = tgt.getAttribute("href");
            if (phone && phone.startsWith("tel:")) {
                phone = phone.replace("tel:", "").replace(/\D/g, "");
            } else {
                phone = (tgt.textContent.match(/\d{10,}/) || [])[0] || "unknown";
            }
            let leadId = "unknown";
            let url = tgt.getAttribute("href") || "";
            let onclick = tgt.getAttribute("onclick") || "";
            let match = url.match(/leadid=(\d+)/i) || onclick.match(/(\d{6,})/g);
            if (match) leadId = Array.isArray(match) ? match[0] : match[1];
            addCall(phone, leadId);
            window.dispatchEvent(new CustomEvent('CallAgent:callLogged'));
        }
    });

    // Expose API for dashboard/popup via window (optional, for debugging)
    window.CallAgentCallTracking = {
        getCallLog: cb => getCallLog(cb),
        setCallLog: (log, cb) => setCallLog(log, cb),
        clearCallLog: (cb) => setCallLog([], cb),
        getSettings: function(cb) {
            chrome.storage.local.get([SETTINGS_KEY], (result) => {
                cb(result[SETTINGS_KEY] ? result[SETTINGS_KEY] : {
                    hourlyQuota: 120,
                    dailyHours: 8,
                    workStartHour: 18
                });
            });
        },
        setSettings: function(settings, cb) {
            chrome.storage.local.set({ [SETTINGS_KEY]: settings }, cb);
        }
    };
})();