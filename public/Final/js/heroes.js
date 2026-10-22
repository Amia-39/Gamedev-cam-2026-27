// Playable heroes. rewardCards / shopOnly are that hero's card pools (see cards.js).
const HEROES = {
  ironclad: {
    name: 'The Ironclad',
    img: 'img/ironclad.jpg',
    hp: 80,
    description: 'The last soldier of the Ironclads. Crushes foes with sword and flame against his will.',
    deckSummary: '5 Slash, 4 Guard, 1 Bash',
    deck: [...Array(5).fill('slash'), ...Array(4).fill('guard'), 'bash', 'anger'],
    rewardCards: IRONCLAD_REWARDS,
    shopOnly: IRONCLAD_SHOP_CARDS,
    startingRelics: ['blood'],
  },
  venomist: {
    name: 'The Venomist',
    img: 'img/snake.svg',
    hp: 64,
    description:
      'A poison specialist. Stack Poison on enemies and let it do the work while you stay safe.',
    deckSummary: '4 Stab, 4 Dodge, Venom Dart, Toxic Cloud',
    deck: [...Array(4).fill('stab'), ...Array(4).fill('dodge'), 'dart', 'cloud'],
    rewardCards: VENOMIST_REWARDS,
    shopOnly: VENOMIST_SHOP_CARDS,
    startingRelics: ['fang'],
  },
  conduit: {
    name: 'The Conduit',
    img: 'img/robot.svg',
    hp: 72,
    description:
      'A tinkerer of living circuitry. Channel orbs into a 3-slot rack: each triggers at the end of your turn, and bursts when evoked. Amplify boosts them all.',
    deckSummary: '4 Zap Strike, 4 Static Guard, Charge Spark, Charge Ward',
    deck: [...Array(4).fill('zap'), ...Array(4).fill('guard2'), 'chspark'],
    rewardCards: CONDUIT_REWARDS,
    shopOnly: CONDUIT_SHOP_CARDS,
    startingRelics: ['core'],
  },
};
