const GOAL_STEPS = 10000;
const DASH_STEPS = 8420;

const historyData = [
  { date: "Fri, May 1", distance: "6.1 km", time: "46m", calories: "478 kcal" },
  { date: "Thu, Apr 30", distance: "4.8 km", time: "35m", calories: "354 kcal" },
  { date: "Wed, Apr 29", distance: "8.3 km", time: "59m", calories: "640 kcal" },
  { date: "Tue, Apr 28", distance: "3.9 km", time: "30m", calories: "291 kcal" }
];

const weeklySteps = [6800, 7200, 8200, 9500, 9100, 10800, 9900];

const state = {
  timerSeconds: 0,
  steps: 0,
  distanceKm: 0,
  paused: false,
  intervalRef: null
};

const ringFill = document.getElementById("ringFill");
const historyList = document.getElementById("historyList");
const weeklyChart = document.getElementById("weeklyChart");
const runTimer = document.getElementById("runTimer");
const liveSteps = document.getElementById("liveSteps");
const liveDistance = document.getElementById("liveDistance");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const themeToggle = document.getElementById("themeToggle");

function animateRing(steps) {
  const progress = Math.min(steps / GOAL_STEPS, 1);
  const ringLength = 565;
  ringFill.style.strokeDashoffset = String(ringLength - ringLength * progress);
}

function renderHistory() {
  historyList.innerHTML = historyData
    .map(
      (run) => `
      <article class="history-card">
        <div class="history-head">
          <strong>${run.date}</strong>
          <span class="label">${run.time}</span>
        </div>
        <div class="history-metrics">
          <span>${run.distance}</span>
          <span>${run.calories}</span>
        </div>
      </article>
    `
    )
    .join("");
}

function renderWeeklyBars() {
  const highest = Math.max(...weeklySteps);
  weeklyChart.innerHTML = weeklySteps
    .map((value, idx) => {
      const height = Math.max(18, Math.round((value / highest) * 120));
      return `<div class="bar" title="Day ${idx + 1}: ${value}" style="height:${height}px"></div>`;
    })
    .join("");
}

function formatClock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function tickRun() {
  if (state.paused) return;
  state.timerSeconds += 1;
  state.steps += Math.floor(Math.random() * 4) + 2;
  state.distanceKm = state.steps * 0.00078;
  runTimer.textContent = formatClock(state.timerSeconds);
  liveSteps.textContent = state.steps.toLocaleString();
  liveDistance.textContent = `${state.distanceKm.toFixed(2)} km`;
}

function startRunSession() {
  if (state.intervalRef) return;
  state.intervalRef = setInterval(tickRun, 1000);
}

function resetRunSession() {
  clearInterval(state.intervalRef);
  state.intervalRef = null;
  state.timerSeconds = 0;
  state.steps = 0;
  state.distanceKm = 0;
  state.paused = false;
  runTimer.textContent = "00:00";
  liveSteps.textContent = "0";
  liveDistance.textContent = "0.00 km";
  pauseBtn.classList.remove("hidden");
  resumeBtn.classList.add("hidden");
}

document.querySelectorAll(".nav-trigger").forEach((node) => {
  node.addEventListener("click", () => {
    const target = node.getAttribute("data-target");
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("active", screen.id === target);
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("data-target") === target);
    });

    if (target === "run") startRunSession();
    if (target !== "run" && !state.paused && state.timerSeconds > 0) state.paused = true;
  });
});

pauseBtn.addEventListener("click", () => {
  state.paused = true;
  pauseBtn.classList.add("hidden");
  resumeBtn.classList.remove("hidden");
});

resumeBtn.addEventListener("click", () => {
  state.paused = false;
  resumeBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
});

document.getElementById("stopBtn").addEventListener("click", () => {
  const latest = {
    date: "Today",
    distance: `${state.distanceKm.toFixed(2)} km`,
    time: `${Math.max(1, Math.floor(state.timerSeconds / 60))}m`,
    calories: `${Math.max(40, Math.round(state.distanceKm * 75))} kcal`
  };
  historyData.unshift(latest);
  renderHistory();
  resetRunSession();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("theme-dark");
  document.body.classList.toggle("theme-light");
});

animateRing(DASH_STEPS);
renderHistory();
renderWeeklyBars();
