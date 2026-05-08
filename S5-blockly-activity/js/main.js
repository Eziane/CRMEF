/* eslint-disable no-unused-vars */

var currentLevel = 0;
var completed    = new Set();

// ── status bar ─────────────────────────────────────────────────────────────
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

// ── stepper dots ───────────────────────────────────────────────────────────
function refreshStepperDots() {
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('complete', completed.has(i));
  });
}

// ── completion modal ───────────────────────────────────────────────────────
function showCompleteModal() {
  const isLast = currentLevel >= LEVELS.length - 1;
  document.getElementById('modal-title').textContent = isLast
    ? 'Tous les niveaux valid\xe9s'
    : 'Niveau ' + LEVELS[currentLevel].num + ' valid\xe9';
  document.getElementById('modal-text').textContent = isLast
    ? 'Tu ma\xeEtrises les s\xe9quences, les boucles et les conditions. Bravo.'
    : 'Tu ma\xeEtrises ce concept. Passe au niveau suivant.';

  const btn       = document.getElementById('modal-next');
  btn.textContent = '';
  btn.insertAdjacentText('beforeend', isLast ? 'Recommencer ' : 'Continuer ');
  btn.insertAdjacentHTML('beforeend',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;stroke-width:2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>');

  document.getElementById('modal').classList.add('show');
}

document.getElementById('modal-next').addEventListener('click', () => {
  document.getElementById('modal').classList.remove('show');
  selectLevel(currentLevel < LEVELS.length - 1 ? currentLevel + 1 : 0);
});

// ── level selection ────────────────────────────────────────────────────────
function selectLevel(i) {
  currentLevel = i;
  resetWorkspace();

  const lvl = LEVELS[i];
  document.querySelectorAll('.step').forEach((el, idx) =>
    el.classList.toggle('active', idx === i)
  );

  document.getElementById('level-num').textContent         = 'Niveau ' + lvl.num;
  document.getElementById('level-title').textContent       = lvl.title;
  document.getElementById('level-instruction').textContent = lvl.instruction;
  document.getElementById('concept-text').textContent      = lvl.concept;
  document.getElementById('grid-size').textContent         = lvl.cols + ' \xd7 ' + lvl.rows;

  renderToolbox();
  renderWorkspace();
  resetRobot();
  setStatus('info', 'Glisse les blocs depuis la bo\xeete \xe0 outils pour construire ton programme.');
}

// ── control buttons ────────────────────────────────────────────────────────
document.getElementById('run-btn').addEventListener('click', runProgram);

document.getElementById('reset-btn').addEventListener('click', () => {
  if (running) return;
  resetRobot();
  setStatus('info', 'Robot remis \xe0 sa position de d\xe9part.');
});

document.querySelectorAll('.step').forEach(tab => {
  tab.addEventListener('click', () => selectLevel(parseInt(tab.dataset.level)));
});

// ── init ───────────────────────────────────────────────────────────────────
selectLevel(0);
