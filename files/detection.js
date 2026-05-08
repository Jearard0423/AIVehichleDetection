// ============================================================
//  detection.js
//  Handles all Roboflow API communication.
//  When a real detection comes in (from your Python backend
//  or directly from the Roboflow hosted API), it flows through
//  here into State → UI.
// ============================================================

const Detection = (() => {

  // ── INTERNAL HELPERS ─────────────────────────────────────

  // Maps a Roboflow class name string → index in VEHICLES array
  // e.g. "Jeepney" → 0, "tricycle" → 1 (case-insensitive)
  function _vehicleIndexFromLabel(label) {
    const normalized = label.trim().toLowerCase().replace(/\s+/g, "-");
    return VEHICLES.findIndex(v => v.id === normalized || v.label.toLowerCase() === normalized);
  }

  // ── PROCESS A SINGLE DETECTION ───────────────────────────
  // Call this whenever you have a detection result, whether
  // from simulation, your Python backend, or the Roboflow API.
  //
  // params:
  //   vehicleLabel  {string}  e.g. "Jeepney"
  //   confidence    {number}  0–100
  //   frame         {number}  optional frame number
  function process(vehicleLabel, confidence, frame = null) {
    const idx = _vehicleIndexFromLabel(vehicleLabel);
    if (idx < 0) {
      console.warn(`[Detection] Unknown vehicle label: "${vehicleLabel}"`);
      return;
    }

    const entry = State.addDetection(idx, Math.round(confidence));

    // Optionally save to Firebase Firestore
    FirebaseDB.saveDetection(entry);

    // Update UI
    UI.refresh();
    UI.flashDetectionTag(VEHICLES[idx], Math.round(confidence));
  }

  // ── SIMULATE (DEV / DEMO) ─────────────────────────────────
  function simulate() {
    const idx        = Math.floor(Math.random() * VEHICLES.length);
    const baseConf   = MODEL_CONFIDENCE[idx];
    const confidence = baseConf - Math.floor(Math.random() * 8);
    process(VEHICLES[idx].label, confidence);
  }

  // ── ROBOFLOW HOSTED API ───────────────────────────────────
  // Sends a single image (base64) to the Roboflow hosted API.
  // Returns the parsed prediction array or [].
  //
  // Usage:
  //   const results = await Detection.inferImage(base64String);
  //   results.forEach(r => Detection.process(r.class, r.confidence * 100));
  async function inferImage(base64ImageData) {
    const { apiKey, modelId, apiUrl, confidence, overlap } = CONFIG.roboflow;

    if (!apiKey || apiKey === "PASTE_YOUR_ROBOFLOW_API_KEY_HERE") {
      console.warn("[Detection] Roboflow API key not set in config.js");
      return [];
    }

    const url = `${apiUrl}/${modelId}?api_key=${apiKey}&confidence=${confidence}&overlap=${overlap}`;

    try {
      const response = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    base64ImageData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.predictions || [];

    } catch (err) {
      console.error("[Detection] Roboflow API error:", err);
      return [];
    }
  }

  // ── PUBLIC API ────────────────────────────────────────────
  //
  // window.pushDetection is the integration point for your
  // Python backend. When your Flask/FastAPI script detects a
  // vehicle, call:
  //
  //   fetch("http://localhost:5500", { method: "POST", body: JSON.stringify({
  //     vehicle: "Jeepney", confidence: 94, frame: 512
  //   }) })
  //
  // Or if you open the dashboard in the same browser session
  // as your backend's WebSocket, call:
  //
  //   window.pushDetection({ vehicle: "Jeepney", confidence: 94, frame: 512 })
  //
  window.pushDetection = function({ vehicle, confidence, frame }) {
    process(vehicle, confidence, frame);
  };

  return {
    process,
    simulate,
    inferImage,
  };

})();
