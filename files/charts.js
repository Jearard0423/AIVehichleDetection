// ============================================================
//  charts.js
//  All Chart.js instances live here. Each chart has:
//    - an init function  (called once on page load)
//    - an update function (called whenever state changes)
// ============================================================

const Charts = (() => {

  // Private chart instances
  let _hourlyChart = null;
  let _donutChart  = null;
  let _trendChart  = null;

  // ── HOURLY STACKED BAR ──────────────────────────────────
  function initHourly() {
    const ctx = document.getElementById("hourlyChart");
    _hourlyChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels:   HOUR_LABELS,
        datasets: _buildHourlyDatasets("today"),
      },
      options: {
        responsive:           true,
        maintainAspectRatio:  false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            stacked: true,
            grid:    { display: false },
            ticks:   { font: { size: 11 }, color: "#94a3b8", autoSkip: false, maxRotation: 0 },
          },
          y: {
            stacked: true,
            grid:    { color: "rgba(148,163,184,0.15)" },
            ticks:   { font: { size: 11 }, color: "#94a3b8" },
          },
        },
      },
    });
  }

  function _buildHourlyDatasets(tab) {
    return VEHICLES.map((v, i) => ({
      label:           v.label,
      data:            SAMPLE_HOURLY[tab][i],
      backgroundColor: v.color,
      borderWidth:     0,
      borderRadius:    2,
    }));
  }

  function switchHourlyTab(tab) {
    if (!_hourlyChart) return;
    _hourlyChart.data.datasets = _buildHourlyDatasets(tab);
    _hourlyChart.update();
  }

  // ── DONUT / PIE ──────────────────────────────────────────
  function initDonut() {
    const ctx = document.getElementById("donutChart");
    _donutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels:   VEHICLES.map(v => v.label),
        datasets: [{
          data:            [...State.counts],
          backgroundColor: VEHICLES.map(v => v.color),
          borderWidth:     3,
          borderColor:     "#ffffff",
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        cutout:              "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}`,
            },
          },
        },
      },
    });
  }

  function updateDonut() {
    if (!_donutChart) return;
    _donutChart.data.datasets[0].data = [...State.counts];
    _donutChart.update();
  }

  // ── 7-DAY TREND LINE ────────────────────────────────────
  function initTrend() {
    const ctx = document.getElementById("trendChart");
    _trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels:   TREND_DATA.labels,
        datasets: [{
          label:                "Total Detections",
          data:                 TREND_DATA.values,
          borderColor:          "#2563eb",
          backgroundColor:      "rgba(37,99,235,0.08)",
          fill:                 true,
          tension:              0.4,
          pointRadius:          4,
          pointBackgroundColor: "#2563eb",
          borderWidth:          2,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid:  { display: false },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
          y: {
            grid:  { color: "rgba(148,163,184,0.15)" },
            ticks: { font: { size: 11 }, color: "#94a3b8" },
          },
        },
      },
    });
  }

  // ── UPDATE TREND FROM FIREBASE DATA ─────────────────────
  function updateTrend(labels, values) {
    if (!_trendChart) return;
    _trendChart.data.labels            = labels;
    _trendChart.data.datasets[0].data  = values;
    _trendChart.update();
  }

  // ── PUBLIC API ───────────────────────────────────────────
  return {
    init() {
      initHourly();
      initDonut();
      initTrend();
    },
    switchHourlyTab,
    updateDonut,
    updateTrend,
  };

})();
