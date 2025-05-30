// popup.js for Call Agent Extension
function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
function getDayKey(ts) {
    const d = new Date(ts);
    return d.toISOString().slice(0,10);
}
function getCallLog() {
    const raw = localStorage.getItem("callAgentCallLog");
    return raw ? JSON.parse(raw) : [];
}
function setCallLog(log) {
    localStorage.setItem("callAgentCallLog", JSON.stringify(log));
}
function getSettings() {
    const raw = localStorage.getItem("callAgentSettings");
    return raw ? JSON.parse(raw) : {hourlyQuota:120, dailyHours:8, workStartHour:18};
}
function setSettings(s) {
    localStorage.setItem("callAgentSettings", JSON.stringify(s));
}

function showTab(tab) {
    ["overview","hourly","export","settings"].forEach(t => {
        document.getElementById(`tab-${t}`).classList.toggle("active", t === tab);
        document.getElementById(`tab-${t}-content`).classList.toggle("active", t === tab);
    });
}
document.getElementById("tab-overview").onclick = ()=>showTab("overview");
document.getElementById("tab-hourly").onclick = ()=>showTab("hourly");
document.getElementById("tab-export").onclick = ()=>showTab("export");
document.getElementById("tab-settings").onclick = ()=>showTab("settings");

function renderOverview() {
    const all = getCallLog();
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const s = getSettings();
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
}
function renderHourly() {
    const all = getCallLog();
    const now = new Date();
    const today = now.toISOString().slice(0,10);
    const s = getSettings();
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
}
function exportCSV() {
    const all = getCallLog();
    if (!all.length) {
        document.getElementById("export-status").textContent = "No call log found.";
        return;
    }
    let rows = [["Date","Time","Phone","Lead ID"]];
    all.forEach(l => {
        let d = new Date(l.timestamp);
        rows.push([d.toISOString().slice(0,10), formatTime(l.timestamp), l.phone, l.leadId]);
    });
    let csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    let blob = new Blob([csv], {type: "text/csv"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = `call_log_${(new Date()).toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById("export-status").textContent = "Exported!";
}
function resetLog() {
    if (!confirm("Reset today's call log? This cannot be undone.")) return;
    const all = getCallLog();
    const today = (new Date()).toISOString().slice(0,10);
    const filtered = all.filter(l => getDayKey(l.timestamp) !== today);
    setCallLog(filtered);
    renderOverview();
    renderHourly();
    document.getElementById("export-status").textContent = "Today's log reset.";
}
function saveSettings() {
    let s = getSettings();
    s.hourlyQuota = parseInt(document.getElementById("set-hourly-quota").value) || 120;
    s.dailyHours = parseInt(document.getElementById("set-daily-hours").value) || 8;
    s.workStartHour = parseInt(document.getElementById("set-work-start").value) || 18;
    setSettings(s);
    document.getElementById("settings-status").textContent = "Settings saved!";
    renderOverview();
    renderHourly();
}
function loadSettings() {
    let s = getSettings();
    document.getElementById("set-hourly-quota").value = s.hourlyQuota;
    document.getElementById("set-daily-hours").value = s.dailyHours;
    document.getElementById("set-work-start").value = s.workStartHour;
}
document.getElementById("export-csv-btn").onclick = exportCSV;
document.getElementById("reset-log-btn").onclick = resetLog;
document.getElementById("save-settings-btn").onclick = saveSettings;
// On load
renderOverview();
renderHourly();
loadSettings();