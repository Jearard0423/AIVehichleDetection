// ============================================================
//  stream.js
//  Manages the YouTube Live embed and frame capture.
//
//  How it works:
//    1. An <iframe> embeds the YouTube live stream.
//    2. Every N seconds, we draw the iframe content onto a
//       hidden <canvas>, convert it to base64, and send it
//       to Roboflow for detection.
//
//  ⚠️  CORS NOTE:
//    YouTube blocks direct canvas frame capture (cross-origin).
//    Two ways around this:
//      A) Run a Python backend (Flask) that captures frames
//         using yt-dlp + OpenCV, then POSTs detections here.
//      B) Use Roboflow's hosted API and pass the YouTube URL
//         directly (supported for hosted streams).
//
//    This file handles the UI switching and the frame-capture
//    attempt — if CORS blocks it, it falls back to showing a
//    "Connect your Python backend" message.
// ============================================================

const Stream = (() => {

  let _activeStreamIndex = 0;
  let _captureInterval   = null;
  let _isCapturing       = false;
  let _frameCount        = 0;

  const streams = CONFIG.youtube.streams;

  // ── BUILD STREAM SELECTOR ────────────────────────────────
  function buildSelector() {
    const wrap = document.getElementById("streamSelector");
    if (!wrap) return;

    wrap.innerHTML = streams.map((s, i) => `
      <button
        class="stream-btn ${i === 0 ? "active" : ""}"
        onclick="Stream.switchTo(${i}, this)"
        title="${s.location}">
        <i class="bi bi-broadcast-pin me-1"></i>${s.label}
      </button>
    `).join("");
  }

  // ── LOAD STREAM INTO IFRAME ──────────────────────────────
  function loadStream(index) {
    const stream = streams[index];
    const iframe = document.getElementById("youtubeFrame");
    const label  = document.getElementById("streamLabel");
    const loc    = document.getElementById("streamLocation");

    if (!stream || !iframe) return;

    // YouTube embed with autoplay, muted (required for autoplay),
    // and live stream parameters
    iframe.src = `https://www.youtube.com/embed/${stream.embedId}` +
      `?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`;

    if (label) label.textContent  = stream.label;
    if (loc)   loc.textContent    = stream.location;

    _activeStreamIndex = index;
    _frameCount = 0;

    console.log(`[Stream] Loaded: ${stream.label}`);
  }

  // ── SWITCH STREAM ────────────────────────────────────────
  function switchTo(index, buttonEl) {
    // Stop current capture
    stopCapture();

    // Update button states
    document.querySelectorAll(".stream-btn").forEach(b => b.classList.remove("active"));
    if (buttonEl) buttonEl.classList.add("active");

    // Load new stream
    loadStream(index);

    // Restart capture if it was running
    if (_isCapturing) startCapture();
  }

  // ── FRAME CAPTURE ────────────────────────────────────────
  // Attempts to draw the iframe onto canvas and capture a frame.
  // Falls back gracefully if CORS blocks it.
  function captureFrame() {
    const iframe  = document.getElementById("youtubeFrame");
    const canvas  = document.getElementById("captureCanvas");
    const preview = document.getElementById("capturePreview");

    if (!iframe || !canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      canvas.width  = 640;
      canvas.height = 360;

      // Try to draw iframe content (will throw if cross-origin blocked)
      ctx.drawImage(iframe, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
      _frameCount++;

      if (preview) {
        preview.src = canvas.toDataURL("image/jpeg", 0.8);
        preview.style.display = "block";
      }

      // Send to Roboflow
      Detection.inferImage(base64).then(predictions => {
        predictions.forEach(p => {
          Detection.process(p.class, p.confidence * 100, _frameCount);
        });
        _updateCaptureStatus(`Frame #${_frameCount} — ${predictions.length} detected`);
      });

    } catch (err) {
      // CORS blocked — show backend instructions
      _updateCaptureStatus("⚠️ Connect Python backend to send frames (see console)");
      console.info(
        "[Stream] Cross-origin frame capture blocked by YouTube.\n" +
        "Run your Python backend:\n" +
        "  pip install yt-dlp opencv-python flask\n" +
        "  python backend.py\n" +
        "Then call window.pushDetection() with each result."
      );
    }
  }

  // ── START / STOP CAPTURE ─────────────────────────────────
  function startCapture() {
    if (_captureInterval) return;
    _isCapturing    = true;
    _captureInterval = setInterval(captureFrame, CONFIG.youtube.captureIntervalMs);
    _updateCaptureStatus("🔴 Capturing frames...");
    document.getElementById("captureBtn").textContent = "⏹ Stop Capture";
    console.log("[Stream] Frame capture started.");
  }

  function stopCapture() {
    clearInterval(_captureInterval);
    _captureInterval = null;
    _isCapturing     = false;
    _updateCaptureStatus("Capture stopped");
    const btn = document.getElementById("captureBtn");
    if (btn) btn.textContent = "▶ Start Capture";
    console.log("[Stream] Frame capture stopped.");
  }

  function toggleCapture() {
    _isCapturing ? stopCapture() : startCapture();
  }

  // ── STATUS TEXT ──────────────────────────────────────────
  function _updateCaptureStatus(msg) {
    const el = document.getElementById("captureStatus");
    if (el) el.textContent = msg;
  }

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    buildSelector();
    loadStream(0);
  }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    init,
    switchTo,
    toggleCapture,
    startCapture,
    stopCapture,
    captureFrame,
  };

})();
