// ============================================================
//  app.js
//  Entry point. Initializes everything in dependency order:
//  Firebase → Charts → UI → Stream → Firebase listeners
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  // 1. Set date in topbar
  document.getElementById("topbarDate").textContent = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // 2. Init Firebase Realtime Database
  try {
    firebase.initializeApp(CONFIG.firebase);
    firebase.analytics();
    FirebaseDB.init();
    _setFirebaseStatus("connected", "Connected");
  } catch (err) {
    console.error("[App] Firebase init error:", err);
    _setFirebaseStatus("disconnected", "Failed");
  }

  // 3. Init Charts
  Charts.init();

  // 4. Init UI (renders placeholder data)
  UI.init();

  // 5. Init YouTube stream embed
  Stream.init();

  // 6. Load today's counts from Firebase and sync into State
  await _loadFirebaseData();

  // 7. Set up Firebase real-time listener — updates dashboard live
  //    whenever any device pushes a new detection
  FirebaseDB.onDailyCountChange(_onFirebaseCountChange);

  // 8. Seed demo log so table isn't empty on first load
  _seedDemoLog();

  console.log(`[App] ${CONFIG.app.name} v${CONFIG.app.version} ready.`);

});

// ── LOAD FIREBASE DATA ON STARTUP ──────────────────────────
async function _loadFirebaseData() {
  // Load today's counts
  const todayCounts = await FirebaseDB.loadTodayCounts();
  if (todayCounts) {
    VEHICLES.forEach((v, i) => {
      const n = todayCounts[v.id];
      if (n) State.counts[i] = n;
    });
    if (todayCounts.peak_hour) {
      const el = document.getElementById("metricPeakHour");
      if (el) el.textContent = todayCounts.peak_hour;
    }
    UI.refresh();
    console.log("[App] Today's counts loaded from Firebase.");
  }

  // Load weekly trend data
  const weekly = await FirebaseDB.loadWeeklyTotals();
  if (weekly) {
    const entries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
    Charts.updateTrend(
      entries.map(([date]) => date.slice(5)),   // "05-08" format
      entries.map(([, v]) => v.total || 0)
    );
    console.log("[App] Weekly totals loaded from Firebase.");
  }
}

// ── FIREBASE REAL-TIME COUNT LISTENER ───────────────────────
// Fires every time daily_counts/{today} changes in the DB.
// Keeps the dashboard in sync even if detections come from
// another device (e.g. your Python backend).
function _onFirebaseCountChange(counts) {
  VEHICLES.forEach((v, i) => {
    const n = counts[v.id];
    if (typeof n === "number") State.counts[i] = n;
  });
  UI.refresh();
}

// ── FIREBASE STATUS HELPERS ──────────────────────────────────
function _setFirebaseStatus(cls, label) {
  const topbar  = document.getElementById("topbarFbStatus");
  const sidebar = document.getElementById("sidebarFbStatus");
  const metric  = document.getElementById("metricFbLabel");

  const dotColor = cls === "connected" ? "#22c55e" : cls === "connecting" ? "#d97706" : "#dc2626";
  const html     = `<span style="width:6px;height:6px;border-radius:50%;background:${dotColor};animation:pulse 2s infinite;display:inline-block;margin-right:4px;"></span>${label}`;

  if (topbar)  { topbar.className  = `fb-status ${cls}`;  topbar.innerHTML  = html; }
  if (sidebar) { sidebar.className = `fb-status ${cls}`;  sidebar.textContent = label; }
  if (metric)  { metric.textContent = label; }
}

// ── SEED DEMO LOG ───────────────────────────────────────────
function _seedDemoLog() {
  const demoLabels = ["Jeepney", "Car", "Tricycle", "Bus", "Motorcycle", "Jeepney", "UV Express"];
  demoLabels.forEach(label => {
    const idx = VEHICLES.findIndex(v => v.label === label);
    if (idx < 0) return;
    const conf = MODEL_CONFIDENCE[idx] - Math.floor(Math.random() * 5);
    State.addDetection(idx, conf);
  });
  UI.refresh();
}

// ══════════════════════════════════════════════════════════════
//  GLOBAL EVENT HANDLERS
//  Called by onclick="" in index.html
// ══════════════════════════════════════════════════════════════

function onSimulateClick() {
  Detection.simulate();
}

function onSwitchTab(tab, el) {
  document.querySelectorAll(".dash-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  State.activeTab = tab;
  Charts.switchHourlyTab(tab);
}

function onClearLog() {
  State.logEntries = [];
  UI.refresh();
}

function onConnectRoboflow() {
  const apiKey  = document.getElementById("apiKeyInput").value.trim();
  const modelId = document.getElementById("modelIdInput").value.trim();

  if (!apiKey) {
    alert("Please paste your Roboflow API key first.");
    return;
  }

  CONFIG.roboflow.apiKey  = apiKey;
  CONFIG.roboflow.modelId = modelId || CONFIG.roboflow.modelId;

  UI.setRoboflowStatus(true, `Connected · ${CONFIG.roboflow.modelId || "model not set"}`);
  console.log("[App] Roboflow API key set.");
}
