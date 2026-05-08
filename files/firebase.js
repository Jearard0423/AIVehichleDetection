// ============================================================
//  firebase.js
//  All Firebase Realtime Database operations.
//  Realtime DB is used instead of Firestore because it pushes
//  live updates instantly — perfect for a live detection feed.
//
//  Database structure mirrors database-seed.json.
//  Import that JSON into Firebase Console → Realtime Database
//  → ⋮ menu → Import JSON to seed initial data.
// ============================================================

const FirebaseDB = (() => {

  let _db    = null;
  let _ready = false;

  // Today's date key e.g. "2026-05-08"
  function _todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // Current hour key e.g. "07"
  function _hourKey() {
    return String(new Date().getHours()).padStart(2, "0");
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    try {
      _db    = firebase.database();
      _ready = true;
      console.log("[Firebase] Realtime Database connected ✓");
    } catch (err) {
      console.error("[Firebase] Realtime Database init failed:", err);
    }
  }

  // ── SAVE A SINGLE DETECTION ───────────────────────────────
  // Writes to: vehiclewatch/detections/{push-id}
  // Also increments daily + hourly counts atomically.
  async function saveDetection(entry) {
    if (!_ready) return;

    const today = _todayKey();
    const hour  = _hourKey();
    const id    = entry.vehicle.id;

    try {
      // 1. Push detection log entry
      await _db.ref("vehiclewatch/detections").push({
        vehicle:    entry.vehicle.label,
        vehicleId:  id,
        confidence: entry.confidence,
        frame:      entry.frame,
        timestamp:  new Date().toISOString(),
        source:     "youtube_live",
        location:   "EDSA",
      });

      // 2. Increment daily count for this vehicle
      await _db.ref(`vehiclewatch/daily_counts/${today}/${id}`)
        .transaction(n => (n || 0) + 1);

      // 3. Increment daily total
      await _db.ref(`vehiclewatch/daily_counts/${today}/total`)
        .transaction(n => (n || 0) + 1);

      // 4. Increment hourly count
      await _db.ref(`vehiclewatch/hourly_counts/${today}/${hour}/${id}`)
        .transaction(n => (n || 0) + 1);

      // 5. Update last_updated timestamp
      await _db.ref(`vehiclewatch/daily_counts/${today}/last_updated`)
        .set(new Date().toISOString());

    } catch (err) {
      console.warn("[Firebase] Failed to save detection:", err);
    }
  }

  // ── LISTEN TO LIVE DETECTIONS ─────────────────────────────
  // Calls callback(entry) every time a new detection is pushed.
  // Syncs dashboard in real time across multiple browser tabs.
  function onNewDetection(callback) {
    if (!_ready) return;
    _db.ref("vehiclewatch/detections")
      .limitToLast(1)
      .on("child_added", snapshot => {
        const data = snapshot.val();
        if (data) callback(data);
      });
  }

  // ── LOAD TODAY'S DAILY COUNTS ─────────────────────────────
  async function loadTodayCounts() {
    if (!_ready) return null;
    try {
      const snap = await _db.ref(`vehiclewatch/daily_counts/${_todayKey()}`).get();
      return snap.exists() ? snap.val() : null;
    } catch (err) {
      console.warn("[Firebase] Failed to load today counts:", err);
      return null;
    }
  }

  // ── LOAD WEEKLY TOTALS ────────────────────────────────────
  async function loadWeeklyTotals() {
    if (!_ready) return null;
    try {
      const snap = await _db.ref("vehiclewatch/weekly_totals").get();
      return snap.exists() ? snap.val() : null;
    } catch (err) {
      console.warn("[Firebase] Failed to load weekly totals:", err);
      return null;
    }
  }

  // ── LOAD HOURLY COUNTS FOR TODAY ──────────────────────────
  async function loadTodayHourly() {
    if (!_ready) return null;
    try {
      const snap = await _db.ref(`vehiclewatch/hourly_counts/${_todayKey()}`).get();
      return snap.exists() ? snap.val() : null;
    } catch (err) {
      console.warn("[Firebase] Failed to load hourly counts:", err);
      return null;
    }
  }

  // ── LISTEN TO DAILY COUNT CHANGES (real-time) ─────────────
  // Fires callback(counts) whenever any count changes.
  function onDailyCountChange(callback) {
    if (!_ready) return;
    _db.ref(`vehiclewatch/daily_counts/${_todayKey()}`)
      .on("value", snapshot => {
        if (snapshot.exists()) callback(snapshot.val());
      });
  }

  // ── CLEAR TODAY'S DATA (dev helper) ───────────────────────
  async function clearTodayDetections() {
    if (!_ready) return;
    await _db.ref("vehiclewatch/detections").remove();
    await _db.ref(`vehiclewatch/daily_counts/${_todayKey()}`).remove();
    await _db.ref(`vehiclewatch/hourly_counts/${_todayKey()}`).remove();
    console.log("[Firebase] Today's data cleared.");
  }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    init,
    saveDetection,
    onNewDetection,
    loadTodayCounts,
    loadWeeklyTotals,
    loadTodayHourly,
    onDailyCountChange,
    clearTodayDetections,
  };

})();
