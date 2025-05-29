// Utility and shared variables

const DEBOUNCE_DELAY = 200;

let problematicNumbersCache = new Set();
let problematicNumbersDetails = {}; // phoneNumber: {comment, keyword}
let lastCommentsTextHash = '';
let updateTimeout = null;

const negativeKeywords = [
    'nis', 'wn', 'doesn\'t connect', 'disconnected', 'invalid',
    'not working', 'out of service', 'no longer in service',
    'wrong number', 'not reachable', 'bad number', 'dead line',
    'number not found', 'not available', 'inactive', 'suspended',
    'busy', 'voicemail', 'vm', 'no pickup', 'dnd', 'do not disturb',
    'appointment', 'callback', 'doesnt connect', 'bad no',
];

function hashString(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString();
}

function extractPhoneNumbers(text) {
    const phoneRegex = /\b\d{10}\b/g;
    return text.match(phoneRegex) || [];
}