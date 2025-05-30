// content-call-tracking.js
// Tracks every call attempt with timestamp, number, and leadID in localStorage
(function() {
    const STORAGE_KEY = "callAgentCallLog";
    const SETTINGS_KEY = "callAgentSettings";
    // Call log is an array of {timestamp, phone, leadId}
    function getCallLog() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    function setCallLog(log) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    }
    function addCall(phone, leadId) {
        const log = getCallLog();
        log.push({ 
            timestamp: Date.now(), 
            phone, 
            leadId 
        });
        setCallLog(log);
    }
    // Listen for call button presses (tel: links or known action buttons)
    document.addEventListener("click", function(e) {
        let tgt = e.target.closest("a[href^='tel:'], a[onclick*='UpdateCallStatus'], a[onclick*='ResolveAppointment']");
        if (tgt) {
            // Try to extract phone number
            let phone = tgt.getAttribute("href");
            if (phone && phone.startsWith("tel:")) {
                phone = phone.replace("tel:", "").replace(/\D/g, "");
            } else {
                // fallback, try to find phone in text
                phone = (tgt.textContent.match(/\d{10,}/) || [])[0] || "unknown";
            }
            // Try to extract leadId from URL or onclick
            let leadId = "unknown";
            let url = tgt.getAttribute("href") || "";
            let onclick = tgt.getAttribute("onclick") || "";
            let match = url.match(/leadid=(\d+)/i) || onclick.match(/(\d{6,})/g);
            if (match) leadId = Array.isArray(match) ? match[0] : match[1];
            addCall(phone, leadId);
            window.dispatchEvent(new CustomEvent('CallAgent:callLogged'));
        }
    });

    // Expose API for dashboard/popup via window
    window.CallAgentCallTracking = {
        getCallLog, setCallLog,
        clearCallLog: function() { setCallLog([]); },
        getSettings: function() {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {
                hourlyQuota: 120,
                dailyHours: 8,
                workStartHour: 18, // 24h format
            };
        },
        setSettings: function(settings) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        }
    };
})();