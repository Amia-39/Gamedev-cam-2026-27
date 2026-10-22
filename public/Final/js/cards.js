/*
 * cards.js — every card in the game.
 *
 * Card fields (kept short because there are lots of cards):
 *   img    path to the card art              name   display name
 *   c      energy cost                       t      type: 'A' attack, 'S' skill, 'P' power
 *   damage damage dealt                      hits   number of times the damage repeats
 *   all    1 = hits ALL enemies              tgt    1 = needs a target even though it is not an attack
 *   block  block gained                      draw   cards drawn            en  energy gained
 *   vulnerable / weak / poison   debuff stacks applied to the target
 *   strength  Strength gained for this turn  thorns Thorns gained for the fight
 *   heal   HP restored                       self   HP you lose
 *   exh    1 = exhausts (removed until the next fight)
 *   bd     1 = deals damage equal to your current Block (+ `damage`)
 *   dblp    1 = doubles the target's Poison  dblv   1 = doubles the target's Vulnerable
 *   ch     list of orbs to channel           ev / evall   evoke next orb / all orbs
 *   amp    Amplify gained                    slot   extra orb slots
 *   copy   add a copy to discard pile        rupgrade  upgrade a random card in your hand
 *   upgradeALL  upgrade All cards in your hand   exhr   exhaust a random card 
 *   topdx   play and exhaust the top card of your draw pile
 *   topdisc play and place the top card of your discard pile on top of your draw pile
 *   
 *   
 */

// =====================================================================
// The Ironclad
// =====================================================================

/** Every Ironclad card. The starting deck and the reward and shop lists below refer to these ids. */
const IRONCLAD_CARDS = {
  slash: { img: 'img/cards/slash.jpg', name: 'Slash', c: 1, t: 'A', damage: 6 },
  guard: { img: 'img/cards/guard.jpg', name: 'Guard', c: 1, t: 'S', block: 5 },
  bash: { img: 'img/cards/bash.jpg', name: 'Bash', c: 2, t: 'A', damage: 8, vulnerable: 2 },
  anger: { img: 'img/cards/anger.jpg', name: 'Anger', c: 0, t: 'A', damage: 6, copy: 1},
  armaments: { img: 'img/cards/armaments.jpg', name: 'Armaments', c: 1, t: 'S', block: 5, rupgrade: 1 },
  bloodwall: { img: 'img/cards/bloodwall.jpg', name: 'Blood Wall', c: 2, t: 'S', block: 16, self: 2 },
  slam: { img: 'img/cards/slam.jpg', name: 'Bodyslam', c: 1, t: 'A', bd: 1, },
  breakthrough: { img: 'img/cards/break.jpg', name: 'Breakthrough', c: 1, t: 'A', self: 1, all: 1, damage: 9 },
  cinder: { img: 'img/cards/cinder.jpg', name: 'Cinder', c: 2, t: 'A', damage: 18, exhr: 1},
  havoc: { img: 'img/cards/havoc.jpg', name: 'Havoc', c: 1, t: 'S', topdx: 1 },
  headbutt: { img: 'img/cards/headbutt.jpg', name: 'Headbutt', c: 1, t: 'A', damage: 9, topdisc: 1 },
  ironwave: { img: 'img/cards/ironwave.jpg', name: 'Iron Wave', c: 1, t: 'A', block: 5, damage: 5 },
  moltfist: { img: 'img/cards/moltenfist.jpg', name: 'Molten Fist', c: 1, t: 'A', damage: 10, dblv: 1, exh: 1},











};

/** What changes when a wanderer card is upgraded at a campfire (only the listed stats are overwritten). */
const IRONCLAD_UPGRADES = {
  slash: { damage: 9 },
  guard: { block: 8 },
  bash: { damage: 10, vulnerable: 3 },
  anger: { damage: 8 },
  armaments: { upgradeAll: 1, rupgrade: 0 },
  bloodwall: { block: 20 },
  slam: { c: 0 },
  breakthrough: { damage: 13 },
  cinder: { damage: 24 },
  havoc: { c: 0 },
  headbutt: { damage: 12 },
  ironwave: { block: 7, damage: 7 },
  moltfist: { damage: 14 },
};

/** Cards that can be offered as wanderer combat rewards (and sold in shops). */
const IRONCLAD_REWARDS = [
  'bash',
  'anger',
  'armaments',
  'bloodwall',
  'slam',
  'breakthrough',
  'cinder',
  'havoc',
  'headbutt',
  'ironwave',
  'moltfist',
];

/** Cards a wanderer can only find in shops, never as combat rewards. */
const IRONCLAD_SHOP_CARDS = [];

// =====================================================================
// The Venomist (poison)
// =====================================================================

/** Every venomist card. The starting deck and the reward and shop lists below refer to these ids. */
const VENOMIST_CARDS = {
  stab: { img: 'img/cards/stab.svg', name: 'Stab', c: 1, t: 'A', damage: 5 },
  dodge: { img: 'img/cards/dodge.svg', name: 'Dodge', c: 1, t: 'S', block: 5 },
  dart: { img: 'img/cards/dart.svg', name: 'Venom Dart', c: 1, t: 'A', damage: 3, poison: 4 },
  cloud: { img: 'img/cards/cloud.svg', name: 'Toxic Cloud', c: 1, t: 'S', poison: 4, all: 1 },
  viper: { img: 'img/cards/viper.svg', name: 'Viper Strike', c: 2, t: 'A', damage: 9, poison: 6 },
  plague: { img: 'img/cards/plague.svg', name: 'Plague Wind', c: 2, t: 'S', poison: 7, all: 1 },
  catal: { img: 'img/cards/catal.svg', name: 'Catalyst', c: 1, t: 'S', dbl: 1, tgt: 1, exh: 1 },
  antid: { img: 'img/cards/antid.svg', name: 'Antidote', c: 1, t: 'S', block: 6, draw: 1 },
  night: { img: 'img/cards/night.svg', name: 'Nightshade', c: 0, t: 'S', poison: 3, tgt: 1 },
  needle: { img: 'img/cards/needle.svg', name: 'Needle Rain', c: 1, t: 'A', damage: 2, hits: 4 },
  corrode: {
    img: 'img/cards/corrode.svg',
    name: 'Corrosion',
    c: 1,
    t: 'S',
    vulnerable: 2,
    poison: 3,
    tgt: 1,
  },
  cloak: { img: 'img/cards/cloak.svg', name: 'Shadow Cloak', c: 2, t: 'S', block: 12 },
  riposte: { img: 'img/cards/riposte.svg', name: 'Riposte', c: 1, t: 'A', damage: 8, weak: 1 },
  blight: { img: 'img/cards/blight.svg', name: 'Grand Blight', c: 3, t: 'S', poison: 12, all: 1 },
  fangs: {
    img: 'img/cards/fangs.svg',
    name: 'Twin Fangs',
    c: 1,
    t: 'A',
    damage: 4,
    hits: 2,
    poison: 3,
  },
  ambush: { img: 'img/cards/ambush.svg', name: 'Ambush', c: 0, t: 'A', damage: 7, exh: 1 },
  elixir: { img: 'img/cards/elixir.svg', name: 'Elixir', c: 1, t: 'S', heal: 4, exh: 1 },
};

/** What changes when a venomist card is upgraded at a campfire (only the listed stats are overwritten). */
const VENOMIST_UPGRADES = {
  stab: { damage: 8 },
  dodge: { block: 8 },
  dart: { damage: 5, poison: 6 },
  cloud: { poison: 6 },
  viper: { damage: 12, poison: 8 },
  plague: { poison: 10 },
  catal: { c: 0 },
  antid: { block: 9 },
  night: { poison: 5 },
  needle: { damage: 3 },
  corrode: { vulnerable: 3, poison: 5 },
  cloak: { block: 16 },
  riposte: { damage: 11, weak: 2 },
  blight: { poison: 16 },
  fangs: { hits: 3 },
  ambush: { damage: 10 },
  elixir: { heal: 8 },
};

/** Cards that can be offered as venomist combat rewards (and sold in shops). */
const VENOMIST_REWARDS = [
  'viper',
  'plague',
  'catal',
  'antid',
  'night',
  'needle',
  'corrode',
  'cloak',
  'riposte',
  'dart',
];

/** Cards a venomist can only find in shops, never as combat rewards. */
const VENOMIST_SHOP_CARDS = ['blight', 'fangs', 'ambush', 'elixir'];

// =====================================================================
// The Conduit (orbs)
// =====================================================================

/** Every conduit card. The starting deck and the reward and shop lists below refer to these ids. */
const CONDUIT_CARDS = {
  zap: { img: 'img/cards/zap.svg', name: 'Zap Strike', c: 1, t: 'A', damage: 5 },
  guard2: { img: 'img/cards/guard2.svg', name: 'Static Guard', c: 1, t: 'S', block: 5 },
  chspark: { img: 'img/cards/chspark.svg', name: 'Charge Spark', c: 1, t: 'S', ch: ['spark'] },
  chward: { img: 'img/cards/chward.svg', name: 'Charge Ward', c: 1, t: 'S', ch: ['ward'] },
  arcbolt: {
    img: 'img/cards/arcbolt.svg',
    name: 'Arc Bolt',
    c: 1,
    t: 'A',
    damage: 6,
    ch: ['spark'],
  },
  aegis: { img: 'img/cards/aegis.svg', name: 'Aegis Loop', c: 1, t: 'S', block: 4, ch: ['ward'] },
  chain: { img: 'img/cards/chain.svg', name: 'Twin Sparks', c: 2, t: 'S', ch: ['spark', 'spark'] },
  amp: { img: 'img/cards/amp.svg', name: 'Amplifier', c: 1, t: 'P', amp: 1 },
  flush: { img: 'img/cards/flush.svg', name: 'Discharge', c: 1, t: 'S', ev: 1, draw: 1 },
  overload: { img: 'img/cards/overload.svg', name: 'Overload', c: 2, t: 'S', evall: 1 },
  socket: { img: 'img/cards/socket.svg', name: 'Expand Rack', c: 1, t: 'P', slot: 1 },
  bulk: { img: 'img/cards/bulk.svg', name: 'Bulk Ward', c: 2, t: 'S', block: 9, ch: ['ward'] },
  rewire: { img: 'img/cards/rewire.svg', name: 'Rewire', c: 0, t: 'S', draw: 2, exh: 1 },
  novacore: { img: 'img/cards/novacore.svg', name: 'Nova Core', c: 2, t: 'S', ch: ['nova'] },
  supercharge: { img: 'img/cards/supercharge.svg', name: 'Supercharge', c: 2, t: 'P', amp: 2 },
  meltdown: {
    img: 'img/cards/meltdown.svg',
    name: 'Meltdown',
    c: 2,
    t: 'A',
    damage: 6,
    all: 1,
    evall: 1,
  },
  triweave: {
    img: 'img/cards/triweave.svg',
    name: 'Tri-Weave',
    c: 2,
    t: 'S',
    ch: ['spark', 'ward', 'nova'],
  },
};

/** What changes when a conduit card is upgraded at a campfire (only the listed stats are overwritten). */
const CONDUIT_UPGRADES = {
  zap: { damage: 8 },
  guard2: { block: 8 },
  chspark: { c: 0 },
  chward: { c: 0 },
  arcbolt: { damage: 9 },
  aegis: { block: 7 },
  chain: { c: 1 },
  amp: { amp: 2 },
  flush: { draw: 2 },
  overload: { c: 1 },
  socket: { c: 0 },
  bulk: { block: 13 },
  rewire: { draw: 3 },
  novacore: { c: 1 },
  supercharge: { amp: 3 },
  meltdown: { damage: 9 },
  triweave: { c: 1 },
};

/** Cards that can be offered as conduit combat rewards (and sold in shops). */
const CONDUIT_REWARDS = [
  'arcbolt',
  'aegis',
  'chain',
  'amp',
  'flush',
  'overload',
  'socket',
  'bulk',
  'rewire',
  'zap',
];

/** Cards a conduit can only find in shops, never as combat rewards. */
const CONDUIT_SHOP_CARDS = ['novacore', 'supercharge', 'meltdown', 'triweave'];

// =====================================================================
// All cards together
// =====================================================================

/** Every card in the game, by id. */
const CARDS = { ...IRONCLAD_CARDS, ...VENOMIST_CARDS, ...CONDUIT_CARDS };

/** Every upgrade, by base card id. */
const CARD_UPGRADES = { ...IRONCLAD_UPGRADES, ...VENOMIST_UPGRADES, ...CONDUIT_UPGRADES };

// Every card gets an upgraded twin stored under 'id+' (e.g. 'slash+').
for (const id in CARD_UPGRADES) {
  CARDS[id + '+'] = { ...CARDS[id], ...CARD_UPGRADES[id], name: CARDS[id].name + '+' };
}

// The reward and shop-only pools of the hero being played. newGame() (run.js) fills these in.
let REWARD_CARDS = [];
let SHOP_ONLY_CARDS = [];
