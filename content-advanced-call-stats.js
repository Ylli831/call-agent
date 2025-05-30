// Advanced Call Statistics for Chrome Extension
// Author: Yll Aliu
// Requirements: Chart.js (loaded dynamically if not present)

(function() {
    // --- CONFIG ---
    const CALL_LOG_KEY = "callAgentCallLog";
    // If you log outcomes, store as {timestamp, phone, leadId, outcome, ...}
    const OUTCOME_TAGS = ["answered", "voicemail", "bad number", "callback", "other"];

    // -- Chart.js loader --
    function ensureChartJs(cb) {
        if (window.Chart) return cb();
        let script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = cb;
        document.head.appendChild(script);
    }

    // --- Data Helpers ---
    function getCallLog() {
        const raw = localStorage.getItem(CALL_LOG_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    function todayKey(d = new Date()) {
        return d.toISOString().slice(0,10);
    }
    function weekKey(d = new Date()) {
        // YYYY-WW, ISO week
        let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        let dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        let yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
        let weekNo = Math.ceil((((date - yearStart)/86400000) + 1)/7);
        return `${date.getUTCFullYear()}-W${weekNo}`;
    }
    function monthKey(d = new Date()) {
        return d.toISOString().slice(0,7);
    }
    function groupBy(arr, fn) {
        return arr.reduce((acc, x) => {
            const key = fn(x);
            acc[key] = acc[key] || [];
            acc[key].push(x);
            return acc;
        }, {});
    }
    function uniqueBy(arr, fn) {
        const seen = {};
        return arr.filter(x => {
            const k = fn(x);
            if (seen[k]) return false;
            seen[k] = true;
            return true;
        });
    }
    function getDateString(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString();
    }
    function getHour(ts) {
        return (new Date(ts)).getHours();
    }

    // --- Statistics Calculation ---
    function getStats() {
        const log = getCallLog().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // General grouping
        const byDay = groupBy(log, l => todayKey(new Date(l.timestamp)));
        const byWeek = groupBy(log, l => weekKey(new Date(l.timestamp)));
        const byMonth = groupBy(log, l => monthKey(new Date(l.timestamp)));

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
        // Today's streak
        if (days.length && days[days.length-1] === todayKey()) {
            todayStreak = currStreak;
        }

        // Calls per hour (today)
        const todayLog = byDay[todayKey()] || [];
        const byHour = groupBy(todayLog, l => getHour(l.timestamp));
        const uniquePeopleToday = uniqueBy(todayLog, l => l.phone || l.leadId || "unknown").length;

        // Call frequency per person
        const personCallCount = {};
        log.forEach(l => {
            const key = l.phone || l.leadId || "unknown";
            personCallCount[key] = (personCallCount[key] || 0) + 1;
        });

        // Busiest hour
        let busiestHour = null, busiestCount = 0;
        Object.keys(byHour).forEach(hr => {
            if (byHour[hr].length > busiestCount) {
                busiestHour = hr;
                busiestCount = byHour[hr].length;
            }
        });

        // First/last call times for today
        let firstCall = todayLog[0]?.timestamp || null;
        let lastCall = todayLog[todayLog.length-1]?.timestamp || null;

        // Call outcome breakdown (if present)
        let outcomeCounts = {};
        OUTCOME_TAGS.forEach(tag => outcomeCounts[tag] = 0);
        log.forEach(l => {
            if (l.outcome && outcomeCounts.hasOwnProperty(l.outcome)) {
                outcomeCounts[l.outcome]++;
            }
        });

        return {
            totalCalls: log.length,
            totalUniquePeople: uniqueBy(log, l => l.phone || l.leadId || "unknown").length,
            byDay,
            byWeek,
            byMonth,
            todayLog,
            callsToday: todayLog.length,
            uniquePeopleToday,
            byHour,
            personCallCount,
            firstCall,
            lastCall,
            outcomeCounts,
            days,
            maxStreak,
            todayStreak,
            busiestHour,
            busiestCount
        };
    }

    // --- UI ---
    function showStatsPanel() {
        ensureChartJs(() => {
            let stats = getStats();
            let html = `
            <div style="font-family:sans-serif;max-width:600px;padding:16px;">
                <h3>📊 Advanced Call Statistics</h3>
                <ul>
                    <li><b>Total Calls:</b> ${stats.totalCalls}</li>
                    <li><b>Total Unique People:</b> ${stats.totalUniquePeople}</li>
                    <li><b>Calls Today:</b> ${stats.callsToday}</li>
                    <li><b>Unique People Today:</b> ${stats.uniquePeopleToday}</li>
                    <li><b>First Call Today:</b> ${stats.firstCall ? new Date(stats.firstCall).toLocaleTimeString() : "-"}</li>
                    <li><b>Last Call Today:</b> ${stats.lastCall ? new Date(stats.lastCall).toLocaleTimeString() : "-"}</li>
                    <li><b>Busiest Hour Today:</b> ${stats.busiestHour !== null ? stats.busiestHour + ":00 (" + stats.busiestCount + " calls)" : "-"}</li>
                    <li><b>Current Streak (days in a row with calls):</b> ${stats.todayStreak}</li>
                    <li><b>Longest Streak:</b> ${stats.maxStreak}</li>
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
                        Object.entries(stats.personCallCount)
                        .sort((a,b)=>b[1]-a[1])
                        .slice(0,10)
                        .map(([key, count])=>
                            `<tr><td>${key}</td><td>${count}</td></tr>`
                        ).join("")
                    }
                </table>
                ${Object.values(stats.outcomeCounts).some(x=>x>0) ? `
                    <h4>Call Outcomes</h4>
                    <canvas id="callstatsChartOutcomes" height="60"></canvas>
                ` : ''}
                <button id="callstats-export" style="margin-top:10px;background:#1976d2;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;">Export as CSV</button>
            </div>
            `;
            let panel = document.getElementById("callstats-panel");
            if (!panel) {
                panel = document.createElement("div");
                panel.id = "callstats-panel";
                panel.style = "position:fixed;top:70px;right:24px;z-index:100000;border-radius:9px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,0.18);max-height:80vh;overflow:auto";
                document.body.appendChild(panel);
            }
            panel.innerHTML = html;
            document.getElementById("callstats-export").onclick = exportCSV;

            // --- Charts ---
            // Calls per day
            let ctxDay = document.getElementById("callstatsChartDay").getContext('2d');
            let days = Object.keys(stats.byDay).sort();
            let callsPerDay = days.map(d => stats.byDay[d].length);
            new Chart(ctxDay, {
                type: 'bar',
                data: {
                    labels: days,
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
            let callsPerHour = hours.map(h => stats.byHour[h] ? stats.byHour[h].length : 0);
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
            if (Object.values(stats.outcomeCounts).some(x=>x>0)) {
                let ctxPie = document.getElementById("callstatsChartOutcomes").getContext('2d');
                new Chart(ctxPie, {
                    type: 'pie',
                    data: {
                        labels: OUTCOME_TAGS,
                        datasets: [{
                            data: OUTCOME_TAGS.map(tag=>stats.outcomeCounts[tag]),
                            backgroundColor: ['#1976d2','#fbc02d','#e53935','#8e24aa','#90caf9']
                        }]
                    },
                    options: { responsive: true }
                });
            }
        });
    }

    // CSV Export
    function exportCSV() {
        let log = getCallLog();
        let headers = ["Time", "Phone", "LeadId", "Outcome"];
        let rows = [headers];
        log.forEach(l => {
            rows.push([
                new Date(l.timestamp).toLocaleString(),
                l.phone,
                l.leadId,
                l.outcome || ""
            ]);
        });
        let csv = rows.map(r => r.join(",")).join("\n");
        let blob = new Blob([csv], {type: "text/csv"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `call_stats_${todayKey()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Floating Button
    function addStatsButton() {
        if (document.getElementById("callstats-btn")) return;
        let btn = document.createElement("button");
        btn.id = "callstats-btn";
        btn.innerText = "📊 Call Stats";
        btn.style = "position:fixed;right:24px;top:20px;z-index:100001;background:#1976d2;color:#fff;border:none;padding:10px 19px;border-radius:50px;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.13);cursor:pointer;";
        btn.onclick = function() {
            let panel = document.getElementById("callstats-panel");
            if (panel && panel.style.display !== "none") {
                panel.style.display = "none";
            } else {
                showStatsPanel();
                document.getElementById("callstats-panel").style.display = "block";
            }
        };
        document.body.appendChild(btn);
    }
    function logCall({ phone, leadId, outcome }) {
    const log = JSON.parse(localStorage.getItem("callAgentCallLog") || "[]");
    log.push({
        timestamp: new Date().toISOString(),
        phone,
        leadId,
        outcome // optional, can leave undefined for now
    });
    localStorage.setItem("callAgentCallLog", JSON.stringify(log));
    window.dispatchEvent(new Event("CallAgent:callLogged")); // So the stats update live
}
    // Initialize on load
    addStatsButton();

    // Optional: update panel live when a call is logged
    window.addEventListener("CallAgent:callLogged", function() {
        let panel = document.getElementById("callstats-panel");
        if (panel && panel.style.display !== "none") {
            showStatsPanel();
        }
    });

})();