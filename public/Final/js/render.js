/*
 * render.js — turns the game state into HTML.
 *
 * render() is called after every state change. It builds the status bar plus the current screen
 * (one renderXxx function per screen) and puts the result on the page with setApp().
 *
 * Buttons use inline onclick="..." handlers that call the global functions in the other files.
 * ":name:" in text becomes the picture img/name.svg (see setApp in util.js).
 */

// ---------- Small HTML helpers ----------

/** <button> HTML. */
const button = (label, onclick, disabled = false) =>
  `<button ${disabled ? 'disabled' : ''} onclick="${onclick}">${label}</button>`;

/** A row of items, centered. */
const row = (items) => `<div class="row">${items.join('')}</div>`;

/** A one-line note under a heading. */
const note = (text, cls = 'muted') => `<div class="center ${cls}">${text}</div>`;

/** Shown in place of a button once a shop item is bought. */
const soldButton = (label = 'Sold') => `<button disabled>${label}</button>`;

// ---------- Cards ----------

/** The rules text printed on a card, e.g. "Deal 6. Vulnerable 2." */
function cardText(c) {
  const parts = [];
  if (c.bd)
    parts.push(
      `Deal damage equal to your Block${c.damage ? ' +' + c.damage : ''}${c.all ? ' to ALL' : ''}.`,
    );
  if (c.thorn) parts.push(`Thorns ${c.thorn}.`);
  if (c.damage && !c.bd)
    parts.push(`Deal ${c.damage}${c.hits ? '×' + c.hits : ''}${c.all ? ' to ALL' : ''}.`);
  if (c.block) parts.push(`Block ${c.block}.`);
  if (c.vulnerable) parts.push(`Vulnerable ${c.vulnerable}.`);
  if (c.weak) parts.push(`Weak ${c.weak}.`);
  if (c.poison) parts.push(`Poison ${c.poison}${c.all ? ' to ALL' : ''}.`);
  if (c.dblp) parts.push('Double Poison.');
  if (c.dblv) parts.push('Double Vulnerable.');
  if (c.heal) parts.push(`Heal ${c.heal}.`);
  if (c.ch) parts.push('Channel ' + c.ch.map((orb) => ORBS[orb].name).join(', ') + '.');
  if (c.ev) parts.push('Evoke your next orb.');
  if (c.evall) parts.push('Evoke ALL orbs.');
  if (c.amp) parts.push(`+${c.amp} Amplify.`);
  if (c.slot) parts.push(`+${c.slot} orb slot.`);
  if (c.strength) parts.push(`+${c.strength} Strength this turn.`);
  if (c.draw) parts.push(`Draw ${c.draw}.`);
  if (c.en) parts.push(`+${c.en} Energy.`);
  if (c.self) parts.push(`Lose ${c.self} HP.`);
  if (c.exh) parts.push('Exhaust.');
  if (c.copy) parts.push('Add a copy to your discard pile.');
  if (c.rupgrade) parts.push('Upgrade a random card in your hand.');
  if (c.upgradeAll) parts.push('Upgrade ALL cards in your hand.');
  if (c.exhr) parts.push('Exhaust 1 card at random');
  if (c.topdx) parts.push('Play the top card of your draw pile and exhaust it.');
  if (c.topdisc) parts.push('Put a card from your discard pile on top of your draw pile.');
  if (c.t == 'P') parts.push('Power.');
  return parts.join(' ');
}

/**
 * HTML for one card.
 *   id         card id ('slash' or 'slash+')
 *   handIndex  position in the hand (used to highlight the selected card), or -1
 *   onclick    JavaScript to run when clicked, or '' for a card that is only shown
 */
function cardHTML(id, handIndex, onclick) {
  const card = CARDS[id];
  const tooExpensive = battle && view == 'fight' && card.c > battle.energy;
  const classes = [
    'card',
    card.t, // A / S / P gives the border colour
    id.endsWith('+') ? 'upgraded' : '',
    selectedCard === handIndex ? 'selected' : '',
    tooExpensive ? 'unaffordable' : '',
  ];
  return `
    <div class="${classes.join(' ')}" ${onclick ? `onclick="${onclick}"` : ''}>
      <b><span class="card-name">${card.name}</span><span class="card-cost">${card.c}</span></b>
      <img class="art" src="${card.img}" alt="">
      <span class="card-text">${cardText(card)}</span>
    </div>`;
}

// ---------- Status bar (shown on every screen except hero select) ----------

function relicIcons() {
  return run.relics
    .map(
      (id) =>
        `<span class="relic-icon" title="${RELICS[id].name}: ${RELICS[id].d}">${I(RELICS[id].img)}</span>`,
    )
    .join(' ');
}

/** One potion in the bar: click the name to drink (fights only), click ✕ to throw away. */
function potionChip(id, slot) {
  const drinkable = view == 'fight' ? `onclick="usePotion(${slot})"` : '';
  return `
    <span class="potion-chip ${selectedPotion === slot ? 'selected' : ''}" title="${POTIONS[id].d}">
      <a ${drinkable}>${I(POTIONS[id].img)} ${POTIONS[id].name}</a>
      <a class="discard" onclick="discardPotion(${slot})" title="Discard">✕</a>
    </span>`;
}

function statusBar() {
  const floor = (run.act - 1) * FLOORS_PER_ACT + Math.min(run.step + 1, FLOORS_PER_ACT);
  const potions = run.potions.length
    ? run.potions.map(potionChip).join('')
    : `<span class="muted">no potions (max ${potionSlots()})</span>`;
  return `
    <div class="bar">
      <span>:heart: ${run.hp}/${run.maxHp}</span>
      <span>:gold: ${run.gold}</span>
      <span>:cards: ${run.deck.length} cards</span>
      <span>Act ${run.act} · Floor ${floor}/${TOTAL_FLOORS}</span>
      <span>${relicIcons()}</span>
      <span>:potion: ${potions}</span>
    </div>`;
}

// ---------- Screens ----------

function renderHeroSelect() {
  const heroCards = Object.entries(HEROES).map(([id, hero]) => {
    const relics = hero.startingRelics
      .map((r) => `${I(RELICS[r].img)} ${RELICS[r].name} — ${RELICS[r].d}`)
      .join('');
    return `
      <div class="panel hero-card">
        <div class="big-icon">${I(hero.img)}</div>
        <h2>${hero.name}</h2>
        <div class="muted hero-text">${hero.description}</div>
        <div class="hero-stats">
          :heart: ${hero.hp} HP<br>
          ${relics ? `Relic: ${relics}<br>` : ''}
          Deck: ${hero.deckSummary}
        </div>
        ${button('Choose', `newGame('${id}')`)}
      </div>`;
  });
  setApp(`<h2>:swords: Ashen Spire</h2>${note('Choose your hero')}${row(heroCards)}`);
}

// ----- Map -----

const NODE_LABELS = {
  fight: ':swords: Fight',
  elite: ':warden: Elite',
  rest: ':fire: Camp',
  boss: ':crown: Boss',
  relic: ':diamond: Relic',
  shop: ':cart: Shop',
  mystery: ':question: Mystery',
};

/** Can the player click node i of row r right now? */
function isNodeReachable(r, i) {
  if (r != run.step) return false;
  return r == 0 || run.map[r - 1][run.lastNodeIndex].next.includes(i);
}

function renderMap() {
  const rows = run.map.map((nodes, r) => {
    const cells = [0, 1, 2, 3].map((column) => {
      const i = nodes.findIndex((node) => node.column == column);
      if (i < 0) return '<div></div>';
      const node = nodes[i];
      return `<button id="n${r}_${i}" class="${node.done ? 'done' : ''}" ${isNodeReachable(r, i) ? '' : 'disabled'} onclick="chooseNode(${i})">${node.done ? '✓ ' : ''}${NODE_LABELS[node.type]}</button>`;
    });
    return `<div class="map-row" ${r == run.step ? 'id="current-row"' : ''}>${cells.join('')}</div>`;
  });
  return `
    <h2>Act ${run.act}: ${ACT_NAMES[run.act - 1]}</h2>
    ${note('Amber lines lead from where you are to your next choices, green shows your path, faint lines show every route ahead.', 'muted small')}
    <div class="map">${rows.join('')}</div>`;
}

/** Draws the lines between map nodes on top of the buttons (an SVG layer). */
function drawMapLines() {
  const map = document.querySelector('.map');
  if (!map) return;
  map.querySelector('svg')?.remove();
  const box = map.getBoundingClientRect();
  const pointOf = (r, i, useTop) => {
    const rect = $(`n${r}_${i}`).getBoundingClientRect();
    return [rect.left + rect.width / 2 - box.left, (useTop ? rect.top : rect.bottom) - box.top];
  };
  const faint = [];
  const walked = [];
  const options = [];
  run.map.forEach((nodes, r) => {
    if (r >= run.map.length - 1) return;
    nodes.forEach((node, i) =>
      node.next.forEach((j) => {
        const [x1, y1] = pointOf(r, i, true);
        const [x2, y2] = pointOf(r + 1, j, false);
        const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`;
        if (r == run.step - 1 && i == run.lastNodeIndex)
          options.push(line + ' stroke="#e0a63a" stroke-width="3"/>');
        else if (node.done && run.map[r + 1][j].done)
          walked.push(line + ' stroke="#5cb85c" stroke-width="3"/>');
        else faint.push(line + ' stroke="#ffffff30" stroke-width="1.5"/>');
      }),
    );
  });
  map.insertAdjacentHTML(
    'afterbegin',
    `<svg width="${box.width}" height="${box.height}" class="map-lines">${faint.join('')}${walked.join('')}${options.join('')}</svg>`,
  );
}

// ----- Fight -----

function renderEnemy(enemy, index) {
  if (enemy.hp <= 0) return '';
  const aiming =
    (selectedCard !== null && needsTarget(CARDS[battle.hand[selectedCard]])) ||
    selectedPotion !== null;
  let onclick = '';
  if (selectedCard !== null) onclick = `playCard(${selectedCard}, battle.enemies[${index}])`;
  else if (selectedPotion !== null)
    onclick = `usePotion(${selectedPotion}, battle.enemies[${index}])`;
  const status = [
    enemy.poison ? `:skull:${enemy.poison}` : '',
    enemy.vulnerable ? `Vuln ${enemy.vulnerable}` : '',
    enemy.weak ? `Weak ${enemy.weak}` : '',
    enemy.strength ? `Str ${enemy.strength}` : '',
  ].filter(Boolean);
  return `
    <div class="panel ${aiming ? 'targetable' : ''}" onclick="${onclick}">
      <div class="intent">${describeIntent(enemy)}</div>
      <div class="enemy-art">${I(enemy.img)}</div>
      <b>${enemy.name}</b>
      <div class="hp"><i style="width:${(enemy.hp / enemy.maxHp) * 100}%"></i></div>
      :heart: ${enemy.hp}/${enemy.maxHp}${enemy.block ? ` :shield:${enemy.block}` : ''}
      <div class="muted small">${status.join(' ')}</div>
    </div>`;
}

/** The Conduit's orb rack, e.g. "(crystal ball) ⚡ ⚡ ▫ " */
function orbRack() {
  const slots = Array.from({ length: battle.slots }, (_, i) =>
    battle.orbs[i] ? I(ORBS[battle.orbs[i]].img) : ':empty:',
  );
  const amp = battle.amp ? ` · Amp ${battle.amp}` : '';
  return `<span title="Orbs trigger at the end of your turn. When the rack is full, channeling evokes the leftmost orb.">:seer: ${slots.join(' ')}${amp}</span>`;
}

function renderFight() {
  const debuffs = [
    battle.weak ? `Weak ${battle.weak}` : '',
    battle.vulnerable ? `Vuln ${battle.vulnerable}` : '',
  ];
  return `
    ${row(battle.enemies.map(renderEnemy))}
    <div class="log">${combatLog.slice(-8).join('<br>')}</div>
    <div class="bar">
      <span>${I(HEROES[run.hero].img)} You: :heart: ${run.hp}</span>
      <span>:shield: ${battle.block}</span>
      <span>:bolt: ${battle.energy}/3</span>
      <span>:muscle: ${battle.strength}</span>
      ${battle.thorns ? `<span>:cactus: ${battle.thorns}</span>` : ''}
      ${run.hero == 'conduit' ? orbRack() : ''}
      <span>${debuffs.join(' ')}</span>
      <span>Draw ${battle.drawPile.length} · Discard ${battle.discardPile.length}</span>
      <button class="push-right" onclick="endTurn()">End Turn</button>
    </div>
    ${row(battle.hand.map((id, i) => cardHTML(id, i, `playCard(${i})`)))}
    ${note('Click a card, then a target if needed.', 'muted small')}`;
}

// ----- After a fight -----

function renderReward() {
  const potionLine =
    potionReward == 'full'
      ? 'A potion dropped, but your belt is full!'
      : potionReward &&
        `Found a potion: ${I(POTIONS[potionReward].img)} ${POTIONS[potionReward].name}`;
  const relicLine =
    bonusRelic &&
    `Relic reward: ${I(RELICS[bonusRelic].img)} ${RELICS[bonusRelic].name} — ${RELICS[bonusRelic].d}`;
  return `
    <h2>Victory! Choose a card</h2>
    ${note(`+${goldReward} gold :gold:`, 'accent')}
    ${relicLine ? note(relicLine, 'good') : ''}
    ${potionLine ? note(potionLine, 'accent') : ''}
    ${row(cardRewards.map((id) => cardHTML(id, -1, `chooseCardReward('${id}')`)))}
    <div class="center">${button('Skip', 'chooseCardReward()')}</div>`;
}

function renderRelicShrine() {
  const relic = shrineRelic && RELICS[shrineRelic];
  const body = relic
    ? `<div class="center big-icon">${I(relic.img)}</div><h2>${relic.name}</h2>${note(relic.d, 'accent')}`
    : '<div class="center">You have every relic. The shrine fully heals you.</div>';
  return `<h2>:diamond: Relic Shrine</h2>${body}${row([button('Continue', 'finishNode()')])}`;
}

// ----- Shop -----

function renderShop() {
  const isSale = shop.isSale;
  const price = (p, onclick, enabled = true) =>
    button(`:gold: ${p}`, onclick, !(run.gold >= p && enabled));
  const box = (img, name, text, action) => `
    <div class="panel item-box">
      <div class="item-icon">${img}</div><b>${name}</b>
      <div class="muted small item-text">${text}</div>
      ${action}
    </div>`;
  const sectionTitle = (title) => note(title);

  const cards = shop.cards.map(
    (item, i) => `
      <div class="center">
        ${cardHTML(item.id, -1, '')}
        <div class="under-card">${item.sold ? soldButton() : price(item.price, `buyItem('cards', ${i})`)}</div>
      </div>`,
  );
  const potions = shop.potions.map((item, i) =>
    box(
      I(POTIONS[item.id].img),
      POTIONS[item.id].name,
      POTIONS[item.id].d,
      item.sold
        ? soldButton()
        : price(item.price, `buyItem('potions', ${i})`, run.potions.length < potionSlots()),
    ),
  );
  const relics = shop.relics.map((item, i) =>
    box(
      I(RELICS[item.id].img),
      RELICS[item.id].name,
      RELICS[item.id].d,
      item.sold ? soldButton() : price(item.price, `buyItem('relics', ${i})`),
    ),
  );
  const removal = box(
    ':trash:',
    'Card Removal',
    'Permanently remove a card from your deck (one per visit)',
    shop.removalUsed
      ? soldButton('Used')
      : price(shop.removalPrice, "showView('remove')", run.deck.length > 1),
  );

  return `
    <h2>${isSale ? ':tag: Bargain Bazaar' : ':cart: Wandering Merchant'}</h2>
    ${isSale ? note('Everything must go! Rock-bottom prices, no questions asked...', 'accent') : sectionTitle('Cards')}
    ${row(cards)}
    ${isSale ? '' : sectionTitle('Potions') + row(potions)}
    ${sectionTitle('Relics')}
    ${shop.relics.length ? row(relics) : '<div class="row muted">Sold out</div>'}
    ${isSale ? '' : sectionTitle('Services') + row([removal])}
    ${run.potions.includes('foul') ? `<div class="center spaced">${button('Sell Foul Potion (:gold: 100)', 'sellFoulPotion()')}</div>` : ''}
    <div class="center">${button('Leave shop', 'finishNode()')}</div>`;
}

function renderRemoveCard() {
  return `
    <h2>:trash: Remove a card (:gold: ${shop.removalPrice})</h2>
    ${row(run.deck.map((id, i) => cardHTML(id, -1, `removeCard(${i})`)))}
    <div class="center">${button('Back', "showView('shop')")}</div>`;
}

// ----- Events, campfire, upgrades -----

function renderEvent() {
  const event = eventState.event;
  const body =
    eventState.result !== null
      ? `${note(eventState.result, 'accent spaced')}<div class="center">${button('Continue', 'finishNode()')}</div>`
      : `<div class="row stack">${event.options.map((option, k) => button(option[0], `chooseEventOption(${k})`)).join('')}</div>`;
  return `
    <h2>:question: ${event.title}</h2>
    <div class="center big-icon">${I(event.img)}</div>
    <div class="center muted event-text">${event.text}</div>
    ${body}`;
}

function renderSacrifice() {
  return `<h2>:candle: Choose a card to sacrifice</h2>${row(run.deck.map((id, i) => cardHTML(id, -1, `sacrificeCard(${i})`)))}`;
}

function renderCampfire() {
  return `<h2>:fire: Campfire</h2>${row([button('Rest (+30% HP)', "useCampfire('heal')"), button('Upgrade a card', "useCampfire('upgrade')")])}`;
}

function renderUpgrade() {
  const choices = run.deck.map((id, i) =>
    id.endsWith('+') ? '' : cardHTML(id + '+', -1, `upgradeCard(${i})`),
  );
  return `
    <h2>:hammer: Choose a card to upgrade</h2>
    ${note('Showing the upgraded version', 'muted small')}
    ${row(choices)}
    <div class="center">${button('Back', "showView('rest')")}</div>`;
}

// ----- Acts and run end -----

function renderAncient() {
  const ancient = ANCIENTS[run.act - 1];
  const offers = ancientChoices.map(
    (id, i) => `
      <div class="panel item-box">
        <div class="item-icon big">${I(RELICS[id].img)}</div><b>${RELICS[id].name}</b>
        <div class="muted small item-text">${RELICS[id].d}</div>
        ${button(ancientChoices.length > 1 ? 'Take' : 'Accept', `takeAncientRelic(${i})`)}
      </div>`,
  );
  return `<h2>${I(ancient.img)} ${ancient.name}</h2><div class="center muted ancient-quote">${ancient.quote}</div>${row(offers)}`;
}

function renderActIntro() {
  return `
    <h2>:sunrise: Act ${run.act}: ${ACT_NAMES[run.act - 1]}</h2>
    ${note('You rest and recover to full health. Enemies are stronger here.')}
    ${row([button('Onward', 'meetAncient()')])}`;
}

function renderDefeat() {
  const floor = (run.act - 1) * FLOORS_PER_ACT + run.step + 1;
  return `<h2>:skull: You fell in Act ${run.act}, floor ${floor}</h2><div class="center">${button('Try again', 'newGame()')}</div>`;
}

function renderVictory() {
  return `<h2>:crown: You conquered the Spire!</h2><div class="center">${button('Play again', 'newGame()')}</div>`;
}

// ---------- Main entry ----------

/** Which function draws each screen. */
const SCREENS = {
  map: renderMap,
  fight: renderFight,
  reward: renderReward,
  relic: renderRelicShrine,
  shop: renderShop,
  remove: renderRemoveCard,
  event: renderEvent,
  evrm: renderSacrifice,
  rest: renderCampfire,
  upgrade: renderUpgrade,
  ancient: renderAncient,
  act: renderActIntro,
  dead: renderDefeat,
  victory: renderVictory,
};

/** Redraw the whole screen from the current state. */
function render() {
  if (view == 'select') return renderHeroSelect();
  setApp(statusBar() + SCREENS[view]());
  if (view == 'map') {
    drawMapLines();
    $('current-row')?.scrollIntoView({ block: 'center' });
  }
}
