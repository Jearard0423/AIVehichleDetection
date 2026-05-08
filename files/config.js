// ============================================================
//  config.js
//  All API keys and app-wide configuration live here.
//  ⚠️  DO NOT commit this file to a public GitHub repo.
//  ⚠️  Restrict your Firebase API key to your domain at:
//      https://console.firebase.google.com → Project Settings
// ============================================================

const CONFIG = {

  // ── ROBOFLOW ──────────────────────────────────────────────
  // How to get your Roboflow API key:
  //   1. Go to https://app.roboflow.com
  //   2. Click your workspace name (top-left) → Settings
  //   3. Click "Roboflow API" in the left sidebar
  //   4. Copy the "Private API Key" and paste below
  //
  // How to get your Model ID:
  //   1. Open your project → Versions → pick trained version
  //   2. Click "Deploy" → copy the model endpoint
  //      Format:  project-name/version   e.g. "ph-vehicles/1"
  roboflow: {
    apiKey:     "PASTE_YOUR_ROBOFLOW_API_KEY_HERE",
    modelId:    "PASTE_YOUR_MODEL_ID_HERE",
    apiUrl:     "https://serverless.roboflow.com",
    confidence: 40,
    overlap:    30,
  },

  // ── FIREBASE ──────────────────────────────────────────────
  // Using Firebase Realtime Database for live detection sync.
  // Go to Firebase Console → Realtime Database → Create database
  // Set rules to: { "rules": { ".read": true, ".write": true } }
  // (for development — restrict before going public)
  firebase: {
    apiKey:            "AIzaSyCg-WAC3o0W7TtHaKC0PTryZ-GBBUw88Pc",
    authDomain:        "ai-vehicle-detection.firebaseapp.com",
    projectId:         "ai-vehicle-detection",
    storageBucket:     "ai-vehicle-detection.firebasestorage.app",
    messagingSenderId: "102381560933",
    appId:             "1:102381560933:web:7d666a49cd3cc9556c928c",
    measurementId:     "G-P5MG0M23M8",
    // ↓ Get this from Firebase Console → Realtime Database → your DB URL
    databaseURL:       "https://ai-vehicle-detection-default-rtdb.firebaseio.com",
  },

  // ── YOUTUBE LIVE STREAMS ──────────────────────────────────
  // These are Philippine news channels that stream EDSA /
  // Metro Manila traffic live 24/7. The dashboard lets you
  // switch between them. We capture frames via <canvas> and
  // send to Roboflow for detection every few seconds.
  //
  // NOTE: YouTube blocks cross-origin canvas frame capture
  // (CORS). Frames are sent to Roboflow via your Python
  // backend instead. See detection.js for the flow.
  youtube: {
    captureIntervalMs: 5000,   // how often to grab a frame (ms)
    streams: [
      {
        id:        "gma_news",
        label:     "GMA News Live",
        channelId: "UCdzKGrEXVVSZeSEkr5W4OJw",
        embedId:   "jDS1VeU66PQ",  // GMA News 24/7 live stream video ID
        location:  "Metro Manila / EDSA",
        active:    true,
      },
      {
        id:        "one_news",
        label:     "One News PH",
        channelId: "UCISmzVCKhPY0ZxMAnAGKCGQ",
        embedId:   "aQ8IG-Ee3-s",  // One News PH live stream
        location:  "Metro Manila",
        active:    true,
      },
      {
        id:        "abscbn_news",
        label:     "ABS-CBN News",
        channelId: "UCgGHfcpHKZNNFNB0V88N9WA",
        embedId:   "hfmgFgMsJhY",  // TeleRadyo / ABS-CBN live
        location:  "Metro Manila / EDSA",
        active:    true,
      },
    ],
  },

  // ── APP SETTINGS ──────────────────────────────────────────
  app: {
    name:       "VehicleWatch PH",
    version:    "1.0.0",
    maxLogRows: 50,
  },

};
