/* eslint-disable no-unused-vars */

// ── Navigation state ──────────────────────────────────────────────────────
var currentStep         = 0;
var currentChallengeIdx = 0;
var currentChallenge    = null; // set by selectChallenge(), used by game.js & render.js

// ── Progress (localStorage) ───────────────────────────────────────────────
const STORAGE_KEY = 'robopath_v2_progress';

function loadCompleted() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return new Set(Array.isArray(raw.completed) ? raw.completed : []);
  } catch { return new Set(); }
}

function saveCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...completed] }));
  } catch {}
}

var completed = loadCompleted();

// ── Status bar ────────────────────────────────────────────────────────────
const STATUS_ICONS = {
  info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  fail:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  running: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>'
};

function setStatus(cls, text) {
  const s = document.getElementById('status');
  s.className = 'status-bar ' + cls;
  s.innerHTML = STATUS_ICONS[cls] + '<span>' + text + '</span>';
}

// ── Helpers ────────────────────────────────────────────────────────────────
function isStepComplete(si) {
  return CURRICULUM[si].challenges.every(c => completed.has(c.id));
}
function totalDone() {
  return CURRICULUM.reduce((n, s) => n + s.challenges.filter(c => completed.has(c.id)).length, 0);
}
function totalChallenges() {
  return CURRICULUM.reduce((n, s) => n + s.challenges.length, 0);
}

// ── Render step stepper ────────────────────────────────────────────────────
function refreshStepper() {
  document.querySelectorAll('.step').forEach((el, si) => {
    el.classList.toggle('active',    si === currentStep);
    el.classList.toggle('complete',  isStepComplete(si));
  });
}

// ── Render challenge dots ──────────────────────────────────────────────────
function renderChallengeDots() {
  const step       = CURRICULUM[currentStep];
  const container  = document.getElementById('challenge-dots');
  container.innerHTML = '';

  step.challenges.forEach((c, ci) => {
    const btn = document.createElement('button');
    btn.className = 'cdot';
    btn.title     = c.title;
    if (completed.has(c.id))     btn.classList.add('done');
    if (ci === currentChallengeIdx) btn.classList.add('active');
    btn.addEventListener('click', () => selectChallenge(currentStep, ci));
    container.appendChild(btn);
  });

  // prev / next enabled states
  const step_  = CURRICULUM[currentStep];
  document.getElementById('prev-btn').disabled =
    currentStep === 0 && currentChallengeIdx === 0;
  document.getElementById('next-btn').disabled =
    currentStep === CURRICULUM.length - 1 &&
    currentChallengeIdx === step_.challenges.length - 1;

  // challenge counter label
  document.getElementById('challenge-label').textContent =
    'D\xe9fi ' + (currentChallengeIdx + 1) + ' / ' + step_.challenges.length;
}

// ── Mark challenge complete (called from game.js on success) ──────────────
function markChallengeComplete(id) {
  if (completed.has(id)) {
    showCompleteModal(false); // already done, just show modal again
    return;
  }
  completed.add(id);
  saveCompleted();
  refreshStepper();
  renderChallengeDots();
  showCompleteModal(true);
}

// ── Completion modal ───────────────────────────────────────────────────────
function showCompleteModal(firstTime) {
  const step        = CURRICULUM[currentStep];
  const isLastInStep = currentChallengeIdx === step.challenges.length - 1;
  const isLastStep  = currentStep === CURRICULUM.length - 1;
  const allDone     = totalDone() === totalChallenges();

  let title, text, btnLabel;

  if (allDone) {
    title    = 'Activit\xe9 termin\xe9e !';
    text     = 'Tu ma\xeEtrises les s\xe9quences, les boucles et les conditions. F\xe9licitations !';
    btnLabel = 'Recommencer';
  } else if (isLastInStep && isLastStep) {
    title    = 'Derni\xe8re \xe9tape valid\xe9e !';
    text     = 'Tu as compl\xe9t\xe9 toutes les \xe9tapes. Essaie de recommencer avec un programme plus court.';
    btnLabel = 'Recommencer';
  } else if (isLastInStep) {
    title    = '\xc9tape ' + (currentStep + 1) + ' valid\xe9e !';
    text     = "Tu ma\xeEtrises ce concept. Passe \xe0 l'\xe9tape suivante.";
    btnLabel = '\xc9tape suivante';
  } else {
    title    = 'D\xe9fi r\xe9ussi !';
    text     = firstTime
      ? "Bon programme ! Passe au d\xe9fi suivant."
      : "D\xe9j\xe0 valid\xe9. Continue d'explorer !";
    btnLabel = 'D\xe9fi suivant';
  }

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent  = text;

  const btn = document.getElementById('modal-next');
  btn.textContent = '';
  btn.insertAdjacentText('beforeend', btnLabel + ' ');
  btn.insertAdjacentHTML('beforeend',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" ' +
    'stroke-linejoin="round" style="width:14px;height:14px;stroke-width:2.5">' +
    '<path d="M5 12h14M13 5l7 7-7 7"/></svg>');

  document.getElementById('modal').classList.add('show');
}

document.getElementById('modal-next').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('show');

  const step        = CURRICULUM[currentStep];
  const isLastInStep = currentChallengeIdx === step.challenges.length - 1;
  const isLastStep  = currentStep === CURRICULUM.length - 1;

  if (isLastInStep && isLastStep) {
    selectChallenge(0, 0); // restart
  } else if (isLastInStep) {
    selectChallenge(currentStep + 1, 0); // next step, first challenge
  } else {
    selectChallenge(currentStep, currentChallengeIdx + 1); // next challenge
  }
});

// ── Core navigation ────────────────────────────────────────────────────────
function selectChallenge(si, ci) {
  currentStep         = si;
  currentChallengeIdx = ci;
  currentChallenge    = CURRICULUM[si].challenges[ci];

  resetWorkspace();

  const step = CURRICULUM[si];
  document.getElementById('level-num').textContent =
    step.name + ' · D\xe9fi ' + (ci + 1) + ' / ' + step.challenges.length;
  document.getElementById('level-title').textContent       = currentChallenge.title;
  document.getElementById('level-instruction').textContent = currentChallenge.instruction;
  document.getElementById('concept-text').textContent      = step.concept;
  document.getElementById('grid-size').textContent =
    currentChallenge.cols + ' \xd7 ' + currentChallenge.rows;

  refreshStepper();
  renderChallengeDots();
  renderToolbox();
  renderWorkspace();
  resetRobot();
  setStatus('info', 'Glisse les blocs depuis la bo\xeete \xe0 outils pour construire ton programme.');
}

function selectStep(si) {
  // Go to first incomplete challenge in the step, otherwise first challenge
  const step = CURRICULUM[si];
  const first = step.challenges.findIndex(c => !completed.has(c.id));
  selectChallenge(si, first === -1 ? 0 : first);
}

// ── Prev / Next challenge buttons ──────────────────────────────────────────
document.getElementById('prev-btn').addEventListener('click', () => {
  if (currentChallengeIdx > 0) {
    selectChallenge(currentStep, currentChallengeIdx - 1);
  } else if (currentStep > 0) {
    const prevStep = CURRICULUM[currentStep - 1];
    selectChallenge(currentStep - 1, prevStep.challenges.length - 1);
  }
});

document.getElementById('next-btn').addEventListener('click', () => {
  const step = CURRICULUM[currentStep];
  if (currentChallengeIdx < step.challenges.length - 1) {
    selectChallenge(currentStep, currentChallengeIdx + 1);
  } else if (currentStep < CURRICULUM.length - 1) {
    selectChallenge(currentStep + 1, 0);
  }
});

// ── Step tab clicks ────────────────────────────────────────────────────────
document.querySelectorAll('.step').forEach((tab, si) => {
  tab.addEventListener('click', () => selectStep(si));
});

// ── Run / Reset ────────────────────────────────────────────────────────────
document.getElementById('run-btn').addEventListener('click', runProgram);

document.getElementById('reset-btn').addEventListener('click', () => {
  if (running) return;
  resetRobot();
  setStatus('info', 'Robot remis \xe0 sa position de d\xe9part.');
});

// ── Init ───────────────────────────────────────────────────────────────────
// Resume at the first incomplete challenge, or the very beginning
(function init() {
  let startStep = 0, startChallenge = 0;
  outer: for (let si = 0; si < CURRICULUM.length; si++) {
    for (let ci = 0; ci < CURRICULUM[si].challenges.length; ci++) {
      if (!completed.has(CURRICULUM[si].challenges[ci].id)) {
        startStep = si;
        startChallenge = ci;
        break outer;
      }
    }
  }
  selectChallenge(startStep, startChallenge);
})();
