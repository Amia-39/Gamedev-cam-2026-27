/*
 * enemies.js — enemy, elite and boss definitions plus the per-act encounter table.
 *
 * Enemy fields:   name, img, hp (base HP before scaling), boss: 1 for bosses,
 *                 moves: a list that the enemy repeats in order, one move per turn.
 * Move fields (any combination): attack (damage), hits (number of attacks, default 1),
 *                 block, strength (permanent Strength gain), heal (heals the most wounded enemy),
 *                 weak / vulnerable (debuffs put on the player).
 */

// Boss of the Bargain Bazaar trap (see sellFoulPotion in shop.js).
const SHOPKEEPER = {
  name: 'Fake Merchant',
  img: 'img/mask.svg',
  hp: 60,
  moves: [{ attack: 9 }, { block: 10 }, { attack: 5, hits: 2 }, { strength: 2, attack: 4 }],
};
// Fights with several enemies. Each act has its own singles, pairs, trios and elite fights (see ENCOUNTERS at the bottom).
const ACT1_PAIRS = [
  [
    {
      name: 'Scavenger Rat',
      img: 'img/rat.svg',
      hp: 16,
      moves: [{ attack: 5 }, { attack: 3, hits: 2 }, { block: 4 }],
    },
    {
      name: 'Scavenger Rat',
      img: 'img/rat.svg',
      hp: 16,
      moves: [{ attack: 3, hits: 2 }, { block: 4 }, { attack: 5 }],
    },
  ],
  [
    {
      name: 'Shield Bearer',
      img: 'img/shield.svg',
      hp: 30,
      moves: [{ block: 10 }, { attack: 5 }, { block: 6, attack: 3 }],
    },
    {
      name: 'Spear Thrower',
      img: 'img/bow.svg',
      hp: 20,
      moves: [{ attack: 11 }, { attack: 6, weak: 1 }],
    },
  ],
  [
    {
      name: 'Candle Priest',
      img: 'img/candle.svg',
      hp: 22,
      moves: [{ heal: 8 }, { attack: 5 }, { strength: 1 }],
    },
    {
      name: 'Brute',
      img: 'img/boar.svg',
      hp: 36,
      moves: [{ attack: 10 }, { block: 8 }, { attack: 14 }],
    },
  ],
];
const ACT1_TRIOS = [
  [
    { name: 'Wasp', img: 'img/wasp.svg', hp: 10, moves: [{ attack: 3, hits: 2 }, { attack: 4 }] },
    { name: 'Wasp', img: 'img/wasp.svg', hp: 10, moves: [{ attack: 4 }, { attack: 3, hits: 2 }] },
    { name: 'Wasp', img: 'img/wasp.svg', hp: 10, moves: [{ attack: 3, hits: 2 }, { attack: 4 }] },
  ],
  [
    {
      name: 'Bandit Leader',
      img: 'img/bandit.svg',
      hp: 28,
      moves: [{ strength: 2 }, { attack: 8 }, { attack: 6, weak: 1 }],
    },
    {
      name: 'Cutpurse',
      img: 'img/cutpurse.svg',
      hp: 16,
      moves: [{ attack: 5 }, { attack: 4, hits: 2 }],
    },
    {
      name: 'Cutpurse',
      img: 'img/cutpurse.svg',
      hp: 16,
      moves: [{ attack: 4, hits: 2 }, { attack: 5 }],
    },
  ],
];
const ACT1_SINGLES = [
  {
    name: 'Gel Slime',
    img: 'img/slime.svg',
    hp: 24,
    moves: [{ attack: 7 }, { attack: 5, weak: 1 }, { block: 6 }],
  },
  { name: 'Cave Bat', img: 'img/bat.svg', hp: 18, moves: [{ attack: 4, hits: 2 }, { attack: 9 }] },
  {
    name: 'Stone Golem',
    img: 'img/golem.svg',
    hp: 34,
    moves: [{ block: 8 }, { attack: 12 }, { attack: 6, vulnerable: 1 }],
  },
  {
    name: 'Zealot',
    img: 'img/zealot.svg',
    hp: 30,
    moves: [{ strength: 3 }, { attack: 6 }, { attack: 6 }],
  },
];
const ACT1_ELITES = [
  [
    {
      name: 'Warden',
      img: 'img/warden.svg',
      hp: 72,
      moves: [{ attack: 14 }, { strength: 2, block: 8 }, { attack: 8, hits: 2 }],
    },
  ],
  [
    {
      name: 'Sentinel Alpha',
      img: 'img/sentinel_alpha.svg',
      hp: 42,
      moves: [{ attack: 9 }, { block: 10 }, { attack: 6, weak: 1 }],
    },
    {
      name: 'Sentinel Omega',
      img: 'img/sentinel_omega.svg',
      hp: 42,
      moves: [{ block: 8 }, { attack: 12 }, { strength: 2, attack: 5 }],
    },
  ],
];
// ---- Bosses (one per act) ----
const HOLLOW_KING = {
  name: 'Hollow King',
  img: 'img/crown.svg',
  hp: 160,
  boss: 1,
  moves: [
    { attack: 12, weak: 1 },
    { block: 15, strength: 2 },
    { attack: 8, hits: 3 },
    { attack: 26 },
  ],
};
const BROOD_MOTHER = {
  name: 'Brood Mother',
  img: 'img/spider.svg',
  hp: 250,
  boss: 1,
  moves: [
    { attack: 10, weak: 1 },
    { block: 14, strength: 2 },
    { attack: 6, hits: 4 },
    { attack: 22 },
    { attack: 8, vulnerable: 2, heal: 12 },
  ],
};
const SPIRE_TYRANT = {
  name: 'Spire Tyrant',
  img: 'img/dragon.svg',
  hp: 380,
  boss: 1,
  moves: [
    { attack: 14, weak: 1, vulnerable: 1 },
    { block: 22, strength: 3 },
    { attack: 9, hits: 4 },
    { attack: 34 },
    { attack: 12, hits: 2, heal: 15 },
    { strength: 2, attack: 18 },
  ],
};
const BOSSES = [HOLLOW_KING, BROOD_MOTHER, SPIRE_TYRANT]; // index = act - 1
const ACT2_SINGLES = [
  {
    name: 'Bog Troll',
    img: 'img/troll.svg',
    hp: 45,
    moves: [{ attack: 14 }, { block: 10 }, { attack: 8, vulnerable: 1 }],
  },
  {
    name: 'Wraith',
    img: 'img/ghost.svg',
    hp: 32,
    moves: [{ attack: 6, hits: 2, weak: 1 }, { block: 12 }, { attack: 10 }],
  },
  {
    name: 'Rust Hound',
    img: 'img/hound.svg',
    hp: 28,
    moves: [{ attack: 5, hits: 3 }, { attack: 9 }],
  },
];
const ACT3_SINGLES = [
  {
    name: 'Void Seer',
    img: 'img/seer.svg',
    hp: 50,
    moves: [
      { strength: 3, block: 8 },
      { attack: 12, vulnerable: 1 },
      { attack: 8, hits: 2 },
    ],
  },
  {
    name: 'Obsidian Guard',
    img: 'img/obsidian.svg',
    hp: 60,
    moves: [{ block: 16 }, { attack: 20 }, { attack: 10, weak: 1 }],
  },
  {
    name: 'Plague Doctor',
    img: 'img/plague_doctor.svg',
    hp: 44,
    moves: [
      { attack: 7, hits: 3 },
      { heal: 10, block: 6 },
      { attack: 12, weak: 1 },
    ],
  },
];
const CRYPT_LORD_FIGHT = [
  {
    name: 'Crypt Lord',
    img: 'img/vampire.svg',
    hp: 110,
    moves: [
      { attack: 18 },
      { strength: 2, block: 12 },
      { attack: 10, hits: 3 },
      { attack: 6, weak: 2, vulnerable: 2 },
    ],
  },
];
const COLOSSUS_FIGHT = [
  {
    name: 'Magma Colossus',
    img: 'img/volcano.svg',
    hp: 150,
    moves: [{ attack: 22 }, { block: 20, strength: 2 }, { attack: 12, hits: 3 }, { attack: 30 }],
  },
];
/** Shorthand used for the act 2 and 3 enemies. */
const enemy = (name, img, hp, moves) => ({ name, img, hp, moves });
const ARCHER = enemy('Bone Archer', 'img/skull.svg', 26, [{ attack: 7, hits: 2 }, { attack: 12 }]),
  GHOUL = enemy('Ghoul', 'img/ghoul.svg', 34, [
    { attack: 11 },
    { attack: 6, hits: 2 },
    { block: 8 },
  ]),
  NECRO = enemy('Necromancer', 'img/necromancer.svg', 28, [
    { heal: 10 },
    { attack: 8, weak: 1 },
    { strength: 2 },
  ]),
  SKEL = enemy('Skeleton', 'img/bone.svg', 18, [
    { attack: 6 },
    { block: 6, attack: 3 },
    { attack: 4, hits: 2 },
  ]),
  CULT = enemy('Deep Cultist', 'img/cultist.svg', 24, [{ strength: 2 }, { attack: 6, weak: 1 }]),
  PRIEST = enemy('Drowned Priest', 'img/priest.svg', 30, [{ heal: 8 }, { attack: 9 }]);
const WISP = enemy('Storm Wisp', 'img/bolt.svg', 30, [
    { attack: 6, hits: 3 },
    { attack: 12, weak: 1 },
    { block: 10 },
  ]),
  KNIGHT = enemy('Gilded Knight', 'img/knight.svg', 55, [
    { attack: 16 },
    { block: 14 },
    { attack: 10, hits: 2, vulnerable: 1 },
  ]);
const TWINS_FIGHT = [
  enemy('Rattle', 'img/bone.svg', 55, [{ attack: 12 }, { block: 12 }, { attack: 7, hits: 2 }]),
  enemy('Clatter', 'img/tombstone.svg', 55, [
    { block: 10 },
    { attack: 14 },
    { strength: 2, attack: 5 },
  ]),
];
const HERALD_FIGHT = [
  enemy('Herald of Ruin', 'img/herald.svg', 130, [
    { attack: 16, weak: 1, vulnerable: 1 },
    { strength: 3, block: 14 },
    { attack: 9, hits: 4 },
    { attack: 28 },
  ]),
];
// What can appear in each act (index = act - 1):
//   singles: one-enemy fights   pairs / trios: multi-enemy fights
//   elites: list of possible elite fights (each is a list of enemies)
const ENCOUNTERS = [
  { singles: ACT1_SINGLES, pairs: ACT1_PAIRS, trios: ACT1_TRIOS, elites: ACT1_ELITES },
  {
    singles: [...ACT2_SINGLES, ARCHER],
    pairs: [
      [GHOUL, NECRO],
      [ACT2_SINGLES[2], { ...ACT2_SINGLES[2], moves: [{ attack: 9 }, { attack: 5, hits: 3 }] }],
      [ACT2_SINGLES[0], ACT2_SINGLES[1]],
    ],
    trios: [
      [
        SKEL,
        { ...SKEL, moves: [{ block: 6, attack: 3 }, { attack: 6 }, { attack: 4, hits: 2 }] },
        SKEL,
      ],
      [CULT, CULT, PRIEST],
    ],
    elites: [CRYPT_LORD_FIGHT, TWINS_FIGHT],
  },
  {
    singles: [...ACT3_SINGLES, WISP, KNIGHT],
    pairs: [
      [ACT3_SINGLES[0], ACT3_SINGLES[1]],
      [KNIGHT, ACT3_SINGLES[2]],
      [WISP, { ...WISP, moves: [{ attack: 12, weak: 1 }, { block: 10 }, { attack: 6, hits: 3 }] }],
    ],
    trios: [
      [ACT3_SINGLES[1], ACT3_SINGLES[0], ACT3_SINGLES[0]],
      [
        WISP,
        { ...WISP, moves: [{ block: 10 }, { attack: 6, hits: 3 }, { attack: 12, weak: 1 }] },
        WISP,
      ],
    ],
    elites: [COLOSSUS_FIGHT, HERALD_FIGHT],
  },
];
