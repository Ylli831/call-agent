chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetCallCounts") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        func: () => {
          let count = 0;
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('callCount_')) {
              localStorage.removeItem(key);
              count++;
            }
          }
          return count;
        },
      },
      (results) => {
        // results is an array of result objects
        const count = results && results[0] && results[0].result ? results[0].result : 0;
        sendResponse({ count });
      }
    );
    // Tell Chrome this is async
    return true;
  }
});