// ============================================================
//  ui.js
//  All DOM rendering lives here. Functions receive data as
//  arguments — they do NOT read State directly (except render
//  wrappers that pull from State for convenience).
// ============================================================

const UI = (() => {

  // ── METRIC CARDS ────────────────────────────────────────
  function renderMetrics() {
    const { vehicle, count } = State.topVehicle;

    document.getElementById("metricTotal").textContent    = State.totalDetections.toLocaleString();
    document.getElementById("metricTopLabel").textContent = vehicle.label;
    document.getElementById("metricTopCount").textContent = count.toLocaleString() + " detections";
  }

  // ── RANKED LIST ──────────────────────────────────────────
  function renderRankList() {
    const max = Math.max(...State.counts);

    const sorted = VEHICLES
      .map((v, i) => ({ v, count: State.counts[i] }))
      .sort((a, b) => b.count - a.count);

    document.getElementById("rankList").innerHTML = sorted.map((item, idx) => `
      <div class="rank-row">
        <span class="rank-number">${idx + 1}</span>
        <span class="vbadge ${item.v.badgeClass}">${item.v.label}</span>
        <div class="rank-bar-wrap">
          <div class="rank-bar" style="width:${Math.round(item.count / max * 100)}%; background:${item.v.color};"></div>
        </div>
        <span class="rank-count">${item.count.toLocaleString()}</span>
      </div>
    `).join("");
  }

  // ── DONUT LEGEND ─────────────────────────────────────────
  function renderDonutLegend() {
    const total = State.totalDetections || 1;

    document.getElementById("donutLegend").innerHTML = VEHICLES.map((v, i) => {
      const pct = Math.round(State.counts[i] / total * 100);
      return `
        <div class="donut-legend-row">
          <span class="donut-legend-dot" style="background:${v.color};"></span>
          <span class="donut-legend-label">${v.label}</span>
          <span class="donut-legend-count">${State.counts[i].toLocaleString()}</span>
          <span class="donut-legend-pct">${pct}%</span>
        </div>
      `;
    }).join("");
  }

  // ── CONFIDENCE LIST ──────────────────────────────────────
  function renderConfidence() {
    document.getElementById("confList").innerHTML = VEHICLES.map((v, i) => `
      <div class="conf-row">
        <span class="conf-label">${v.label}</span>
        <div class="conf-bar-wrap">
          <div class="conf-bar" style="width:${MODEL_CONFIDENCE[i]}%; background:${v.color};"></div>
        </div>
        <span class="conf-value">${MODEL_CONFIDENCE[i]}%</span>
      </div>
    `).join("");
  }

  // ── DETECTION LOG ────────────────────────────────────────
  function renderLog() {
    if (State.logEntries.length === 0) {
      document.getElementById("logBody").innerHTML = `
        <tr>
          <td colspan="6" class="log-empty">No detections yet — hit Simulate or load a video.</td>
        </tr>
      `;
      return;
    }

    document.getElementById("logBody").innerHTML = State.logEntries.slice(0, 20).map(row => `
      <tr>
        <td class="log-id">${row.id}</td>
        <td>${row.time}</td>
        <td><span class="vbadge ${row.vehicle.badgeClass}">${row.vehicle.label}</span></td>
        <td class="log-conf ${_confClass(row.confidence)}">${row.confidence}%</td>
        <td>#${row.frame}</td>
        <td><span class="status-tag">Detected</span></td>
      </tr>
    `).join("");
  }

  function _confClass(conf) {
    if (conf >= 90) return "conf-high";
    if (conf >= 75) return "conf-mid";
    return "conf-low";
  }

  // ── DETECTION OVERLAY ON VIDEO ───────────────────────────
  function flashDetectionTag(vehicle, confidence) {
    const overlay = document.getElementById("detectionOverlay");
    const tag     = document.createElement("div");
    tag.className = `det-tag vbadge ${vehicle.badgeClass}`;
    tag.textContent = `${vehicle.label} ${confidence}%`;
    overlay.appendChild(tag);
    setTimeout(() => tag.remove(), 2500);
  }

  // ── VIDEO PLAYER ─────────────────────────────────────────
  function loadVideo(file) {
    const url = URL.createObjectURL(file);
    const vid = document.getElementById("videoPlayer");
    vid.src = url;
    vid.style.display = "block";

    document.getElementById("videoPlaceholder").style.display = "none";
    document.getElementById("videoFileName").textContent       = file.name;
    document.getElementById("playPauseBtn").disabled           = false;
    document.getElementById("feedStatus").innerHTML            =
      '<span class="status-dot"></span> File loaded';

    State.videoLoaded = true;
    vid.onclick = e => e.stopPropagation();
  }

  function togglePlay() {
    const vid = document.getElementById("videoPlayer");
    const btn = document.getElementById("playPauseBtn");
    if (vid.paused) {
      vid.play();
      btn.innerHTML = '<i class="bi bi-pause-fill me-1"></i> Pause';
    } else {
      vid.pause();
      btn.innerHTML = '<i class="bi bi-play-fill me-1"></i> Play';
    }
  }

  // ── CONNECTION STATUS ─────────────────────────────────────
  function setRoboflowStatus(connected, message) {
    const el = document.getElementById("connStatus");
    el.className = "conn-status " + (connected ? "connected" : "disconnected");
    el.innerHTML = connected
      ? `<i class="bi bi-check-circle-fill me-1"></i>${message}`
      : `<i class="bi bi-circle me-1"></i>${message}`;
  }

  // ── FULL REFRESH ──────────────────────────────────────────
  // Call this after any state change to keep UI in sync
  function refresh() {
    renderMetrics();
    renderRankList();
    renderDonutLegend();
    renderLog();
    Charts.updateDonut();
  }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    init() {
      renderMetrics();
      renderRankList();
      renderDonutLegend();
      renderConfidence();
      renderLog();
    },
    refresh,
    flashDetectionTag,
    loadVideo,
    togglePlay,
    setRoboflowStatus,
  };

})();
