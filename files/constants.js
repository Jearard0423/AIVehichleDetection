// ============================================================
//  constants.js
//  Static data: vehicle definitions, chart colors, hourly
//  sample data used before real detections come in.
// ============================================================

const VEHICLES = [
  { id: "jeepney",    label: "Jeepney",    color: "#2563eb", badgeClass: "badge-jeepney"    },
  { id: "tricycle",   label: "Tricycle",   color: "#d97706", badgeClass: "badge-tricycle"   },
  { id: "bus",        label: "Bus",        color: "#16a34a", badgeClass: "badge-bus"        },
  { id: "car",        label: "Car",        color: "#7c3aed", badgeClass: "badge-car"        },
  { id: "motorcycle", label: "Motorcycle", color: "#dc2626", badgeClass: "badge-motorcycle" },
  { id: "uv-express", label: "UV Express", color: "#0891b2", badgeClass: "badge-uv"        },
];

// Labels for the hourly chart x-axis
const HOUR_LABELS = [
  "5a","6a","7a","8a","9a","10a","11a",
  "12p","1p","2p","3p","4p","5p","6p","7p","8p"
];

// Sample hourly data used as placeholder before real data loads
const SAMPLE_HOURLY = {
  today: [
    [12,28,55,42,38,30,22,18,25,32,40,48,55,38,30,20],
    [8, 15,30,25,20,18,14,10,15,20,25,30,35,22,18,12],
    [4,  8,18,14,12,10, 8, 6, 9,12,16,20,22,14,10, 7],
    [5, 12,20,18,15,12, 9, 8,12,15,18,22,25,17,13, 9],
    [3,  7,14,10, 9, 8, 6, 5, 7, 9,12,15,18,11, 8, 5],
    [2,  5, 9, 8, 7, 6, 5, 4, 5, 7, 9,12,14, 9, 6, 3],
  ],
  yesterday: [
    [10,22,48,38,34,27,19,16,22,29,36,43,50,34,27,18],
    [7, 12,27,22,18,15,12, 9,13,18,22,27,32,20,16,10],
    [3,  6,15,12,10, 8, 7, 5, 8,10,14,18,20,12, 9, 6],
    [4, 10,17,15,13,10, 8, 7,10,13,16,20,22,15,11, 8],
    [2,  5,11, 8, 7, 6, 5, 4, 6, 8,10,13,16, 9, 7, 4],
    [1,  3, 7, 5, 4, 4, 3, 2, 4, 5, 7, 9,11, 6, 4, 2],
  ],
  week: [
    [80,140,210,190,170,145,110,90,115,145,175,210,240,165,130,90],
    [50, 80,130,115,100, 88, 70,55, 70, 90,115,135,155,100, 80,55],
    [28, 48, 80, 70, 62, 52, 42,36, 44, 54, 68, 88,100, 65, 50,35],
    [35, 65, 95, 85, 75, 62, 48,42, 56, 68, 82,100,112, 74, 58,40],
    [22, 40, 65, 55, 48, 40, 32,28, 36, 44, 54, 68, 78, 50, 40,28],
    [15, 28, 45, 38, 33, 28, 22,18, 24, 30, 38, 48, 55, 35, 28,18],
  ],
};

// Starting detection counts (placeholder)
const INITIAL_COUNTS = [487, 312, 198, 176, 111, 0];

// Confidence values per vehicle class (from last model eval)
const MODEL_CONFIDENCE = [93, 85, 91, 90, 82, 88];

// 7-day trend placeholder data
const TREND_DATA = {
  labels: ["Apr 30","May 1","May 2","May 3","May 4","May 5","May 6","May 7"],
  values: [980, 1120, 1045, 1302, 1188, 1410, 1250, 1284],
};
