// Problematic number detection and banner

function findProblematicNumbersCached() {
    const commentSelectors = [
        '.inner-schedule',
        '.inner-schedule-list div',
        '#Bar div',
        '.collapse div',
        '[class*="comment"]',
        '[class*="schedule"]'
    ];
    let commentsText = '';
    problematicNumbersDetails = {}; // reset on each scan
    commentSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(e => {
            commentsText += (e.textContent || '') + '||';
        });
    });
    const textHash = hashString(commentsText);

    if (textHash === lastCommentsTextHash && problematicNumbersCache.size > 0) {
        return problematicNumbersCache;
    }
    lastCommentsTextHash = textHash;

    const problematicNumbers = new Set();
    commentSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            const commentText = element.textContent || element.innerText;
            const matchedKeyword = negativeKeywords.find(keyword => commentText.toLowerCase().includes(keyword));
            if (matchedKeyword) {
                extractPhoneNumbers(commentText).forEach(number => {
                    problematicNumbers.add(number);
                    problematicNumbersDetails[number] = {comment: commentText.trim(), keyword: matchedKeyword};
                });
                document.querySelectorAll('[href^="tel:"]').forEach(phoneLink => {
                    const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');
                    const lastFour = phoneNumber.slice(-4);
                    const lastFive = phoneNumber.slice(-5);
                    if (commentText.includes(lastFour) || commentText.includes(lastFive)) {
                        problematicNumbers.add(phoneNumber);
                        problematicNumbersDetails[phoneNumber] = {comment: commentText.trim(), keyword: matchedKeyword || 'number match'};
                    }
                });
            }
        });
    });
    problematicNumbersCache = problematicNumbers;
    return problematicNumbers;
}

function markProblematicNumbers() {
    const problematicNumbers = findProblematicNumbersCached();
    if (problematicNumbers.size === 0) {
        document.querySelectorAll('.phone-problematic').forEach(row => row.classList.remove('phone-problematic'));
        document.querySelectorAll('.warning-indicator').forEach(indicator => indicator.remove());
        const summary = document.getElementById('phone-status-summary');
        if (summary) summary.remove();
        return;
    }
    addWarningStyles();

    document.querySelectorAll('[href^="tel:"]').forEach(phoneLink => {
        const phoneNumber = phoneLink.getAttribute('href').replace('tel:', '');
        if (!problematicNumbers.has(phoneNumber)) return;
        if (phoneLink.dataset.problematicMarked === "yes") return;
        phoneLink.dataset.problematicMarked = "yes";

        const phoneRow = phoneLink.closest('.clearfix, .m-b-sm, .row, div');
        if (phoneRow) {
            phoneRow.classList.add('phone-problematic');
            const phoneNumberDiv = phoneRow.querySelector('.col-xs-7, .col-md-7, div:first-child');
            if (phoneNumberDiv && !phoneNumberDiv.querySelector('.warning-indicator')) {
                const warningSpan = document.createElement('span');
                warningSpan.className = 'warning-indicator';
                warningSpan.innerHTML = '⚠️ BAD';
                const details = problematicNumbersDetails[phoneNumber];
                if (details) {
                    warningSpan.title = `Flagged by: "${details.keyword}"\n\nComment: ${details.comment}`;
                } else {
                    warningSpan.title = 'This number has negative comments - check before calling';
                }
                phoneNumberDiv.appendChild(warningSpan);
            }
        }
        phoneLink.style.backgroundColor = '#dc3545';
        phoneLink.style.borderColor = '#dc3545';
        phoneLink.style.color = 'white';
        phoneLink.title = 'WARNING: This number has negative comments';
        if (!phoneLink.dataset.problematicOnclick) {
            const originalOnClick = phoneLink.onclick;
            phoneLink.onclick = function(e) {
                if (!confirm('⚠️ WARNING: This number has negative comments indicating it may not work.\n\nDo you still want to call?')) {
                    e.preventDefault();
                    return false;
                }
                if (originalOnClick) return originalOnClick.call(this, e);
            };
            phoneLink.dataset.problematicOnclick = "yes";
        }
    });

    addSummaryNotification(problematicNumbers);
}

function addSummaryNotification(problematicNumbers) {
    let phoneDiv = document.querySelector('#PhoneDivShow, .multi-numbers, [class*="phone"]');
    if (!phoneDiv) phoneDiv = document.body;

    const old = document.getElementById('phone-status-summary');
    if (old) old.remove();

    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'phone-status-summary';
    let flaggedList = "";
    // let count = 0;   // <-- REMOVE THIS LINE
    // Use problematicNumbers.size for the count
    for (const [number, details] of Object.entries(problematicNumbersDetails)) {
        if (problematicNumbers.has(number)) {
            flaggedList += `<li><strong>${number}</strong> &mdash; <b>${details.keyword}</b>: <span style="color:#444">${details.comment.replace(/</g,"&lt;").substring(0,80)}${details.comment.length>80?'...':''}</span></li>`;
        }
    }

    const count = problematicNumbers.size; // <-- FIX: Use set size for accuracy

    summaryDiv.innerHTML = `
        <span style="font-size:17px; font-weight:700; color:#d32f2f;">
            &#9888; Warning: ${count} number(s) flagged as problematic
        </span>
        <ul>${flaggedList}</ul>
    `;
    summaryDiv.style.margin = '10px 0 10px 0';
    summaryDiv.style.zIndex = '10000';
    summaryDiv.style.position = 'relative';

    phoneDiv.insertBefore(summaryDiv, phoneDiv.firstChild);
}

function addWarningStyles() {
    if (document.getElementById('phone-warning-styles')) return;
    const style = document.createElement('style');
    style.id = 'phone-warning-styles';
    style.textContent = `
        .phone-problematic {
            background-color: #ffebee !important;
            border: 2px solid #f44336 !important;
            border-radius: 4px !important;
            padding: 5px !important;
            animation: warningPulse 2s infinite;
        }
        .warning-indicator {
            color: #d32f2f !important;
            font-weight: bold !important;
            font-size: 11px !important;
            background-color: #ffcdd2 !important;
            padding: 2px 6px !important;
            border-radius: 3px !important;
            margin-left: 8px !important;
            animation: blink 1.5s infinite;
        }
        .call-counter {
            font-size: 10px !important;
            font-weight: bold !important;
            padding: 2px 6px !important;
            border-radius: 3px !important;
            margin-left: 8px !important;
            display: inline-block !important;
        }
        .counter-zero {
            background-color: #e8f5e8 !important;
            color: #2e7d2e !important;
            border: 1px solid #4caf50 !important;
        }
        .counter-one {
            background-color: #fff3cd !important;
            color: #856404 !important;
            border: 1px solid #ffc107 !important;
            animation: pulse 1.5s infinite;
        }
        .counter-done {
            background-color: #f8f9fa !important;
            color: #6c757d !important;
            border: 1px solid #dee2e6 !important;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        #phone-status-summary {
            background-color: #fff3cd !important;
            border: 1.5px solid #ffeaa7 !important;
            border-radius: 4px !important;
            padding: 10px 16px !important;
            margin-bottom: 10px !important;
            margin-top: 5px !important;
            box-shadow: 0 1px 8px 0 rgba(80,80,10,0.15);
            /* animation: slideIn 0.5s ease-in-out; */
            font-size: 15px !important;
            max-width: 600px;
            float: right;
            clear: both;
        }
        #phone-status-summary ul {
            padding-left: 18px;
            margin: 5px 0 0 0;
        }
        #phone-status-summary li {
            font-size: 13px;
            margin-bottom: 3px;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}