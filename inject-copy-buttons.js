function injectCopyButtons() {
    // Only target numbers in .multi-numbers .col-xs-7 (gray bar)
    document.querySelectorAll('.multi-numbers .col-xs-7').forEach(col => {
        // Find the first text node that looks like a phone number
        const children = Array.from(col.childNodes);
        const textNode = children.find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().match(/^\d{7,}$/));
        if (!textNode) return;

        // Don't add if already present
        if (col.querySelector('.copy-phone-btn')) return;

        const btn = createCopyBtn(textNode.textContent.trim());

        // Find the first element node after the text node (icon, badge etc.)
        let insertBeforeNode = null;
        for (let i = children.indexOf(textNode) + 1; i < children.length; i++) {
            if (children[i].nodeType === Node.ELEMENT_NODE) {
                insertBeforeNode = children[i];
                break;
            }
        }
        if (insertBeforeNode) {
            col.insertBefore(btn, insertBeforeNode);
        } else {
            col.appendChild(btn);
        }
    });
}

const clipboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" style="vertical-align:middle" viewBox="0 0 16 16"><rect x="4" y="3" width="8" height="11" rx="1.5" fill="#fff" stroke="#444"/><rect x="6" y="1.5" width="4" height="3" rx="1" fill="#eee" stroke="#444"/></svg>`;

function createCopyBtn(number) {
    const btn = document.createElement('button');
    btn.className = 'copy-phone-btn';
    btn.title = 'Copy number to clipboard';
    btn.innerHTML = clipboardSvg;
    btn.style.marginLeft = '8px';
    btn.style.fontSize = '12px';
    btn.style.padding = '2px 6px';
    btn.style.cursor = 'pointer';
    btn.style.background = '#fff';
    btn.style.border = '1px solid #bbb';
    btn.style.borderRadius = '3px';
    btn.onclick = function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(number).then(() => {
            btn.innerHTML = '✅';
            setTimeout(() => { btn.innerHTML = clipboardSvg; }, 1200);
        });
    };
    return btn;
}

function injectCopyBtnStyle() {
    if (document.getElementById('copy-phone-btn-style')) return;
    const style = document.createElement('style');
    style.id = 'copy-phone-btn-style';
    style.textContent = `
        .copy-phone-btn {
            margin-left: 8px;
            font-size: 12px;
            padding: 2px 6px;
            cursor: pointer;
            background: #fff;
            border: 1px solid #bbb;
            border-radius: 3px;
            transition: background .2s;
            display: inline-block;
            vertical-align: middle;
        }
        .copy-phone-btn:hover {
            background: #e0e0e0;
        }
        .copy-phone-btn svg {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// Run on load
injectCopyBtnStyle();
injectCopyButtons();

// Set up observer (only on .multi-numbers for performance)
function startPhoneDivObserver() {
    const phoneDiv = document.querySelector('.multi-numbers');
    if (!phoneDiv) return;
    if (window.copyBtnObserver) {
        window.copyBtnObserver.disconnect();
    }
    window.copyBtnObserver = new MutationObserver(() => {
        injectCopyButtons();
    });
    window.copyBtnObserver.observe(phoneDiv, {childList: true, subtree: true});
}

// Observe when .multi-numbers is added to DOM
const observerInit = new MutationObserver(() => {
    startPhoneDivObserver();
    injectCopyButtons();
});
observerInit.observe(document.body, {childList: true, subtree: true});

// For initial load
startPhoneDivObserver();