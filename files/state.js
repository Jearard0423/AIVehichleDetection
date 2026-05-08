// ============================================================
//  state.js
//  Single source of truth for all live dashboard data.
//  Only this object should ever be mutated directly.
//  UI functions read from here; detection functions write here.
// ============================================================

const State = {
  counts:       [...INITIAL_COUNTS],   // detection count per vehicle index
  logEntries:   [],                    // array of detection log row objects
  frameCounter: 1024,                  // frame number tracker
  logIdCounter: 1,                     // auto-increment ID for log rows
  activeTab:    "today",               // which hourly chart tab is shown
  videoLoaded:  false,                 // whether a video file is loaded

  // Resets all counts and log (e.g. start of a new day)
  reset() {
    this.counts       = [...INITIAL_COUNTS];
    this.logEntries   = [];
    this.frameCounter = 0;
    this.logIdCounter = 1;
  },

  // Add one detection event to state
  addDetection(vehicleIndex, confidence) {
    this.counts[vehicleIndex]++;
    this.frameCounter++;

    const entry = {
      id:         this.logIdCounter++,
      time:       new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      vehicle:    VEHICLES[vehicleIndex],
      confidence: confidence,
      frame:      this.frameCounter,
    };

    this.logEntries.unshift(entry);

    // Keep log from growing unbounded
    if (this.logEntries.length > CONFIG.app.maxLogRows) {
      this.logEntries.pop();
    }

    return entry;
  },

  get totalDetections() {
    return this.counts.reduce((sum, n) => sum + n, 0);
  },

  get topVehicle() {
    const maxCount = Math.max(...this.counts);
    const topIndex = this.counts.indexOf(maxCount);
    return { vehicle: VEHICLES[topIndex], count: maxCount };
  },
};
