/* eslint-disable no-unused-vars */

// DragDrop — custom pointer-based drag-and-drop
// The ghost has pointer-events:none so elementFromPoint sees through it.
const DragDrop = (() => {

  let state = null;     // active drag state
  let indicator = null; // reusable drop-line element

  // ── ghost ──────────────────────────────────────────────────────────────
  function createGhost(type) {
    const def   = BLOCKS[type];
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.innerHTML = `<div class="block k-${type}">
      <svg class="icon" aria-hidden="true"><use href="#${def.iconId}"/></svg>
      <span class="label">${def.label}</span>
    </div>`;
    document.body.appendChild(ghost);
    return ghost;
  }

  function moveGhost(x, y) {
    if (!state?.ghost) return;
    state.ghost.style.left = (x + 14) + 'px';
    state.ghost.style.top  = (y + 14) + 'px';
  }

  // ── public API ──────────────────────────────────────────────────────────
  function attachToolboxDrag(el, type) {
    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      beginDrag({ kind: 'toolbox', type, sourceEl: el }, e.clientX, e.clientY);
    });
    // passive:false so we can call preventDefault and stop page scroll
    el.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0];
      beginDrag({ kind: 'toolbox', type, sourceEl: el }, t.clientX, t.clientY);
    }, { passive: false });
  }

  function startWorkspaceDrag(e, path, wrap) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const node = nodeAt(path);
    beginDrag({
      kind:       'workspace',
      type:       node.type,
      sourcePath: [...path],
      sourceEl:   wrap
    }, e.clientX, e.clientY);
  }

  // ── drag lifecycle ──────────────────────────────────────────────────────
  function beginDrag(info, x, y) {
    if (state) return; // guard against double-start
    state = { ...info, ghost: createGhost(info.type) };
    info.sourceEl.classList.add('dragging');
    moveGhost(x, y);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend',  onEnd);
  }

  function onTouchMove(e) {
    e.preventDefault(); // prevents scroll while dragging
    const t = e.touches[0];
    if (t) onMove({ clientX: t.clientX, clientY: t.clientY });
  }

  function onMove(e) {
    if (!state) return;
    moveGhost(e.clientX, e.clientY);
    updateDropTarget(e.clientX, e.clientY);
  }

  // ── drop-target resolution ──────────────────────────────────────────────
  function updateDropTarget(x, y) {
    clearIndicator();

    const wsEl   = document.getElementById('workspace');
    const wsRect = wsEl.getBoundingClientRect();
    const inWs   = x >= wsRect.left && x <= wsRect.right &&
                   y >= wsRect.top  && y <= wsRect.bottom;
    wsEl.classList.toggle('drag-over', inWs);
    if (!inWs) return;

    // Ghost has pointer-events:none → elementFromPoint sees the real element under cursor
    const hitEl = document.elementFromPoint(x, y);
    if (!hitEl) return;

    const listEl = document.getElementById('workspace-list');
    const bodyEl = hitEl.closest('.block-body');
    const wrapEl = hitEl.closest('.ws-block-wrap'); // nearest container block

    let containerEl, rolePath, isRoot;

    // ── Escape detection ────────────────────────────────────────────────────
    // When the cursor is inside a body BUT in the bottom EXIT_PX of the parent
    // ws-block-wrap (and the body is non-empty), the user is trying to drop
    // AFTER the container block, not inside it.
    const EXIT_PX = 22;
    let escaped = false;

    if (bodyEl && wrapEl && listEl.contains(bodyEl)) {
      const hasChildren = Array.from(bodyEl.children)
        .some(c => c.classList.contains('ws-block-wrap'));
      const wrapBottom  = wrapEl.getBoundingClientRect().bottom;

      if (hasChildren && y >= wrapBottom - EXIT_PX) {
        escaped = true;
        // Promote to the parent container of wrapEl
        const parentBodyEl = wrapEl.parentElement?.closest('.block-body');
        if (parentBodyEl && listEl.contains(parentBodyEl)) {
          containerEl = parentBodyEl;
          rolePath    = JSON.parse(parentBodyEl.dataset.rolePath);
          isRoot      = false;
        } else {
          containerEl = listEl;
          rolePath    = null;
          isRoot      = true;
        }
      }
    }

    // ── Normal target resolution (no escape) ────────────────────────────────
    if (!escaped) {
      if (bodyEl && listEl.contains(bodyEl)) {
        // dropping into a container body
        if (state.kind === 'workspace') {
          const rp    = JSON.parse(bodyEl.dataset.rolePath);
          const pPath = rp.slice(0, -1);
          if (pathsEqual(pPath, state.sourcePath) ||
              isAncestorPath(state.sourcePath, pPath)) return;
        }
        containerEl = bodyEl;
        rolePath    = JSON.parse(bodyEl.dataset.rolePath);
        isRoot      = false;
      } else if (listEl.contains(hitEl) || hitEl === listEl) {
        containerEl = listEl;
        rolePath    = null;
        isRoot      = true;
      } else {
        return;
      }
    }

    // Ensure relative positioning so the absolute indicator renders correctly
    if (getComputedStyle(containerEl).position === 'static') {
      containerEl.style.position = 'relative';
    }

    // ── compute insertion index from cursor Y vs. child midpoints ──
    const allWraps  = Array.from(containerEl.children)
                        .filter(c => c.classList.contains('ws-block-wrap'));
    const cRect     = containerEl.getBoundingClientRect();
    let   insertIdx = allWraps.length;
    let   indicatorY;

    if (allWraps.length === 0) {
      indicatorY = cRect.height / 2;
    } else {
      // Default: after the last child
      indicatorY = allWraps[allWraps.length - 1].getBoundingClientRect().bottom - cRect.top;

      for (let i = 0; i < allWraps.length; i++) {
        const r = allWraps[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) {
          insertIdx  = i;
          indicatorY = r.top - cRect.top;
          break;
        }
      }
    }

    // Highlight the active container if it's a body (not the escaped-from body)
    if (containerEl.classList.contains('block-body')) {
      containerEl.classList.add('drag-over');
    }

    // Attach / reuse indicator
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'drop-indicator';
    }
    if (indicator.parentNode !== containerEl) containerEl.appendChild(indicator);
    indicator.style.top = indicatorY + 'px';

    // Store resolved target on the indicator for use in onEnd
    indicator._target = { isRoot, rolePath, insertIdx };
  }

  function clearIndicator() {
    document.querySelectorAll('.block-body.drag-over')
      .forEach(el => el.classList.remove('drag-over'));
    indicator?.parentNode?.removeChild(indicator);
  }

  // ── drop / end ──────────────────────────────────────────────────────────
  function onEnd() {
    if (!state) return;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onEnd);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend',  onEnd);

    const target = indicator?._target;
    if (target) performDrop(target);

    cleanup();
  }

  function performDrop(target) {
    let parentPath, role, idx;

    if (target.isRoot) {
      parentPath = []; role = null; idx = target.insertIdx;
    } else {
      const rp   = target.rolePath;
      parentPath = rp.slice(0, -1);
      role       = rp[rp.length - 1];
      idx        = target.insertIdx;
    }

    let node;

    if (state.kind === 'toolbox') {
      node = newNode(state.type);
    } else {
      // Moving a workspace block:
      // 1. Identify whether source and target share the same parent array.
      // 2. Remove the node from its current position.
      // 3. Adjust the insertion index if needed (removing shifts later items back by 1).
      const srcPath      = state.sourcePath;
      const targetArrKey = role === null ? [] : [...parentPath, role];
      const srcArrKey    = srcPath.slice(0, -1);
      const sameArr      = pathsEqual(targetArrKey, srcArrKey);
      const srcIdx       = srcPath[srcPath.length - 1];

      node = removeAt(srcPath);

      if (sameArr && srcIdx < idx) idx--;
    }

    insertAt(parentPath, role, idx, node);
    renderWorkspace();

    // Animate the freshly placed block
    requestAnimationFrame(() => {
      const newPath  = role === null ? [idx] : [...parentPath, role, idx];
      const inserted = document.querySelector(
        `[data-path='${JSON.stringify(newPath)}']`
      );
      if (inserted) {
        inserted.classList.add('appearing');
        inserted.addEventListener(
          'animationend',
          () => inserted.classList.remove('appearing'),
          { once: true }
        );
      }
    });
  }

  function cleanup() {
    state?.ghost?.remove();
    state?.sourceEl?.classList.remove('dragging');
    document.getElementById('workspace')?.classList.remove('drag-over');
    clearIndicator();
    state = null;
  }

  return { attachToolboxDrag, startWorkspaceDrag };
})();
