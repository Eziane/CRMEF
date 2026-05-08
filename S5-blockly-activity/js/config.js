/* eslint-disable no-unused-vars */

const BLOCKS = {
  move:   { label: "Avancer",          iconId: "i-arrow-up" },
  turnR:  { label: "Tourner \xe0 droite", iconId: "i-rotate-cw" },
  turnL:  { label: "Tourner \xe0 gauche", iconId: "i-rotate-ccw" },
  repeat: { label: "R\xe9p\xe9ter",       iconId: "i-repeat",  container: true },
  ifFree: { label: "Si chemin libre",  iconId: "i-branch",  container: true, hasElse: true }
};

// CURRICULUM : 3 steps, each with several challenges ordered easy → hard.
// IDs are "step-challenge" strings used as localStorage keys.
const CURRICULUM = [

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 0 — S\xe9quences
  //  Concept : les instructions s'ex\xe9cutent dans l'ordre.
  //  Toolbox : move only, then move + turns.
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "S\xe9quences",
    concept: "S\xe9quence",
    challenges: [

      // 0-0  Trivial : 2 moves
      {
        id: "0-0",
        title: "Premiers pas",
        instruction: "Un programme ex\xe9cute ses instructions une par une, dans l'ordre. "
          + "Glisse deux blocs \xab\xa0Avancer\xa0\xbb pour guider le robot jusqu'\xe0 la cible.",
        cols: 3, rows: 1,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 2, y: 0 },
        walls: [], toolbox: ["move"]
        // Solution : move, move
      },

      // 0-1  3 moves
      {
        id: "0-1",
        title: "Ligne droite",
        instruction: "La cible est \xe0 trois cases. Place les blocs \xab\xa0Avancer\xa0\xbb "
          + "dans le bon ordre pour que le robot avance pas \xe0 pas.",
        cols: 5, rows: 1,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 3, y: 0 },
        walls: [], toolbox: ["move"]
        // Solution : move × 3
      },

      // 0-2  First turn — L-shape
      {
        id: "0-2",
        title: "L'\xe9querre",
        instruction: "Le chemin fait un coude. Utilise \xab\xa0Avancer\xa0\xbb et un bloc "
          + "\xab\xa0Tourner\xa0\xbb pour changer de direction et atteindre la cible.",
        cols: 4, rows: 4,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 2, y: 2 },
        walls: [], toolbox: ["move", "turnR", "turnL"]
        // Solution : move, move, turnR, move, move
      },

      // 0-3  Two turns — S-path
      {
        id: "0-3",
        title: "Trajet en S",
        instruction: "Le chemin monte puis repart vers la droite : deux virages sont n\xe9cessaires. "
          + "Pense \xe0 l'ordre des blocs : avancer, tourner, avancer, tourner, avancer.",
        cols: 5, rows: 5,
        start: { x: 0, y: 2, dir: 1 }, goal: { x: 4, y: 0 },
        walls: [], toolbox: ["move", "turnR", "turnL"]
        // Solution : move, move, turnL, move, move, turnR, move, move
        // (0,2)E→(1,2)→(2,2)→turnL(N)→(2,1)→(2,0)→turnR(E)→(3,0)→(4,0)
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 1 — Boucles
  //  Concept : factoriser la r\xe9p\xe9tition avec un bloc Repeat.
  //  Toolbox : moves + repeat, puis avec turns.
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "Boucles",
    concept: "Boucle",
    challenges: [

      // 1-0  repeat(4){move}
      {
        id: "1-0",
        title: "Premi\xe8re boucle",
        instruction: "Le robot doit avancer 4 fois. Au lieu de 4 blocs s\xe9par\xe9s, "
          + "utilise un bloc \xab\xa0R\xe9p\xe9ter 4 fois\xa0\xbb avec \xab\xa0Avancer\xa0\xbb \xe0 l'int\xe9rieur.",
        cols: 5, rows: 1,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 0 },
        walls: [], toolbox: ["move", "repeat"]
        // Solution : repeat(4){ move }
      },

      // 1-1  repeat(6){move}
      {
        id: "1-1",
        title: "Grande ligne",
        instruction: "6 cases \xe0 parcourir ! Une boucle \xab\xa0R\xe9p\xe9ter 6 fois\xa0\xbb "
          + "avec \xab\xa0Avancer\xa0\xbb dedans est bien plus \xe9l\xe9gante que six blocs identiques.",
        cols: 7, rows: 1,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 6, y: 0 },
        walls: [], toolbox: ["move", "repeat"]
        // Solution : repeat(6){ move }
      },

      // 1-2  Two loops + one turn — L path
      {
        id: "1-2",
        title: "Chemin en L",
        instruction: "Le chemin va d'abord vers la droite, puis vers le bas. "
          + "Utilise deux boucles \xab\xa0R\xe9p\xe9ter\xa0\xbb et un \xab\xa0Tourner\xa0\xbb entre elles.",
        cols: 5, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 3, y: 3 },
        walls: [], toolbox: ["move", "turnR", "turnL", "repeat"]
        // Solution : repeat(3){move}, turnR, repeat(3){move}
      },

      // 1-3  Three loops + two turns — U path
      {
        id: "1-3",
        title: "Trois c\xf4t\xe9s",
        instruction: "Le robot doit parcourir trois c\xf4t\xe9s d'un carr\xe9. "
          + "Utilise trois boucles \xab\xa0R\xe9p\xe9ter 3 fois\xa0\xbb s\xe9par\xe9es par des virages.",
        cols: 5, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 0, y: 3 },
        walls: [], toolbox: ["move", "turnR", "turnL", "repeat"]
        // Solution : repeat(3){move}, turnR, repeat(3){move}, turnR, repeat(3){move}
        // (0,0)E→(3,0)→turnR(S)→(3,3)→turnR(W)→(0,3)
      },

      // 1-4  Loop with alternating turns — zigzag
      {
        id: "1-4",
        title: "Zigzag",
        instruction: "La cible est en diagonale. Le chemin alterne une case vers la droite "
          + "et une case vers le bas. Peux-tu exprimer ce motif avec une seule boucle ?",
        cols: 5, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 4 },
        walls: [], toolbox: ["move", "turnR", "turnL", "repeat"]
        // Solution : repeat(4){ move, turnR, move, turnL }
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 2 — Conditions
  //  Concept : choisir une action selon l'\xe9tat du terrain (Si chemin libre).
  //  Toolbox : all blocks including ifFree.
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "Conditions",
    concept: "Condition",
    challenges: [

      // 2-0  No walls — diagonal, introduce ifFree concept
      {
        id: "2-0",
        title: "Diagonale",
        instruction: "La cible est en diagonale, sans mur. Utilise \xab\xa0R\xe9p\xe9ter\xa0\xbb "
          + "pour alterner les mouvements. Explore aussi le bloc \xab\xa0Si chemin libre\xa0\xbb "
          + "pour comprendre les conditions.",
        cols: 5, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 4 },
        walls: [], toolbox: ["move", "turnR", "turnL", "repeat", "ifFree"]
        // Solution : repeat(4){ move, turnR, move, turnL }
      },

      // 2-1  Single wall — detour
      {
        id: "2-1",
        title: "Obstacle",
        instruction: "Un mur bloque la route directe. Contourne-le en passant par le dessus ou par le dessous. "
          + "Le bloc \xab\xa0Si chemin libre … Sinon\xa0\xbb permet au robot de choisir tout seul.",
        cols: 5, rows: 3,
        start: { x: 0, y: 1, dir: 1 }, goal: { x: 4, y: 1 },
        walls: [{ x: 2, y: 1 }],
        toolbox: ["move", "turnR", "turnL", "repeat", "ifFree"]
        // Solution : move, turnL, move, turnR, move, move, turnR, move, turnL, move
      },

      // 2-2  Vertical wall — forced detour via bottom
      {
        id: "2-2",
        title: "Mur vertical",
        instruction: "Une colonne de murs barre le terrain. Il faut contourner par le bas. "
          + "Utilise \xab\xa0R\xe9p\xe9ter\xa0\xbb pour compacter les s\xe9quences r\xe9p\xe9titives.",
        cols: 5, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 4 },
        walls: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
        toolbox: ["move", "turnR", "turnL", "repeat", "ifFree"]
        // Solution : move, turnR, repeat(4){move}, turnL, repeat(3){move}
      },

      // 2-3  Wider grid, longer wall
      {
        id: "2-3",
        title: "Couloir",
        instruction: "Un mur plus long force un grand d\xe9tour. Combine plusieurs boucles "
          + "et pense \xe0 utiliser \xab\xa0Si chemin libre\xa0\xbb pour rendre ton programme plus g\xe9n\xe9ral.",
        cols: 7, rows: 5,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 6, y: 4 },
        walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }],
        toolbox: ["move", "turnR", "turnL", "repeat", "ifFree"]
        // Solution : move, move, turnR, repeat(4){move}, turnL, repeat(4){move}
        // (0,0)E→(2,0)→turnR(S)→(2,4)→turnL(E)→(6,4)
      },

      // 2-4  Largest grid, longest wall — grand finale
      {
        id: "2-4",
        title: "Grand d\xe9fi",
        instruction: "Le plus grand terrain ! Une longue colonne de murs s\xe9pare le terrain en deux. "
          + "Concocte un programme \xe9l\xe9gant qui combine boucles et conditions pour atteindre la cible.",
        cols: 7, rows: 7,
        start: { x: 0, y: 0, dir: 1 }, goal: { x: 6, y: 6 },
        walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }],
        toolbox: ["move", "turnR", "turnL", "repeat", "ifFree"]
        // Solution : move, move, turnR, repeat(4){move}, turnL, repeat(4){move}, turnR, repeat(2){move}
        // (0,0)E→(2,0)→S→(2,4)→E→(6,4)→S→(6,6)
      }
    ]
  }
];
