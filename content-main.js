// Main entrypoint

function updatePhoneChecker() {
    markProblematicNumbers();
    addCallTrackingBadges();
    setupCallTracking();
    addAutoPaginationButtons();
    checkAutoPagination();
}

function debouncedUpdatePhoneChecker() {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updatePhoneChecker, DEBOUNCE_DELAY);
}

// Initial feature calls
function clickCallButton() {
    const callButton = document.querySelector('.fa.f-18.fa-phone');
    if (callButton) {
        callButton.click();
        console.log('Call button clicked');
    }
}

function observeOkButton() {
    const observer = new MutationObserver(() => {
        const okBtn = document.querySelector('.btn.btn-primary[data-bb-handler="ok"]');
        if (okBtn && okBtn.offsetParent !== null) {
            okBtn.click();
            console.log('OK button clicked');
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function clickArrowDown() {
    const arrow = document.querySelector('.fa.fa-arrow-right');
    if (arrow) {
        arrow.click();
        console.log('Arrow down clicked');
    } else {
        setTimeout(clickArrowDown, 300);
    }
}

function closePopUp() {
    const popup = document.querySelector('.btn.btn-secondary');
    if (popup) {
        popup.click();
        console.log('Pop up clicked');
    } else {
        setTimeout(closePopUp, 300);
    }
}

// DOMContentLoaded and page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        debouncedUpdatePhoneChecker();
        checkAutoPaginationAfterLoad();
    });
} else {
    debouncedUpdatePhoneChecker();
    checkAutoPaginationAfterLoad();
}

// Mutation observer to keep things up-to-date
const observer = new MutationObserver(() => {
    debouncedUpdatePhoneChecker();
});
observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
});

window.addEventListener('pageshow', function() {
    autoPaginatedThisLoad = false;
});

clickCallButton();
observeOkButton();
clickArrowDown();
closePopUp();

console.log('Optimized Auto Call & Phone Checker with Call Tracking loaded!');