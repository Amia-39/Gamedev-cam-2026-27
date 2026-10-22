/* events.js — Mystery-node events.
 */

/** Lose HP, but never die from an event. */
const loseHp = (n) => {
  run.hp = Math.max(1, run.hp - n);
};
/** Give a random potion if there is room. Returns its id or null. */
const gainRandomPotion = () => {
  if (run.potions.length >= potionSlots()) return null;
  const id = randomItem(droppablePotions());
  run.potions.push(id);
  return id;
};
// Random events on Mystery nodes.
// Each option is [button label, action]. The action returns the result text shown to the player
// (or returns nothing if it switches to another screen itself, like the altar).
const EVENTS = [
  {
    img: 'img/anvil.svg',
    title: 'The Whispering Anvil',
    text: 'An anvil hums with strange light. A voice offers to reforge one of your cards.',
    options: [
      [
        'Let it reforge a random card',
        () => {
          const u = run.deck.map((_, i) => i).filter((i) => !run.deck[i].endsWith('+'));
          if (!u.length) return 'The anvil finds nothing to improve.';
          const i = randomItem(u),
            n = CARDS[run.deck[i]].name;
          run.deck[i] += '+';
          return n + ' is reforged into ' + CARDS[run.deck[i]].name + '!';
        },
      ],
      ['Walk away', () => 'You leave the anvil humming to itself.'],
    ],
  },
  {
    img: 'img/raccoon.svg',
    title: 'Sticky Fingers',
    text: 'A masked thief bumps into you and darts off with your coin purse!',
    options: [
      [
        'Give chase (lose 8 HP)',
        () => {
          loseHp(8);
          return 'You tackle the thief and recover your gold, scraped and bruised.';
        },
      ],
      [
        'Let him go (lose 25% of your gold)',
        () => {
          const l = Math.floor(run.gold * 0.25);
          run.gold -= l;
          return 'You lose ' + l + ' gold.';
        },
      ],
    ],
  },
  {
    img: 'img/fountain.svg',
    title: 'Glimmering Fountain',
    text: 'A clear fountain, coins glittering at the bottom.',
    options: [
      [
        'Drink (heal 15 HP)',
        () => {
          run.hp = Math.min(run.maxHp, run.hp + 15);
          return 'Cool and sweet. You feel refreshed.';
        },
      ],
      [
        'Fish out coins (+35 gold, lose 5 HP)',
        () => {
          run.gold += 35;
          loseHp(5);
          return 'You come away with 35 gold and a nasty splash of something.';
        },
      ],
    ],
  },
  {
    img: 'img/chest.svg',
    title: 'Suspicious Chest',
    text: 'A chest sits in the middle of the path. Too convenient.',
    options: [
      [
        'Open it',
        () => {
          const r = Math.random();
          if (r < 0.3) {
            const x = grantRelic();
            if (x) return 'Inside: ' + I(RELICS[x].img) + ' ' + RELICS[x].name + '!';
          }
          if (r < 0.65) {
            run.gold += 60;
            return 'Inside: 60 gold.';
          }
          loseHp(12);
          return 'A blade trap! You lose 12 HP.';
        },
      ],
      ['Leave it', () => 'Wisdom, or cowardice. Hard to say.'],
    ],
  },
  {
    img: 'img/flask.svg',
    title: 'Travelling Alchemist',
    text: 'A hooded figure jingles a satchel of vials.',
    options: [
      [
        'Take a free sample',
        () => {
          const p = gainRandomPotion();
          return p
            ? 'You receive ' + I(POTIONS[p].img) + ' ' + POTIONS[p].name + '.'
            : 'Your belt is full!';
        },
      ],
      [
        'Pay 40 gold for two potions',
        () => {
          if (run.gold < 40) return 'You cannot afford it.';
          const a = gainRandomPotion();
          if (!a) return 'Your belt is full!';
          const b = gainRandomPotion();
          run.gold -= 40;
          return (
            'You receive ' +
            [a, b]
              .filter((x) => x)
              .map((x) => POTIONS[x].name)
              .join(' and ') +
            '.'
          );
        },
      ],
    ],
  },
  {
    img: 'img/candle.svg',
    title: 'Forgotten Altar',
    text: 'A candlelit altar. A whisper asks for a sacrifice.',
    options: [
      [
        'Sacrifice a card (lose 8 HP)',
        () => {
          if (run.deck.length < 2) return 'You have nothing to give.';
          loseHp(8);
          view = 'evrm';
          render();
        },
      ],
      [
        'Pray quietly (heal 10 HP)',
        () => {
          run.hp = Math.min(run.maxHp, run.hp + 10);
          return 'A calm settles over you.';
        },
      ],
    ],
  },
  {
    img: 'img/dice.svg',
    title: 'Back-Alley Gambler',
    text: '"Fifty-fifty, friend. Double or nothing."',
    options: [
      [
        'Bet 30 gold',
        () => {
          if (run.gold < 30) return 'You are too poor to play.';
          if (Math.random() < 0.5) {
            run.gold += 30;
            return 'You win! +30 gold.';
          }
          run.gold -= 30;
          return 'You lose your bet.';
        },
      ],
      ['Decline', () => 'The gambler shrugs and shuffles on.'],
    ],
  },
  {
    img: 'img/crate.svg',
    title: 'Abandoned Cache',
    text: 'A dusty crate with a scrap of paper: "take one".',
    options: [
      [
        'Take a card (lose 6 HP)',
        () => {
          loseHp(6);
          const c = randomItem(REWARD_CARDS);
          run.deck.push(c);
          return 'You add ' + CARDS[c].name + ' to your deck.';
        },
      ],
      [
        'Take the coins (+40 gold)',
        () => {
          run.gold += 40;
          return 'You pocket 40 gold.';
        },
      ],
    ],
  },
  {
    img: 'img/wind.svg',
    title: 'Corrosive Wind',
    text: 'A rust-coloured gale rolls in, eating at your gear.',
    options: [
      [
        'Shelter behind your pack (lose 12 HP)',
        () => {
          loseHp(12);
          return 'You weather the storm, battered.';
        },
      ],
      [
        'Run for it (risk losing a random card)',
        () => {
          if (run.deck.length < 8) return 'You dodge the worst of it.';
          const i = (Math.random() * run.deck.length) | 0,
            n = CARDS[run.deck[i]].name;
          run.deck.splice(i, 1);
          return n + ' is lost to the wind.';
        },
      ],
    ],
  },
];

/** Player clicked option k of the current event. */
function chooseEventOption(k) {
  const result = eventState.event.options[k][1]();
  if (result !== undefined) {
    eventState.result = result;
    render();
  }
}

/** Forgotten Altar: the player picked a card to sacrifice. */
function sacrificeCard(i) {
  run.deck.splice(i, 1);
  eventState.result = 'The altar accepts your offering. The card fades away.';
  showView('event');
}
