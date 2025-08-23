Short summary
This extension collects only minimal runtime telemetry required for its features and keeps all data locally in the browser. It does not upload browsing history, personal data, or call logs to any third-party server.

What data is collected and why
call log (stored in chrome.storage.local): timestamps, phone numbers, and lead IDs created when you click tel: links. Used only to show per-hour/day call statistics and to compute quotas in the popup UI. Data stays in the user's browser.
per-lead call counters (stored in the site page's localStorage, keys prefixed callCount_): used only to show per-lead counters and badge labels on the site UI.
active tab info: used only temporarily by popup actions that run a small script on the active tab (for example, to remove per-lead keys from the page localStorage when you click “Reset counters”). The extension does not collect or persist full browser history.
runtime usage (alarms/notifications): used only to schedule hourly checks and to display alerts locally in the browser.
Storage & retention
All stored data is kept locally in the browser (chrome.storage.local or page localStorage). No data is sent to external servers by the extension.
Users can reset or clear stored data via the extension UI (Reset log / Reset counters).
Data persists until the user clears it or uses the extension UI to remove it.
Sharing and third parties
This extension does not share data with third parties and does not transmit call logs or local counters to any external servers.
The extension bundles no analytics libraries that send data externally.
Permissions required (explanation)
storage — to store the call log and settings locally.
scripting, tabs, activeTab — to run small page-context scripts on the active tab when the user triggers actions (for example, resetting per-lead counters). These are used only on the matched host and only when the popup or user action triggers them.
alarms, notifications — to schedule hourly checks and display local notifications.
host permission (https://m.planetaltig.com/*) — content scripts only run on this host so the extension can augment the site UI; extension cannot read other sites.
User controls & contact
Users can:
Clear today's call log or the full log via the popup (Export/Reset options).
Reset per-lead counters (removes keys starting with callCount_ from the page localStorage).
Uninstall the extension to remove all local data.
Contact: add your support email here (example): support@yourdomain.example (replace with a reachable address).
Legal and compliance notes
No collection of browsing history, location, or personal identifiers beyond the phone numbers the user clicks in the target site.
No automated sharing with external parties.
If you plan to add any remote telemetry or analytics in the future, update this declaration and the store listing accordingly.
How to certify in the Chrome Web Store

Open your item in the Chrome Web Store Developer Dashboard.
Go to the Privacy practices tab (or the equivalent in the publishing flow).
Paste the text above into the “Privacy practices” or “Detailed description” field.
Make sure the permission checkboxes reflect only the permissions you request (storage, tabs/activeTab/scripting, alarms, notifications, host_permissions for the target site).
Provide your contact email and a link to a hosted privacy policy if you have one (recommended).
Save and complete the certification questions.
