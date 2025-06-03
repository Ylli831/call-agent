// popup.js for Call Agent Extension (using chrome.storage.local everywhere)

// --- Data helpers (shared for all tabs) ---
function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
function getDayKey(ts) {
    const d = new Date(ts);
    return d.toISOString().slice(0,10);
}
function getCallLog(cb) {
    chrome.storage.local.get(['callAgentCallLog'], (result) => {
        cb(result['callAgentCallLog'] ? result['callAgentCallLog'] : []);
    });
}
function setCallLog(log, cb) {
    chrome.storage.local.set({ 'callAgentCallLog': log }, cb);
}
function getSettings(cb) {
    chrome.storage.local.get(['callAgentSettings'], (result) => {
        cb(result['callAgentSettings'] ? result['callAgentSettings'] : {hourlyQuota:120, dailyHours:8, workStartHour:18});
    });
}
function setSettings(s, cb) {
    chrome.storage.local.set({ 'callAgentSettings': s }, cb);
}

// --- Tab switching ---
function showTab(tab) {
    ["overview","hourly","stats","export","settings"].forEach(t => {
        document.getElementById(`tab-${t}`).classList.toggle("active", t === tab);
        document.getElementById(`tab-${t}-content`).classList.toggle("active", t === tab);
    });
}
document.getElementById("tab-overview").onclick = ()=>showTab("overview");
document.getElementById("tab-hourly").onclick = ()=>showTab("hourly");
document.getElementById("tab-stats").onclick = ()=>showTab("stats");
document.getElementById("tab-export").onclick = ()=>showTab("export");
document.getElementById("tab-settings").onclick = ()=>showTab("settings");

// --- Overview tab ---
function renderOverview() {
    getCallLog((all) => {
        getSettings((s) => {
            const now = new Date();
            const today = now.toISOString().slice(0,10);
            const todayLog = all.filter(l => getDayKey(l.timestamp) === today);
            let hours = [];
            for (let h=0; h<s.dailyHours; ++h) hours.push([]);
            todayLog.forEach(l => {
                let date = new Date(l.timestamp);
                let relh = date.getHours() - s.workStartHour;
                if (relh >= 0 && relh < s.dailyHours) hours[relh].push(l);
            });
            let curHourIdx = now.getHours() - s.workStartHour;
            let curHourCalls = (curHourIdx >= 0 && curHourIdx < s.dailyHours) ? hours[curHourIdx].length : 0;
            let totalCalls = todayLog.length;
            let quota = s.hourlyQuota * s.dailyHours;
            let pct = Math.round(100*totalCalls/quota);
            let html = `
                <div>
                    <b>Today:</b> <span style="font-size:17px;">${totalCalls} calls</span> / <span style="color:#1976d2">${quota}</span>
                    <div class="progress-bar"><div class="progress-bar-inner" style="width:${Math.min(100,pct)}%"></div></div>
                    <b>This hour:</b> <span style="font-size:15px;">${curHourCalls} calls</span> / <span style="color:#1976d2">${s.hourlyQuota}</span>
                    <div class="progress-bar" style="height:12px;"><div class="progress-bar-inner" style="background:${curHourCalls >= s.hourlyQuota ? "#388e3c" : "#e53935"};width:${Math.min(100,Math.round(100*curHourCalls/s.hourlyQuota))}%"></div></div>
                    <div style="color:#888;margin-top:7px;">Shift: ${s.workStartHour}:00 &ndash; ${s.workStartHour+s.dailyHours}:00</div>
                    <div style="margin-top:12px;">
                        <span style="color:#388e3c;font-weight:bold;">${pct >= 100 ? "🎉 Quota met!" : ""}</span>
                        <span class="warning">${pct < 100 && totalCalls > 0 && (s.hourlyQuota * (curHourIdx + 1) > totalCalls) ? "Behind Schedule!" : ""}</span>
                    </div>
                </div>
            `;
            document.getElementById("overview-summary").innerHTML = html;
        });
    });
}

// --- Hourly tab ---
function renderHourly() {
    getCallLog((all) => {
        getSettings((s) => {
            const now = new Date();
            const today = now.toISOString().slice(0,10);
            const todayLog = all.filter(l => getDayKey(l.timestamp) === today);
            let hours = [];
            for (let h=0; h<s.dailyHours; ++h) hours.push([]);
            todayLog.forEach(l => {
                let date = new Date(l.timestamp);
                let relh = date.getHours() - s.workStartHour;
                if (relh >= 0 && relh < s.dailyHours) hours[relh].push(l);
            });
            let html = `
                <table>
                    <tr><th>Hour</th><th>Calls</th><th>%</th></tr>
                    ${hours.map((arr,i) => {
                        let color = arr.length >= s.hourlyQuota ? "#388e3c" : "#e53935";
                        let hourLabel = (s.workStartHour+i).toString().padStart(2,"0")+":00";
                        let pct = Math.round(100*arr.length/s.hourlyQuota);
                        return `<tr>
                            <td>${hourLabel}</td>
                            <td style="color:${color};font-weight:600;">${arr.length}</td>
                            <td>${pct}%</td>
                        </tr>`;
                    }).join("")}
                </table>
            `;
            document.getElementById("hourly-breakdown").innerHTML = html;
        });
    });
}

// --- Export tab (today's log only) ---
function exportCSV() {
    getCallLog((all) => {
        if (!all.length) {
            document.getElementById("export-status").textContent = "No call log found.";
            return;
        }
        const today = (new Date()).toISOString().slice(0,10);
        const todayLog = all.filter(l => getDayKey(l.timestamp) === today);
        let rows = [["Date","Time","Phone","Lead ID","Outcome"]];
        todayLog.forEach(l => {
            let d = new Date(l.timestamp);
            rows.push([
                d.toISOString().slice(0,10), 
                formatTime(l.timestamp), 
                l.phone, 
                l.leadId, 
                l.outcome || ""
            ]);
        });
        let csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
        let blob = new Blob([csv], {type: "text/csv"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `call_log_${today}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById("export-status").textContent = "Exported!";
    });
}

// --- Export all stats (all time, from the advanced stats tab) ---
function exportAdvancedCSV() {
    getCallLog((all) => {
        if (!all.length) {
            document.getElementById("advanced-export-status").textContent = "No call log found.";
            return;
        }
        let rows = [["Date","Time","Phone","Lead ID","Outcome"]];
        all.forEach(l => {
            let d = new Date(l.timestamp);
            rows.push([
                d.toISOString().slice(0,10), 
                formatTime(l.timestamp), 
                l.phone, 
                l.leadId, 
                l.outcome || ""
            ]);
        });
        let csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
        let blob = new Blob([csv], {type: "text/csv"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `call_stats_full_${(new Date()).toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById("advanced-export-status").textContent = "Exported!";
    });
}

// --- Reset today's log ---
function resetLog() {
    getCallLog((all) => {
        if (!confirm("Reset today's call log? This cannot be undone.")) return;
        const today = (new Date()).toISOString().slice(0,10);
        const filtered = all.filter(l => getDayKey(l.timestamp) !== today);
        setCallLog(filtered, () => {
            renderOverview();
            renderHourly();
            renderAdvancedStats();
            document.getElementById("export-status").textContent = "Today's log reset.";
            document.getElementById("advanced-export-status").textContent = "";
        });
    });
}

// --- Settings tab ---
function saveSettings() {
    getSettings((s) => {
        s.hourlyQuota = parseInt(document.getElementById("set-hourly-quota").value) || 120;
        s.dailyHours = parseInt(document.getElementById("set-daily-hours").value) || 8;
        s.workStartHour = parseInt(document.getElementById("set-work-start").value) || 18;
        setSettings(s, () => {
            document.getElementById("settings-status").textContent = "Settings saved!";
            renderOverview();
            renderHourly();
            renderAdvancedStats();
        });
    });
}
function loadSettings() {
    getSettings((s) => {
        document.getElementById("set-hourly-quota").value = s.hourlyQuota;
        document.getElementById("set-daily-hours").value = s.dailyHours;
        document.getElementById("set-work-start").value = s.workStartHour;
    });
}

// --- Advanced Stats tab (all-time stats with charts) ---
function renderAdvancedStats() {
    getCallLog((log) => {
        const OUTCOME_TAGS = ["answered", "voicemail", "bad number", "callback", "other"];
        log = log.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const byDay = log.reduce((acc, l) => {
            const key = (new Date(l.timestamp)).toISOString().slice(0,10);
            acc[key] = acc[key] || [];
            acc[key].push(l);
            return acc;
        }, {});
        const todayKey = (new Date()).toISOString().slice(0,10);
        const todayLog = byDay[todayKey] || [];
        const byHour = todayLog.reduce((acc, l) => {
            const h = (new Date(l.timestamp)).getHours();
            acc[h] = acc[h] || [];
            acc[h].push(l);
            return acc;
        }, {});
        const uniquePeopleToday = [...new Set(todayLog.map(l => l.phone || l.leadId || "unknown"))].length;
        const personCallCount = {};
        log.forEach(l => {
            const key = l.phone || l.leadId || "unknown";
            personCallCount[key] = (personCallCount[key] || 0) + 1;
        });
        // Streaks
        const days = Object.keys(byDay).sort();
        let maxStreak = 0, currStreak = 0, prevDay = null, todayStreak = 0;
        days.forEach(day => {
            if (!prevDay) { currStreak = 1; }
            else {
                let diff = (new Date(day) - new Date(prevDay)) / 86400000;
                currStreak = (diff === 1) ? currStreak + 1 : 1;
            }
            if (currStreak > maxStreak) maxStreak = currStreak;
            prevDay = day;
        });
        if (days.length && days[days.length-1] === todayKey) {
            todayStreak = currStreak;
        }
        // Busiest hour
        let busiestHour = null, busiestCount = 0;
        Object.keys(byHour).forEach(hr => {
            if (byHour[hr].length > busiestCount) {
                busiestHour = hr;
                busiestCount = byHour[hr].length;
            }
        });
        // Call outcomes
        let outcomeCounts = {};
        OUTCOME_TAGS.forEach(tag => outcomeCounts[tag] = 0);
        log.forEach(l => {
            if (l.outcome && outcomeCounts.hasOwnProperty(l.outcome)) {
                outcomeCounts[l.outcome]++;
            }
        });

        // Render HTML
        let html = `
            <div style="font-family:sans-serif;max-width:600px;padding:8px;">
                <h3>📊 Advanced Call Statistics</h3>
                <ul>
                    <li><b>Total Calls:</b> ${log.length}</li>
                    <li><b>Total Unique People:</b> ${[...new Set(log.map(l => l.phone || l.leadId || "unknown"))].length}</li>
                    <li><b>Calls Today:</b> ${todayLog.length}</li>
                    <li><b>Unique People Today:</b> ${uniquePeopleToday}</li>
                    <li><b>First Call Today:</b> ${todayLog[0]?.timestamp ? new Date(todayLog[0].timestamp).toLocaleTimeString() : "-"}</li>
                    <li><b>Last Call Today:</b> ${todayLog[todayLog.length-1]?.timestamp ? new Date(todayLog[todayLog.length-1].timestamp).toLocaleTimeString() : "-"}</li>
                    <li><b>Busiest Hour Today:</b> ${busiestHour !== null ? busiestHour + ":00 (" + busiestCount + " calls)" : "-"}</li>
                    <li><b>Current Streak (days in a row with calls):</b> ${todayStreak}</li>
                    <li><b>Longest Streak:</b> ${maxStreak}</li>
                </ul>
                <hr>
                <h4>Calls Per Day</h4>
                <canvas id="callstatsChartDay" height="80"></canvas>
                <h4>Calls Per Hour (Today)</h4>
                <canvas id="callstatsChartHour" height="60"></canvas>
                <h4>Call Frequency Per Person (Top 10)</h4>
                <table style="width:100%;font-size:13px;">
                    <tr><th>Phone/Lead</th><th># Calls</th></tr>
                    ${
                        Object.entries(personCallCount)
                        .sort((a,b)=>b[1]-a[1])
                        .slice(0,10)
                        .map(([key, count])=>
                            `<tr><td>${key}</td><td>${count}</td></tr>`
                        ).join("")
                    }
                </table>
                ${Object.values(outcomeCounts).some(x=>x>0) ? `
                    <h4>Call Outcomes</h4>
                    <canvas id="callstatsChartOutcomes" height="60"></canvas>
                ` : ''}
            </div>
        `;
        document.getElementById("advanced-stats-panel").innerHTML = html;

        // Render charts after DOM update
        setTimeout(() => {
            if (!window.Chart) return;
            // Calls per day
            let ctxDay = document.getElementById("callstatsChartDay").getContext('2d');
            let daysArr = Object.keys(byDay).sort();
            let callsPerDay = daysArr.map(d => byDay[d].length);
            new Chart(ctxDay, {
                type: 'bar',
                data: {
                    labels: daysArr,
                    datasets: [{
                        label: 'Calls',
                        data: callsPerDay,
                        backgroundColor: '#1976d2'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
            // Calls per hour (today)
            let ctxHour = document.getElementById("callstatsChartHour").getContext('2d');
            let hours = Array.from({length:24},(_,i)=>i);
            let callsPerHour = hours.map(h => byHour[h] ? byHour[h].length : 0);
            new Chart(ctxHour, {
                type: 'bar',
                data: {
                    labels: hours.map(h=>h+":00"),
                    datasets: [{
                        label: 'Calls',
                        data: callsPerHour,
                        backgroundColor: '#43a047'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
            // Call outcomes (if present)
            if (Object.values(outcomeCounts).some(x=>x>0)) {
                let ctxPie = document.getElementById("callstatsChartOutcomes").getContext('2d');
                new Chart(ctxPie, {
                    type: 'pie',
                    data: {
                        labels: OUTCOME_TAGS,
                        datasets: [{
                            data: OUTCOME_TAGS.map(tag=>outcomeCounts[tag]),
                            backgroundColor: ['#1976d2','#fbc02d','#e53935','#8e24aa','#90caf9']
                        }]
                    },
                    options: { responsive: true }
                });
            }
        }, 100); // Wait for canvas to be in DOM
    });
}

// --- Bindings and initialize ---
document.getElementById("export-csv-btn").onclick = exportCSV;
document.getElementById("reset-log-btn").onclick = resetLog;
document.getElementById("save-settings-btn").onclick = saveSettings;
document.getElementById("export-advanced-csv-btn").onclick = exportAdvancedCSV;

renderOverview();
renderHourly();
renderAdvancedStats();
loadSettings();