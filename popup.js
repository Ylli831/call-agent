document.getElementById('reset-call-counts-btn').addEventListener('click', async () => {
  // Get the current tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    document.getElementById('status').textContent = 'No active tab found!';
    return;
  }
  chrome.runtime.sendMessage(
    { action: "resetCallCounts" },
    (response) => {
      const status = document.getElementById('status');
      if (response && response.count > 0) {
        status.textContent = `✅ Reset ${response.count} call count${response.count > 1 ? 's' : ''}!`;
      } else {
        status.textContent = 'No call counts found to reset.';
      }
      setTimeout(() => { status.textContent = ''; }, 3000);
    }
  );
});