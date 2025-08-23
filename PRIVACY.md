# Privacy Policy – Call Agent Extension

## Short Summary
This extension collects only minimal runtime telemetry required for its features. All data is stored locally in the browser. It does **not** upload browsing history, personal data, or call logs to any third-party server.

---

## Data Collection and Purpose
- **Call log (`chrome.storage.local`)**  
  - **Data:** timestamps, phone numbers, and lead IDs created when you click `tel:` links.  
  - **Purpose:** used to show per-hour/day call statistics and compute quotas in the popup UI.  
  - **Storage:** kept locally in the user’s browser.  

- **Per-lead call counters (page `localStorage`, keys prefixed `callCount_`)**  
  - **Purpose:** used to display per-lead counters and badge labels on the site UI.  

- **Active tab info**  
  - **Purpose:** used temporarily by popup actions (e.g., clearing per-lead counters).  
  - **Note:** no browsing history or persistent tab data is stored.  

- **Runtime usage (alarms, notifications)**  
  - **Purpose:** used to schedule hourly checks and display alerts locally in the browser.  

---

## Storage & Retention
- All stored data remains in `chrome.storage.local` or the page’s `localStorage`.  
- No data is transmitted to external servers.  
- Data persists until the user clears it via the extension UI (e.g., **Reset log** or **Reset counters**) or uninstalls the extension.  

---

## Sharing & Third Parties
- No data is shared with third parties.  
- No analytics or tracking libraries are bundled.  
- No call logs, counters, or telemetry leave the user’s browser.  

---

## Permissions Required
- **storage** → store logs and settings locally.  
- **scripting, tabs, activeTab** → run small scripts in the active tab only when triggered by the user (e.g., resetting counters).  
- **alarms, notifications** → schedule hourly checks and display local alerts.  
- **host permission (`https://m.planetaltig.com/*`)** → content scripts only run on this site to augment its UI.  

---

## User Controls & Contact
Users can:  
- Clear today’s call log or the full log via the popup.  
- Reset per-lead counters (removes keys starting with `callCount_`).  
- Uninstall the extension to remove all stored data.  

**Contact:** [ylli8822@gmail.com](mailto:ylli8822@gmail.com)  

---

## Legal & Compliance Notes
- No collection of browsing history, geolocation, or personal identifiers beyond phone numbers clicked within the target site.  
- No automated sharing with external parties.  
- If remote telemetry or analytics are introduced in the future, this policy and the Chrome Web Store listing will be updated accordingly.  
