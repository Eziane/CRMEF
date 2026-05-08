/* eslint-disable no-unused-vars */

function iconUse(id) {
  return `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;
}

function renderToolbox() {
  const tb = document.getElementById('toolbox');
  tb.innerHTML = '';
  const types = currentChallenge.toolbox;
  document.getElementById('toolbox-count').textContent = types.length;

  types.forEach(type => {
    const def = BLOCKS[type];
    const el = document.createElement('div');
    el.className = 'tool-block';
    el.dataset.type = type;
    el.innerHTML = `
      <div class="block k-${type}">
        ${iconUse(def.iconId)}
        <span class="label">${def.label}${def.container ? '…' : ''}</span>
      </div>`;
    DragDrop.attachToolboxDrag(el, type);
    tb.appendChild(el);
  });
}

function renderWorkspace() {
  const list = document.getElementById('workspace-list');
  list.innerHTML = '';

  if (workspace.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round"><use href="#i-blocks"/></svg>
        <h4>Programme vide</h4>
        <p>Glisse des blocs depuis la bo\xeete \xe0 outils pour commencer.</p>
      </div>`;
    document.getElementById('block-count').textContent = '0 bloc';
    return;
  }

  workspace.forEach((node, idx) => list.appendChild(buildNodeElement(node, [idx])));

  const n = countBlocks(workspace);
  document.getElementById('block-count').textContent = n + ' bloc' + (n > 1 ? 's' : '');
}

function buildNodeElement(node, path) {
  const def  = BLOCKS[node.type];
  const wrap = document.createElement('div');
  wrap.className  = 'ws-block-wrap';
  wrap.dataset.path = JSON.stringify(path);

  const ws = document.createElement('div');
  ws.className = 'ws-block ' + (def.container ? 'has-body' : 'no-body');

  // --- head ---
  const head = document.createElement('div');
  head.className = `block block-head k-${node.type}`;

  let inner = iconUse(def.iconId);
  if (node.type === 'repeat') {
    inner += `<span class="label">R\xe9p\xe9ter</span>
              <input type="number" class="count-input" min="1" max="20" value="${node.count}">
              <span class="label" style="flex:0">fois</span>`;
  } else {
    inner += `<span class="label">${def.label}</span>`;
  }
  inner += `<button class="del" title="Supprimer">${iconUse('i-x')}</button>`;
  head.innerHTML = inner;

  head.querySelector('.del').addEventListener('click', e => {
    e.stopPropagation();
    removeAt(path);
    renderWorkspace();
  });

  if (node.type === 'repeat') {
    const inp = head.querySelector('.count-input');
    inp.addEventListener('change', () => {
      const v = Math.max(1, Math.min(20, parseInt(inp.value) || 1));
      inp.value = v;
      node.count = v;
    });
    inp.addEventListener('click',     e => e.stopPropagation());
    inp.addEventListener('mousedown', e => e.stopPropagation());
  }

  head.addEventListener('mousedown', e => {
    if (e.target.closest('.del') || e.target.closest('.count-input')) return;
    DragDrop.startWorkspaceDrag(e, path, wrap);
  });

  ws.appendChild(head);

  // --- body slots (container blocks) ---
  if (def.container) {
    ws.appendChild(buildBodySlot(node.children, [...path, 'children']));

    if (def.hasElse) {
      const elseHead = document.createElement('div');
      elseHead.className = `block-else-head k-${node.type}`;
      elseHead.innerHTML = `${iconUse('i-corner-down-right')}<span class="label">Sinon</span>`;
      ws.appendChild(elseHead);

      const elseBody = buildBodySlot(node.elseChildren, [...path, 'elseChildren']);
      elseBody.style.borderRadius = '0 0 var(--radius) var(--radius)';
      ws.appendChild(elseBody);
    }
  }

  wrap.appendChild(ws);
  return wrap;
}

function buildBodySlot(childArr, rolePath) {
  const body = document.createElement('div');
  body.className = 'block-body' + (childArr.length === 0 ? ' empty' : '');
  body.dataset.rolePath = JSON.stringify(rolePath);

  if (childArr.length === 0) {
    body.textContent = '— d\xe9poser ici —';
  } else {
    childArr.forEach((c, i) => body.appendChild(buildNodeElement(c, [...rolePath, i])));
  }
  return body;
}
