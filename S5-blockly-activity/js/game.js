/* eslint-disable no-unused-vars */

const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

var robot   = null;
var running = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── state queries ──────────────────────────────────────────────────────────
function inBounds(x, y) {
  const lvl = LEVELS[currentLevel];
  return x >= 0 && x < lvl.cols && y >= 0 && y < lvl.rows;
}

function isWall(x, y) {
  return LEVELS[currentLevel].walls.some(w => w.x === x && w.y === y);
}

function frontCell(state) {
  const dx = [0, 1, 0, -1][state.dir];
  const dy = [-1, 0, 1, 0][state.dir];
  return { x: state.x + dx, y: state.y + dy };
}

function pathClear(state) {
  const f = frontCell(state);
  return inBounds(f.x, f.y) && !isWall(f.x, f.y);
}

// ── robot init ─────────────────────────────────────────────────────────────
function resetRobot() {
  const s = LEVELS[currentLevel].start;
  robot = { x: s.x, y: s.y, dir: s.dir };
  drawGame();
}

// ── canvas drawing ─────────────────────────────────────────────────────────
function drawGame() {
  const lvl  = LEVELS[currentLevel];
  const W    = canvas.width;
  const H    = canvas.height;
  const pad  = 14;
  const cell = Math.floor(Math.min((W - pad * 2) / lvl.cols, (H - pad * 2) / lvl.rows));
  const offX = (W - cell * lvl.cols) / 2;
  const offY = (H - cell * lvl.rows) / 2;

  ctx.clearRect(0, 0, W, H);

  // grid cells
  for (let row = 0; row < lvl.rows; row++) {
    for (let col = 0; col < lvl.cols; col++) {
      ctx.fillStyle = (col + row) % 2 === 0 ? '#F4ECD8' : '#EBE0C5';
      ctx.fillRect(offX + col * cell, offY + row * cell, cell, cell);
    }
  }

  // grid lines
  ctx.strokeStyle = 'rgba(14,26,43,.08)';
  ctx.lineWidth   = 1;
  for (let c = 0; c <= lvl.cols; c++) {
    ctx.beginPath();
    ctx.moveTo(offX + c * cell, offY);
    ctx.lineTo(offX + c * cell, offY + cell * lvl.rows);
    ctx.stroke();
  }
  for (let r = 0; r <= lvl.rows; r++) {
    ctx.beginPath();
    ctx.moveTo(offX, offY + r * cell);
    ctx.lineTo(offX + cell * lvl.cols, offY + r * cell);
    ctx.stroke();
  }

  // walls
  lvl.walls.forEach(w => {
    const px = offX + w.x * cell;
    const py = offY + w.y * cell;
    ctx.fillStyle = '#3A4458';
    ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4);
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let i = 4; i < cell - 4; i += 6) ctx.fillRect(px + i, py + 4, 2, cell - 8);
  });

  // target
  drawTarget(offX + lvl.goal.x * cell + cell / 2, offY + lvl.goal.y * cell + cell / 2, cell * 0.32);

  // robot
  drawRobot(offX + robot.x * cell + cell / 2, offY + robot.y * cell + cell / 2, cell * 0.42, robot.dir);
}

function drawTarget(cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 3; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 - i * 0.22), 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#E94F37' : '#FFFFFF';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#0E1A2B';
  ctx.fill();
  ctx.restore();
}

function drawRobot(cx, cy, r, dir) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(dir * Math.PI / 2);

  // shadow
  ctx.fillStyle = 'rgba(14,26,43,.18)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.7, r * 0.7, r * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // body
  const w = r * 1.4, h = r * 1.5;
  roundRect(-w / 2, -h / 2 + r * 0.08, w, h, r * 0.22, '#3B6BC9', '#0E1A2B');

  // direction fin
  ctx.beginPath();
  ctx.moveTo(0, -h / 2 - r * 0.18);
  ctx.lineTo(-r * 0.28, -h / 2 + r * 0.05);
  ctx.lineTo( r * 0.28, -h / 2 + r * 0.05);
  ctx.closePath();
  ctx.fillStyle = '#E94F37';
  ctx.fill();
  ctx.strokeStyle = '#0E1A2B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // visor
  roundRect(-w / 2 + r * 0.18, -h / 2 + r * 0.32, w - r * 0.36, h * 0.32, r * 0.1, '#0E1A2B', null);
  ctx.fillStyle = '#7CCDF7';
  ctx.fillRect(-r * 0.4, -h / 2 + r * 0.45, r * 0.25, r * 0.18);
  ctx.fillRect( r * 0.15, -h / 2 + r * 0.45, r * 0.25, r * 0.18);
  ctx.fillStyle = '#0E1A2B';
  ctx.fillRect(-r * 0.3, -h / 2 + r * 0.5, r * 0.08, r * 0.08);
  ctx.fillRect( r * 0.22, -h / 2 + r * 0.5, r * 0.08, r * 0.08);

  // chest LED
  ctx.fillStyle = '#FFD54A';
  ctx.beginPath();
  ctx.arc(0, r * 0.18, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0E1A2B';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  if (fill)   { ctx.fillStyle   = fill;        ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.8; ctx.stroke(); }
}

// ── execution engine ───────────────────────────────────────────────────────
async function runProgram() {
  if (running) return;
  if (workspace.length === 0) {
    setStatus('fail', 'Ton programme est vide. Glisse au moins un bloc.');
    return;
  }
  running = true;
  document.getElementById('run-btn').disabled   = true;
  document.getElementById('reset-btn').disabled = true;
  resetRobot();
  setStatus('running', 'Ex\xe9cution du programme…');

  try {
    await execBlocks(workspace);
  } catch (err) {
    setStatus('fail', err.message);
    finishRun();
    return;
  }

  const lvl = LEVELS[currentLevel];
  if (robot.x === lvl.goal.x && robot.y === lvl.goal.y) {
    setStatus('success', 'Le robot a atteint la cible. Excellent !');
    completed.add(currentLevel);
    refreshStepperDots();
    showCompleteModal();
  } else {
    setStatus('fail', 'Le robot n’a pas atteint la cible. V\xe9rifie ton programme.');
  }
  finishRun();
}

function finishRun() {
  running = false;
  document.getElementById('run-btn').disabled   = false;
  document.getElementById('reset-btn').disabled = false;
}

async function execBlocks(blocks) {
  for (const b of blocks) await execBlock(b);
}

async function execBlock(block) {
  switch (block.type) {
    case 'move': {
      const f = frontCell(robot);
      if (!inBounds(f.x, f.y)) throw new Error('Le robot est sorti du terrain.');
      if (isWall(f.x, f.y))    throw new Error('Le robot a heurté un mur.');
      robot.x = f.x; robot.y = f.y;
      drawGame();
      await sleep(380);
      break;
    }
    case 'turnR':
      robot.dir = (robot.dir + 1) % 4;
      drawGame();
      await sleep(280);
      break;
    case 'turnL':
      robot.dir = (robot.dir + 3) % 4;
      drawGame();
      await sleep(280);
      break;
    case 'repeat': {
      const n = Math.max(1, Math.min(20, block.count || 1));
      for (let i = 0; i < n; i++) await execBlocks(block.children);
      break;
    }
    case 'ifFree':
      if (pathClear(robot)) await execBlocks(block.children);
      else                  await execBlocks(block.elseChildren);
      break;
  }
}
