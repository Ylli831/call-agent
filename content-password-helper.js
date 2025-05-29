if (window.location.pathname === "/Account/Login") {
    addVaultPanel();
  }
  
  function addVaultPanel() {
    // Find form
    const loginForm = document.querySelector('form[action="/Account/Login"]');
    if (!loginForm) return;
  
    // Remove if already exists
    if (document.getElementById('vault-helper-panel')) {
      document.getElementById('vault-helper-panel').remove();
    }
  
    // Create panel
    const panel = document.createElement('div');
    panel.id = 'vault-helper-panel';
    panel.innerHTML = `
      <style>
        #vault-helper-panel {
          display: flex;
          justify-content: center;
          margin-top: 12px;
          margin-bottom: 8px;
          width: 100%;
        }
        #vault-helper-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          padding: 12px 14px 10px 14px;
          min-width: 280px;
          max-width: 340px;
          margin: 0 auto;
          font-family: inherit;
        }
        #vault-helper-card h5 {
          margin: 0 0 6px 0;
          font-weight: 700;
          font-size: 16px;
          color: #313a4d;
          letter-spacing: 0.01em;
          text-align: center;
        }
        #vault-helper-card input[type="text"],
        #vault-helper-card input[type="password"] {
          width: 100%;
          padding: 5px 31px 5px 7px;
          margin-bottom: 4px;
          border: 1px solid #d3d7e0;
          border-radius: 6px;
          font-size: 13px;
          background: #f5f7fa;
          transition: border 0.16s;
          box-sizing: border-box;
        }
        #vault-helper-card input[type="text"]:focus,
        #vault-helper-card input[type="password"]:focus {
          border: 1.3px solid #4c89ff;
          outline: none;
          background: #fff;
        }
        #vault-helper-card .input-group {
          position: relative;
        }
        #vault-helper-card .eye-toggle {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: none;
          cursor: pointer;
          padding: 2px;
          font-size: 16px;
          color: #8d98b7;
          z-index: 2;
        }
        #vault-helper-card button.vault-btn {
          font-size: 13px;
          border: none;
          background: #4c89ff;
          color: #fff;
          border-radius: 6px;
          padding: 5px 0;
          width: 100%;
          font-weight: 600;
          margin-bottom: 7px;
          transition: background 0.15s;
        }
        #vault-helper-card button.vault-btn:hover {
          background: #2566d6;
        }
        #vault-entries {
          margin-top: 4px;
          max-height: 205px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #d3d7e0 #f8f8f8;
        }
        .vault-entry {
          background: #f2f7ff;
          border-radius: 6px;
          padding: 5px 7px 5px 7px;
          margin-bottom: 4px;
          box-shadow: 0 1px 3px rgba(76,137,255,0.04);
          font-size: 13px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 32px;
        }
        .vault-entry label {
          font-weight: 600;
          color: #3b4d78;
          margin: 0 8px 0 0;
          min-width: 48px;
          flex-shrink: 0;
          font-size: 13px;
        }
        .vault-entry .entry-input-group {
          position: relative;
          display: flex;
          gap: 3px;
          align-items: center;
          flex-shrink: 1;
          flex-grow: 1;
        }
        .vault-entry input[type="text"],
        .vault-entry input[type="password"] {
          border-radius: 5px;
          background: #fff;
          border: 1px solid #d3d7e0;
          font-size: 13px;
          padding: 3px 24px 3px 5px;
          margin-bottom: 0;
          width: 72px;
        }
        .vault-entry .eye-toggle {
          right: 4px;
          font-size: 14px;
          color: #8d98b7;
          padding: 1px 2px;
        }
        .vault-entry .edit-btn, .vault-entry .fill-btn, .vault-entry .delete-btn {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          margin-left: 1.5px;
          padding: 1px 3px;
          border-radius: 4px;
          transition: background 0.13s;
        }
        .vault-entry .edit-btn:hover   { background: #e8effc; }
        .vault-entry .fill-btn:hover   { background: #e8f7ec; }
        .vault-entry .delete-btn:hover { background: #fff2f2; }
        #vault-helper-card small {
          color: #97a3b9;
          display: block;
          margin-top: 3px;
          text-align: center;
          font-size: 12px;
        }
        @media (max-width: 500px) {
          #vault-helper-card { min-width: unset; width: 97vw; }
        }
      </style>
      <div id="vault-helper-card">
        <h5>🔑 My Vault</h5>
        <div style="margin-bottom:4px;">
          <input id="vault-label" type="text" placeholder="Label (e.g. Altig)">
          <input id="vault-username" type="text" placeholder="Username">
          <div class="input-group">
            <input id="vault-password" type="password" placeholder="Password">
            <button type="button" tabindex="-1" class="eye-toggle" id="main-eye-toggle" aria-label="Show/Hide password">
              <svg width="17" height="17" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#8d98b7"/></svg>
            </button>
          </div>
          <button id="vault-add" type="button" class="vault-btn">➕ Add Entry</button>
        </div>
        <div id="vault-entries"></div>
        <small>Stored in your browser only.</small>
      </div>
    `;
    panel.style.width = '100%';
  
    // Insert panel BELOW the login form, restoring original order
    loginForm.parentElement.insertBefore(panel, loginForm.nextSibling);
  
    // Eye toggle for main password input
    panel.querySelector('#main-eye-toggle').onclick = function () {
      const pwd = panel.querySelector('#vault-password');
      pwd.type = pwd.type === "password" ? "text" : "password";
      this.innerHTML = pwd.type === "password"
        ? `<svg width="17" height="17" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#8d98b7"/></svg>`
        : `<svg width="17" height="17" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#4c89ff"/></svg>`;
    };
  
    // Add Entry
    panel.querySelector('#vault-add').onclick = function () {
      const label = panel.querySelector('#vault-label').value.trim();
      const username = panel.querySelector('#vault-username').value.trim();
      const password = panel.querySelector('#vault-password').value;
      if (!label) return alert("Label required!");
      chrome.storage.local.get(['vaultEntries'], data => {
        const entries = Array.isArray(data.vaultEntries) ? data.vaultEntries : [];
        entries.push({ label, username, password });
        chrome.storage.local.set({ vaultEntries: entries }, renderEntries);
        panel.querySelector('#vault-label').value = "";
        panel.querySelector('#vault-username').value = "";
        panel.querySelector('#vault-password').value = "";
      });
    };
  
    // Render Entries
    function renderEntries() {
      chrome.storage.local.get(['vaultEntries'], data => {
        const entries = Array.isArray(data.vaultEntries) ? data.vaultEntries : [];
        const container = panel.querySelector('#vault-entries');
        container.innerHTML = "";
        entries.forEach((entry, idx) => {
          const div = document.createElement('div');
          div.className = "vault-entry";
          div.innerHTML = `
            <label>${entry.label}</label>
            <div class="entry-input-group">
              <input type="text" value="${entry.username}" id="user-${idx}" autocomplete="off" placeholder="Username">
            </div>
            <div class="entry-input-group">
              <input type="password" value="${entry.password}" id="pass-${idx}" autocomplete="off" placeholder="Password">
              <button type="button" tabindex="-1" class="eye-toggle" aria-label="Show/Hide password" id="eye-toggle-${idx}">
                <svg width="15" height="15" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#8d98b7"/></svg>
              </button>
            </div>
            <button data-edit="${idx}" class="edit-btn" title="Save changes">💾</button>
            <button data-autofill="${idx}" class="fill-btn" title="Autofill">⚡</button>
            <button data-delete="${idx}" class="delete-btn" title="Delete">❌</button>
          `;
          container.appendChild(div);
  
          // Eye toggle for entry password
          div.querySelector(`#eye-toggle-${idx}`).onclick = function () {
            const pwd = div.querySelector(`#pass-${idx}`);
            pwd.type = pwd.type === "password" ? "text" : "password";
            this.innerHTML = pwd.type === "password"
              ? `<svg width="15" height="15" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#8d98b7"/></svg>`
              : `<svg width="15" height="15" viewBox="0 0 22 22" fill="none"><path d="M11 5C5.25 5 2 11 2 11s3.25 6 9 6 9-6 9-6-3.25-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="#4c89ff"/></svg>`;
          };
  
          // Edit
          div.querySelector(`[data-edit="${idx}"]`).onclick = function () {
            const newUser = div.querySelector(`#user-${idx}`).value;
            const newPass = div.querySelector(`#pass-${idx}`).value;
            entries[idx].username = newUser;
            entries[idx].password = newPass;
            chrome.storage.local.set({ vaultEntries: entries }, renderEntries);
          };
  
          // Autofill
          div.querySelector(`[data-autofill="${idx}"]`).onclick = function () {
            if (document.getElementById('Alias')) document.getElementById('Alias').value = entry.username;
            if (document.getElementById('Password')) document.getElementById('Password').value = entry.password;
          };
  
          // Delete
          div.querySelector(`[data-delete="${idx}"]`).onclick = function () {
            entries.splice(idx, 1);
            chrome.storage.local.set({ vaultEntries: entries }, renderEntries);
          };
        });
        if (entries.length === 0) container.innerHTML = "<i style='color:#b4bcd2;'>No saved entries yet.</i>";
      });
    }
    renderEntries();
  }