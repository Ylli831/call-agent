(function injectFilterPresets() {
    // Wait until filter is present
    function ready() {
      return !!document.getElementById('inbox-filter');
    }
    if (!ready()) {
      let interval = setInterval(() => {
        if (ready()) {
          clearInterval(interval);
          inject();
        }
      }, 400);
    } else {
      inject();
    }
  
    function inject() {
      // ---- 1. Define your presets here! ----
      const presets = [
        {
          name: "Timezone + Policy Owner Service",
          fields: {
            ddlSortItemList: "12", // Timezone
            ddlLeadTypeId: "3",    // Policy Owner Service
          }
        },
        {
          name: "Set Appt. & Seniors",
          fields: {
            ddlCallStatus: "3", // Set Appointment
            ddlSeniorLeads: "65" // Seniors
          }
        },
        {
          name: "Drop By + In Town",
          fields: {
            ddlCallStatus: "4", // Drop By
            ddlBankTypeId: "1"  // In Town Lead Pool
          }
        },
        // Add as many as you want!
      ];
  
      // ---- 2. Build preset selector UI ----
      const filterHeader = document.getElementById('CollapseButton');
      const presetDiv = document.createElement('div');
      presetDiv.style = "margin:6px 0 8px 0;text-align:right;";
      presetDiv.innerHTML = `
        <label style="font-weight:600;margin-right:7px;">Presets:</label>
        <select id="filterPresetSelect" style="padding:3px 8px;border-radius:6px;">
          <option value="">Choose preset...</option>
          ${presets.map((p, idx) => `<option value="${idx}">${p.name}</option>`).join("")}
        </select>
        <button id="applyPresetBtn" style="margin-left:5px;padding:3px 14px;border-radius:6px;border:1px solid #4c89ff;background:#4c89ff;color:#fff;font-weight:600;">Apply</button>
      `;
      // Insert before filter header (or wherever you like)
      filterHeader.parentElement.insertBefore(presetDiv, filterHeader);
  
      // ---- 3. Apply preset logic ----
      document.getElementById('applyPresetBtn').onclick = function() {
        const idx = document.getElementById('filterPresetSelect').value;
        if (idx === "") return;
        const fields = presets[idx].fields;
        for (const key in fields) {
          let el = document.getElementById(key);
          if (!el) continue;
          el.value = fields[key];
          // For selects, trigger change if needed
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Optionally: Click the Search button!
        setTimeout(() => {
          const btn = document.getElementById('btnSearch');
          if (btn) btn.click();
        }, 150);
      };
    }
  })();