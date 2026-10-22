/* items.js — potions, relics and orbs.
Each entry: { name, img, d: description }. Effects are implemented where they are used. */

// Potions. `tgt: 1` means the potion needs an enemy target. The effects themselves live in usePotion() (combat.js).
const POTIONS = {
  heal: { name: 'Health Draught', img: 'img/heart.svg', d: 'Heal 15 HP' },
  fire: { name: 'Fire Flask', img: 'img/fire.svg', d: 'Deal 20 damage', tgt: 1 },
  stone: { name: 'Stone Tonic', img: 'img/stone.svg', d: 'Gain 12 Block' },
  vigor: { name: 'Vigor Brew', img: 'img/muscle.svg', d: 'Gain 2 Strength this turn' },
  energy: { name: 'Energy Tonic', img: 'img/bolt.svg', d: 'Gain 2 Energy' },
  weak: { name: 'Weakening Vial', img: 'img/vial.svg', d: 'ALL enemies: Weak 3, Vulnerable 2' },
  foul: {
    name: 'Foul Potion',
    img: 'img/foul.svg',
    d: 'Deal 12 damage. Merchants pay 100 gold for these...',
    tgt: 1,
  },
  swift: { name: 'Swift Draught', img: 'img/swirl.svg', d: 'Draw 3 cards' },
};
// Relic effects are checked with hasRelic('id') wherever they apply (combat.js, run.js, ...).
// Each entry: { name, img, d: description }.

// Relics any hero can find (rewards, shrines, elites, shops, events).
const SHARED_RELICS = {
  ember: { name: 'Ember Charm', img: 'img/fire.svg', d: 'Start each turn with +1 Strength' },
  lantern: {
    name: 'Old Lantern',
    img: 'img/lantern.svg',
    d: '+1 Energy on the first turn of each combat',
  },
  bone: { name: 'Bone Ring', img: 'img/ring.svg', d: 'Heal 6 HP after each combat' },
  stout: { name: 'Stout Shield', img: 'img/shield.svg', d: 'Start each turn with 3 Block' },
  satchel: { name: 'Scout Satchel', img: 'img/satchel.svg', d: 'Draw 1 extra card each turn' },
  belt: { name: 'Alchemist Belt', img: 'img/belt.svg', d: '+1 potion slot' },
  heart: { name: 'Heart Stone', img: 'img/stone.svg', d: '+12 max HP' },
  whet: { name: 'Whetstone', img: 'img/dagger.svg', d: 'Your attacks deal +1 damage' },
};

// The Wanderer's starting relic. Never appears in the random relic pool.
const IRONCLAD_RELICS = {
  blood: { name: 'Burning Blood', img: 'img/blood.jpg', d: 'Heal 6 hp at the end of each combat.' },
};

// The Venomist's starting relic. Never appears in the random relic pool.
const VENOMIST_RELICS = {
  fang: {
    name: 'Serpent Fang',
    img: 'img/fang.svg',
    d: 'Every time you apply Poison, apply 1 extra',
  },
};

// The Conduit's starting relic. Never appears in the random relic pool.
const CONDUIT_RELICS = {
  core: {
    name: 'Cracked Core',
    img: 'img/gear.svg',
    d: 'Start each combat with a Spark channeled',
  },
};

// Left over from a removed hero (the Thorn Ring still works, but nobody starts with it).
const UNUSED_HERO_RELICS = {
  ring: { name: 'Thorn Ring', img: 'img/gem.svg', d: 'Start each combat with 2 Thorns' },
};

// Weaker "Replica" versions of shared relics. Only the Bargain Bazaar sells them.
const REPLICA_RELICS = {
  ember_s: {
    name: 'Ember Charm (Replica)',
    img: 'img/fire.svg',
    d: '+1 Strength on the first turn of each combat',
  },
  bone_s: { name: 'Bone Ring (Replica)', img: 'img/ring.svg', d: 'Heal 3 HP after each combat' },
  stout_s: {
    name: 'Stout Shield (Replica)',
    img: 'img/shield.svg',
    d: 'Start each turn with 1 Block',
  },
  satchel_s: {
    name: 'Scout Satchel (Replica)',
    img: 'img/satchel.svg',
    d: 'Draw 1 extra card on the first turn of each combat',
  },
  heart_s: { name: 'Heart Stone (Replica)', img: 'img/stone.svg', d: '+6 max HP' },
  whet_s: {
    name: 'Whetstone (Replica)',
    img: 'img/dagger.svg',
    d: 'Your attacks deal +1 damage on the first turn of each combat',
  },
};

/** Every relic, by id. */
const RELICS = {
  ...SHARED_RELICS,
  ...IRONCLAD_RELICS,
  ...VENOMIST_RELICS,
  ...CONDUIT_RELICS,
  ...UNUSED_HERO_RELICS,
  ...REPLICA_RELICS,
};

// Relics that never show up in the random relic pool: hero starting relics and Replicas.
const NON_RANDOM_RELICS = [
  ...Object.keys(IRONCLAD_RELICS),
  ...Object.keys(VENOMIST_RELICS),
  ...Object.keys(CONDUIT_RELICS),
  ...Object.keys(UNUSED_HERO_RELICS),
  ...Object.keys(REPLICA_RELICS),
];

/** Relics the player does not own yet and that may appear as random rewards. */
const availableRelics = () =>
  Object.keys(RELICS).filter((r) => !hasRelic(r) && !NON_RANDOM_RELICS.includes(r));
/** Relics that change stats the moment you pick them up. Call after adding a relic to run.relics. */
const onRelicGained = (id) => {
  if (id == 'heart') {
    run.maxHp += 12;
    run.hp += 12;
  }
  if (id == 'heart_s') {
    run.maxHp += 6;
    run.hp += 6;
  }
};
/** Potions that can drop or be bought (the Foul Potion is special and only drops after combat). */
const droppablePotions = () => Object.keys(POTIONS).filter((k) => k != 'foul');

// Conduit orbs. p = passive amount (end of your turn), v = evoke amount. Amplify adds to both.
const ORBS = {
  spark: { name: 'Spark', img: 'img/bolt.svg', p: 3, v: 8 },
  ward: { name: 'Ward', img: 'img/shield.svg', p: 2, v: 7 },
  nova: { name: 'Nova', img: 'img/nova.svg', p: 2, v: 9 },
};

/** Does the player currently own this relic? */
const hasRelic = (id) => run.relics.includes(id);

/** How many potions the player can carry. */
const potionSlots = () => 3 + (hasRelic('belt') ? 1 : 0);
