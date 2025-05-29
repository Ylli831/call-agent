// Auto-pagination logic

function addAutoPaginationButtons() {
    const paginationParent = document.querySelector('.col-xs-4.pdlft0p .pull-right');
    if (!paginationParent) return;

    if (document.getElementById('auto-prev-toggle') || document.getElementById('auto-next-toggle')) return;

    const btns = paginationParent.querySelectorAll('button.btn-primary');
    if (btns.length < 2) return;

    const prevBtn = btns[0];
    const nextBtn = btns[1];

    const autoPrevBtn = document.createElement('button');
    autoPrevBtn.id = 'auto-prev-toggle';
    autoPrevBtn.textContent = '⏮️ Auto Prev';
    autoPrevBtn.className = 'btn btn-sm';
    autoPrevBtn.style.marginRight = '7px';
    autoPrevBtn.style.fontWeight = 'bold';
    autoPrevBtn.style.background = localStorage.getItem('autoPrevEnabled') === 'true' ? '#ffc107' : '#eee';

    const autoNextBtn = document.createElement('button');
    autoNextBtn.id = 'auto-next-toggle';
    autoNextBtn.textContent = 'Auto Next ⏭️';
    autoNextBtn.className = 'btn btn-sm';
    autoNextBtn.style.marginLeft = '7px';
    autoNextBtn.style.fontWeight = 'bold';
    autoNextBtn.style.background = localStorage.getItem('autoNextEnabled') === 'true' ? '#ffc107' : '#eee';

    autoPrevBtn.onclick = () => {
        const enabled = localStorage.getItem('autoPrevEnabled') === 'true';
        localStorage.setItem('autoPrevEnabled', !enabled);
        autoPrevBtn.style.background = !enabled ? '#ffc107' : '#eee';
        if (!enabled) {
            localStorage.setItem('autoNextEnabled', false);
            autoNextBtn.style.background = '#eee';
        }
    };
    autoNextBtn.onclick = () => {
        const enabled = localStorage.getItem('autoNextEnabled') === 'true';
        localStorage.setItem('autoNextEnabled', !enabled);
        autoNextBtn.style.background = !enabled ? '#ffc107' : '#eee';
        if (!enabled) {
            localStorage.setItem('autoPrevEnabled', false);
            autoPrevBtn.style.background = '#eee';
        }
    };

    paginationParent.insertBefore(autoPrevBtn, prevBtn);
    paginationParent.insertBefore(autoNextBtn, nextBtn.nextSibling);
}

function checkAutoPagination() {
    const callCounters = Array.from(document.querySelectorAll('.call-counter'));
    if (!callCounters.length) return;

    const allDone = callCounters.every(el => el.textContent.includes('calls - DONE'));
    if (!allDone) return;

    if (localStorage.getItem('autoNextEnabled') === 'true') {
        const nextBtn = document.querySelector('.col-xs-4.pdlft0p .pull-right button.btn-primary:nth-of-type(2)');
        if (nextBtn) nextBtn.click();
    } else if (localStorage.getItem('autoPrevEnabled') === 'true') {
        const prevBtn = document.querySelector('.col-xs-4.pdlft0p .pull-right button.btn-primary:nth-of-type(1)');
        if (prevBtn) prevBtn.click();
    }
}

let autoPaginatedThisLoad = false;

function simulateButtonClick(btn) {
    if (!btn) return;
    btn.click();
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
}

function checkAutoPaginationAfterLoad() {
    if (autoPaginatedThisLoad) return;
    let waited = 0;
    function check() {
        if (autoPaginatedThisLoad) return;
        const callCounters = Array.from(document.querySelectorAll('.call-counter'));
        if (!callCounters.length) {
            waited += 500;
            if (waited < 3000) setTimeout(check, 500);
            return;
        }
        const allDone = callCounters.every(el => el.textContent.includes('calls - DONE'));
        if (!allDone) return;
        let btn = null;
        if (localStorage.getItem('autoNextEnabled') === 'true') {
            btn = document.querySelector('.fa-chevron-right')?.closest('button');
            console.log('[AutoPagination] Next button:', btn);
        } else if (localStorage.getItem('autoPrevEnabled') === 'true') {
            btn = document.querySelector('.fa-chevron-left')?.closest('button');
            console.log('[AutoPagination] Prev button:', btn);
        }
        if (btn) {
            autoPaginatedThisLoad = true;
            console.log('[AutoPagination] Clicking button:', btn);
            simulateButtonClick(btn);
        } else {
            console.log('[AutoPagination] Could not find the pagination button.');
        }
    }
    setTimeout(check, 1000);
}

window.addEventListener('pageshow', function() {
    autoPaginatedThisLoad = false;
});