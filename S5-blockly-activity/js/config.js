/* eslint-disable no-unused-vars */
const BLOCKS = {
  move:   { label: 'Avancer',          iconId: 'i-arrow-up' },
  turnR:  { label: 'Tourner à droite', iconId: 'i-rotate-cw' },
  turnL:  { label: 'Tourner à gauche', iconId: 'i-rotate-ccw' },
  repeat: { label: 'Répéter',          iconId: 'i-repeat',  container: true },
  ifFree: { label: 'Si chemin libre',  iconId: 'i-branch',  container: true, hasElse: true }
};

const LEVELS = [
  {
    num: '01',
    title: "Les séquences d'instructions",
    instruction: "Un programme exécute ses instructions une par une, dans l'ordre. " +
      "Glisse trois blocs « Avancer » dans ton programme pour guider le robot jusqu'à la cible.",
    concept: 'Séquence',
    cols: 5, rows: 1,
    start: { x: 0, y: 0, dir: 1 },
    goal:  { x: 3, y: 0 },
    walls: [],
    toolbox: ['move']
  },
  {
    num: '02',
    title: 'Les boucles répétitives',
    instruction: "Le chemin est plus long. Plutôt que de placer six blocs « Avancer », " +
      "utilise un bloc « Répéter » et glisse-y les actions à répéter. Une boucle factorise la répétition.",
    concept: 'Boucle',
    cols: 7, rows: 1,
    start: { x: 0, y: 0, dir: 1 },
    goal:  { x: 6, y: 0 },
    walls: [],
    toolbox: ['move', 'repeat']
  },
  {
    num: '03',
    title: 'Les conditions logiques',
    instruction: "L'objectif est en diagonale. Approche directe : combine « Répéter » et « Tourner ». " +
      "Approche élégante : utilise « Si chemin libre … Sinon » pour que le robot prenne la bonne décision.",
    concept: 'Condition',
    cols: 5, rows: 5,
    start: { x: 0, y: 0, dir: 1 },
    goal:  { x: 4, y: 4 },
    walls: [],
    toolbox: ['move', 'turnR', 'turnL', 'repeat', 'ifFree']
  }
];
