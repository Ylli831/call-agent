// content-call-tracking.js
// Tracks actual call attempts and manages call counters/badges per phone/lead in chrome.storage.local

(function() {
    const STORAGE_KEY = "callAgentCallLog";

    // Call log functions for overall stats (chrome.storage.local)
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
                timestamp: new Date().toISOString(),
                phone,
                leadId
            });
            setCallLog(log);
        });
    }

    // --- Per-lead, per-phone call count using localStorage ---
    function getCallCount(phoneNumber) {
        const leadId = getCurrentLeadId();
        const storageKey = `callCount_${leadId}_${phoneNumber}`;
        return parseInt(localStorage.getItem(storageKey) || '0');
    }

    function incrementCallCount(phoneNumber) {
        const leadId = getCurrentLeadId();
        const storageKey = `callCount_${leadId}_${phoneNumber}`;
        const currentCount = getCallCount(phoneNumber);
        const newCount = currentCount + 1;
        localStorage.setItem(storageKey, newCount.toString());
        console.log(`Call count for ${phoneNumber}: ${newCount}`);
        return newCount;
    }

    function getCurrentLeadId() {
        // Try to extract LeadId from URL or from button
        const urlMatch = window.location.href.match(/LeadId=(\d+)/i);
        if (urlMatch) return urlMatch[1];
        const button = document.querySelector('[onclick*="LeadId="]');
        if (button) {
            const match = button.getAttribute('onclick').match(/LeadId=(\d+)/i);
            if (match) return match[1];
        }
        return 'unknown';
    }

    // --- UI Badges and Button Appearance ---
    function addCallTrackingBadges() {
        const phoneLinks = document.querySelectorAll('[href^="tel:"]');
        phoneLinks.forEach(phoneLink => {
            const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');
            if (phoneLink.dataset.callCounterProcessed === "yes") return;
            phoneLink.dataset.callCounterProcessed = "yes";

            const callCount = getCallCount(phoneNumber);

            const phoneRow = phoneLink.closest('.clearfix, .m-b-sm, .row, div');
            if (phoneRow) {
                const phoneNumberDiv = phoneRow.querySelector('.col-xs-7, .col-md-7, div:first-child');
                if (phoneNumberDiv && !phoneNumberDiv.querySelector(`.call-counter#counter-${phoneNumber}`)) {
                    const counterSpan = document.createElement('span');
                    counterSpan.className = 'call-counter';
                    counterSpan.id = `counter-${phoneNumber}`;
                    let counterText = '';
                    let counterClass = '';

                    if (callCount === 0) {
                        counterText = '📞 0 calls';
                        counterClass = 'counter-zero';
                    } else if (callCount === 1) {
                        counterText = '📞 1 call - CALL AGAIN';
                        counterClass = 'counter-one';
                    } else if (callCount >= 2) {
                        counterText = `📞 ${callCount} calls - DONE`;
                        counterClass = 'counter-done';
                    }
                    counterSpan.innerHTML = counterText;
                    counterSpan.className = `call-counter ${counterClass}`;
                    phoneNumberDiv.appendChild(counterSpan);
                }
            }
            updateCallButtonAppearance(phoneLink, callCount);
        });
    }

    function updateCallButtonAppearance(phoneLink, callCount) {
        if (callCount === 0) {
            phoneLink.style.backgroundColor = '#28a745';
            phoneLink.style.color = '#fff';
            phoneLink.innerHTML = 'Call (0)';
        } else if (callCount === 1) {
            phoneLink.style.backgroundColor = '#ffc107';
            phoneLink.style.color = '#000';
            phoneLink.innerHTML = 'Call Again (1)';
        } else if (callCount >= 2) {
            phoneLink.style.backgroundColor = '#6c757d';
            phoneLink.style.color = '#fff';
            phoneLink.innerHTML = `Done (${callCount})`;
        }
    }

    function updateCallTrackingDisplay(phoneNumber, callCount) {
        const counterElement = document.getElementById(`counter-${phoneNumber}`);
        const phoneLink = document.querySelector(`[href="tel:${phoneNumber}"]`);
        if (counterElement) {
            let counterText = '';
            let counterClass = '';
            if (callCount === 1) {
                counterText = '📞 1 call - CALL AGAIN';
                counterClass = 'counter-one';
            } else if (callCount >= 2) {
                counterText = `📞 ${callCount} calls - DONE`;
                counterClass = 'counter-done';
            }
            counterElement.innerHTML = counterText;
            counterElement.className = `call-counter ${counterClass}`;
        }
        if (phoneLink) {
            updateCallButtonAppearance(phoneLink, callCount);
        }
    }

    function setupCallTracking() {
        const phoneLinks = document.querySelectorAll('[href^="tel:"]');
        phoneLinks.forEach(phoneLink => {
            if (phoneLink.dataset.trackingSetup === "yes") return;
            phoneLink.dataset.trackingSetup = "yes";

            const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');

            phoneLink.addEventListener('click', function(e) {
                if (e.defaultPrevented) return;
                // --- Log call for global stats ---
                let leadId = getCurrentLeadId();
                addCall(phoneNumber, leadId);
                // --- Increment per-lead/phone call counter ---
                const newCount = incrementCallCount(phoneNumber);
                setTimeout(() => {
                    updateCallTrackingDisplay(phoneNumber, newCount);
                }, 100);
            });
        });
    }

    // --- Initialize on DOMContentLoaded or after AJAX updates ---
    function runTracking() {
        setupCallTracking();
        addCallTrackingBadges();
    }

    // Initial load
    document.addEventListener("DOMContentLoaded", runTracking);
    // In case of AJAX navigation, you may want to run this periodically or hook into your SPA router
    setInterval(runTracking, 2000);

    // Optional: expose API for debugging
    window.CallAgentCallTracking = {
        getCallLog,
        setCallLog,
        clearCallLog: (cb) => setCallLog([], cb),
        getCallCount,
        incrementCallCount
    };
})();