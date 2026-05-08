/* eslint-disable no-unused-vars */

// Mutable workspace array — treat as a singleton
var workspace = [];

function UID() {
  return Math.random().toString(36).slice(2, 10);
}

function newNode(type) {
  const node = { id: UID(), type };
  if (BLOCKS[type].container) {
    node.children = [];
    if (type === 'repeat') node.count = 3;
    if (BLOCKS[type].hasElse) node.elseChildren = [];
  }
  return node;
}

// Path encoding: [nodeIndex, 'children'|'elseChildren', nodeIndex, …, nodeIndex]
// Examples:
//   [0]                       → workspace[0]
//   [0, 'children', 1]        → workspace[0].children[1]
//   [0, 'elseChildren', 0]    → workspace[0].elseChildren[0]
//   [1, 'children', 0, 'children', 2] → deep nesting

function getParentArray(path) {
  let arr = workspace;
  // Walk in steps of 2: [nodeIdx, childArrayName, nodeIdx, childArrayName, …]
  for (let i = 0; i < path.length - 1; i += 2) {
    arr = arr[path[i]][path[i + 1]];
  }
  return arr;
}

function nodeAt(path) {
  return getParentArray(path)[path[path.length - 1]];
}

function removeAt(path) {
  const arr = getParentArray(path);
  return arr.splice(path[path.length - 1], 1)[0];
}

// parentPath: path to the parent node, or [] for root workspace
// role: 'children' | 'elseChildren' | null (root)
// index: insertion index in that array
function insertAt(parentPath, role, index, node) {
  let arr;
  if (parentPath.length === 0 && role === null) {
    arr = workspace;
  } else {
    arr = nodeAt(parentPath)[role];
  }
  arr.splice(Math.max(0, Math.min(index, arr.length)), 0, node);
}

function pathsEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// Returns true when `anc` is a proper prefix of `desc` (anc is an ancestor of desc)
function isAncestorPath(anc, desc) {
  if (anc.length >= desc.length) return false;
  return anc.every((v, i) => v === desc[i]);
}

function countBlocks(arr) {
  return arr.reduce((n, b) => {
    n++;
    if (b.children)     n += countBlocks(b.children);
    if (b.elseChildren) n += countBlocks(b.elseChildren);
    return n;
  }, 0);
}

function resetWorkspace() {
  workspace.length = 0;
}
