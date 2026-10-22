/*
 * run.js — starting a run and moving between screens: Ancients, acts, rewards and the relic shrine.
 */

const ACT_NAMES = ['The Ashen Foothills', 'The Sunken Crypts', 'The Spire Crown'];

// One Ancient greets you at the start of each act and offers relics.
const ANCIENTS = [
  {
    name: 'Old Marrow',
    img: 'img/elder.svg',
    quote:
      'A hermit tends a dying fire at the foot of the Spire. He nudges a relic across the stones. "Take it. The climb has taken everything else from me."',
  },
  {
    name: 'The Drowned Oracle',
    img: 'img/wave.svg',
    quote:
      'Water pools around the feet of a robed figure who never blinks. "I have seen how you fall. Choose a gift, and perhaps you will fall differently."',
  },
  {
    name: 'The Crowned Echo',
    img: 'img/eye.svg',
    quote:
      'A voice made of every climber before you speaks from an empty throne. "Almost there. Take what we could not carry the rest of the way."',
  },
];

/** Switch to another screen. */
function showView(name) {
  view = name;
  render();
}

/** A room is finished: go to the next floor of the map. */
function finishNode() {
  run.step++;
  showView('map');
}

/** Start a new run. Called with no argument it shows the hero select screen. */
function newGame(heroId) {
  if (!heroId) return showView('select');
  const hero = HEROES[heroId];
  REWARD_CARDS = [...hero.rewardCards];
  SHOP_ONLY_CARDS = [...hero.shopOnly];
  run = {
    act: 1,
    hero: heroId,
    hp: hero.hp,
    maxHp: hero.hp,
    step: 0,
    gold: 0,
    potions: [],
    relics: [...hero.startingRelics],
    deck: [...hero.deck],
    map: generateMap(),
    lastNodeIndex: 0,
    bossWon: false,
  };
  meetAncient();
}

// ---- Ancients ----

/** Offers relics at the start of an act: 1 in act 1, 3 later. */
function meetAncient() {
  ancientChoices = shuffle(availableRelics()).slice(0, run.act == 1 ? 1 : 3);
  if (!ancientChoices.length) return showView('map');
  showView('ancient');
}

function takeAncientRelic(i) {
  const id = ancientChoices[i];
  run.relics.push(id);
  onRelicGained(id);
  ancientChoices = [];
  showView('map');
}

/** After a boss: heal fully and start the next act. */
function nextAct() {
  run.act++;
  run.step = 0;
  run.lastNodeIndex = 0;
  run.map = generateMap();
  run.hp = run.maxHp;
  showView('act');
}

// ---- Rewards ----

/** The player picked a reward card (or null to skip). */
function chooseCardReward(id) {
  if (id) run.deck.push(id);
  if (run.bossWon) {
    run.bossWon = false;
    return nextAct();
  }
  finishNode();
}

/** Relic shrine node: a random relic, or a full heal if you already own them all. */
function visitRelicShrine() {
  const pool = availableRelics();
  if (!pool.length) {
    run.hp = run.maxHp;
    shrineRelic = null;
  } else {
    shrineRelic = randomItem(pool);
    run.relics.push(shrineRelic);
    onRelicGained(shrineRelic);
  }
  showView('relic');
}
