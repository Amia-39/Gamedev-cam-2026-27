/* combat.js — everything that happens during a fight.
State lives in the global `battle` object (see state.js); `run` is the whole run. */

/**
 * Builds a live enemy from its template.
 * HP grows with the floor and the act; normal enemies also hit harder in later acts (bosses are fixed).
 */
function createEnemy(template, floor) {
  const actHpBonus = template.boss ? 1 : 1 + (run.act - 1) * 0.55;
  const hp = Math.round(template.hp * (1 + floor * 0.035) * actHpBonus);
  return {
    ...template,
    hp,
    maxHp: hp,
    block: 0,
    vulnerable: 0,
    weak: 0,
    strength: 0,
    poison: 0,
    damageMult: template.boss ? 1 : 1 + (run.act - 1) * 0.3,
    moveIndex: 0, // which entry of `moves` the enemy performs next
  };
}

/** Picks the enemies for a normal fight: mostly singles early in an act, more pairs and trios later. */
function pickNormalEncounter(floor) {
  const pool = ENCOUNTERS[run.act - 1];
  const trioFloor = run.act > 1 ? 6 : 10;
  if (floor > trioFloor && Math.random() < 0.35) return randomItem(pool.trios);
  if (floor > 2 && Math.random() < 0.6) return randomItem(pool.pairs);
  return [randomItem(pool.singles)];
}

/**
 * Starts a fight. `kind` is 'fight', 'elite' or 'boss'.
 * `customEnemies` forces a specific list of enemies (used by the fake merchant).
 */
function startCombat(kind, customEnemies) {
  const floor = run.step;
  let templates;
  if (customEnemies) templates = customEnemies;
  else if (kind == 'boss') templates = [BOSSES[run.act - 1]];
  else if (kind == 'elite') templates = randomItem(ENCOUNTERS[run.act - 1].elites);
  else templates = pickNormalEncounter(floor);
  const enemies = templates.map((template) => createEnemy(template, kind == 'boss' ? 0 : floor));
  battle = {
    enemies,
    kind,
    drawPile: shuffle([...run.deck]),
    hand: [],
    discardPile: [],
    exhaustPile: [], // exhausted cards and played Powers: gone until the next fight
    energy: 3,
    block: 0,
    strength: hasRelic('ember') ? 1 : 0, // Strength lasts one turn, then resets in endTurn()
    weak: 0, // debuffs on the player
    vulnerable: 0,
    thorns: hasRelic('ring') ? 2 : 0,
    orbs: [], // Conduit orb rack
    slots: 3,
    amp: 0, // Amplify: bonus added to every orb
  };
  if (hasRelic('core')) battle.orbs.push('spark');
  combatLog = ['A fight begins!'];
  view = 'fight';
  startTurn();
}

/** Draws up to n cards (max hand size 10), reshuffling the discard pile when the draw pile runs out. */
function drawCards(n) {
  for (let i = 0; i < n; i++) {
    if (battle.hand.length >= 10) return;
    if (!battle.drawPile.length) {
      battle.drawPile = shuffle(battle.discardPile);
      battle.discardPile = [];
    }
    if (!battle.drawPile.length) return;
    const cardId = battle.drawPile.pop();
    battle.hand.push(
      battle.upgradeAllUntilEndOfCombat && !cardId.endsWith('+') && CARDS[cardId + '+']
        ? cardId + '+'
        : cardId
    )
  }
}
/** Start of the player turn: reset energy/block, apply start-of-turn relics, draw a hand. */
function startTurn() {
  const firstTurn = !battle.turn;
  battle.strength = hasRelic('ember') || (hasRelic('ember_s') && firstTurn) ? 1 : 0;
  selectedPotion = null;
  battle.energy = 3 + (firstTurn && hasRelic('lantern') ? 1 : 0);
  battle.turn = (battle.turn || 0) + 1;
  battle.block =
    (hasRelic('stout') ? 3 : hasRelic('stout_s') ? 1 : 0) +
    (firstTurn && hasRelic('sigil') ? 5 : 0);
  battle.enemies.forEach((e) => {
    if (e.hp > 0) e.block = 0;
  });
  selectedCard = null;
  drawCards(5 + (hasRelic('satchel') || (hasRelic('satchel_s') && firstTurn) ? 1 : 0));
  render();
}
/** Damage after Strength, relic bonuses, Weak (-25%) and Vulnerable (+50%). */
function calcDamage(base, atk, def) {
  let d =
    Math.round(base * (atk.damageMult || 1)) +
    atk.strength +
    (atk === battle && hasRelic('whet') ? 1 : 0) +
    (atk === battle && hasRelic('whet_s') && battle.turn == 1 ? 1 : 0);
  if (atk.weak > 0) d *= 0.75;
  if (def.vulnerable > 0) d *= 1.5;
  return Math.max(0, Math.floor(d));
}
/** Player attack: damage goes through the enemy block first. */
function attackEnemy(e, base) {
  let d = calcDamage(base, battle, e);
  let ab = Math.min(e.block, d);
  e.block -= ab;
  e.hp -= d - ab;
}
/** True if the card must be aimed at one enemy. */
function needsTarget(c) {
  return (c.t == 'A' && !c.all) || c.tgt;
}
/** Enemies that are still alive. */
function livingEnemies() {
  return battle.enemies.filter((e) => e.hp > 0);
}
/** Orb damage: reduced by block like an attack, but not boosted by Strength. */
function damageEnemyDirect(e, n) {
  const ab = Math.min(e.block, n);
  e.block -= ab;
  e.hp -= n - ab;
}
/** Fire an orb. `evoked` = true uses the bigger evoke amount, false the passive amount. */
function triggerOrb(o, evoked) {
  const n = (evoked ? ORBS[o].v : ORBS[o].p) + battle.amp;
  if (o == 'spark') {
    const a = livingEnemies();
    if (a.length) damageEnemyDirect(randomItem(a), n);
  } else if (o == 'ward') battle.block += n;
  else livingEnemies().forEach((e) => damageEnemyDirect(e, n));
}
/** Remove the leftmost orb and fire its evoke effect. */
function evokeNextOrb() {
  const o = battle.orbs.shift();
  if (o) triggerOrb(o, 1);
}
/** Add an orb to the rack, evoking the leftmost one first if the rack is full. */
function channelOrb(o) {
  if (battle.orbs.length >= battle.slots) evokeNextOrb();
  battle.orbs.push(o);
}
/** Play the card at hand position i. If it needs a target and several enemies are alive, the first click only selects it. */
function playCard(i, target) {
  const id = battle.hand[i],
    c = CARDS[id];
  if (!c || c.c > battle.energy) return;
  if (needsTarget(c) && !target) {
    const a = livingEnemies();
    if (a.length == 1) target = a[0];
    else {
      selectedCard = selectedCard === i ? null : i;
      selectedPotion = null;
      render();
      return;
    }
  }
  battle.energy -= c.c;
  battle.hand.splice(i, 1);
  selectedCard = null;
  if (c.damage || c.bd) {
    const dv = (c.damage || 0) + (c.bd ? battle.block : 0),
      ts = c.all ? livingEnemies() : [target];
    for (let k = 0; k < (c.hits || 1); k++)
      ts.forEach((e) => {
        if (e.hp > 0) attackEnemy(e, dv);
      });
  }
  if (c.block) battle.block += c.block;
  if (c.vulnerable && target) target.vulnerable += c.vulnerable;
  if (c.weak && target) target.weak += c.weak;
  if (c.poison) {
    const n = c.poison + (hasRelic('fang') ? 1 : 0);
    (c.all ? livingEnemies() : [target]).forEach((e) => (e.poison += n));
  }
  if (c.dblp && target) target.poison *= 2;
  if (c.dblv && target) target.vulnerable *= 2;
  if (c.heal) run.hp = Math.min(run.maxHp, run.hp + c.heal);
  if (c.strength) battle.strength += c.strength;
  if (c.thorn) battle.thorns += c.thorn;
  if (c.amp) battle.amp += c.amp;
  if (c.slot) battle.slots += c.slot;
  if (c.ch) c.ch.forEach(channelOrb);
  for (let k = 0; k < (c.ev || 0); k++) evokeNextOrb();
  if (c.evall) while (battle.orbs.length) evokeNextOrb();
  if (c.en) battle.energy += c.en;
  if (c.self) run.hp -= c.self;
  if (c.copy) battle.discardPile.push(id);
  if (c.rupgrade) {
    const upgradeable = battle.hand.filter((cardId) => !!CARDS[cardId + '+'] && !cardId.endsWith('+'));
    if (upgradeable.length) {
      const chosen = randomItem(upgradeable);
      const idx = battle.hand.indexOf(chosen);
      battle.hand[idx] += '+';
    }
  };
  if (c.upgradeAll) {
  battle.hand = battle.hand.map((cardId) => {
    if (cardId.endsWith('+') || !CARDS[cardId + '+']) return cardId;
    return cardId + '+';
  });
  };
  if (c.exhr) {
  if (!battle.hand.length) return;

  const targetId = randomItem(battle.hand);
  const idx = battle.hand.indexOf(targetId);

  battle.hand.splice(idx, 1);
  battle.exhaustPile.push(targetId);

  combatLog.push(`You exhaust ${CARDS[targetId].name}.`);
  };
  if (c.topdisc) {
  if (!battle.discardPile.length) return;

  const cardId = randomItem(battle.discardPile);
  const idx = battle.discardPile.indexOf(cardId);
  battle.discardPile.splice(idx, 1);
  battle.drawPile.push(cardId);
  };

  // THIS IS CODE FOR HAVOC, 
  // Surely theres a shorter way to do this but whatever
  //like it's just the code for the other cards but again
  if (c.topdx) {
  const id = battle.drawPile.pop();
  if (!id) return;

  const topCard = CARDS[id];
  if (!topCard) return;

  let target = null;
  if (needsTarget(topCard)) {
    const a = livingEnemies();
    if (a.length == 1) target = a[0];
    else {
      selectedCard = null;
      render();
      return;
    }
  }

  // same effect logic as playCard(), but for topCard instead of battle.hand[i]
  if (topCard.damage || topCard.bd) {
    const dv = (topCard.damage || 0) + (topCard.bd ? battle.block : 0),
      ts = topCard.all ? livingEnemies() : [target];
    for (let k = 0; k < (topCard.hits || 1); k++)
      ts.forEach((e) => {
        if (e.hp > 0) attackEnemy(e, dv);
      });
  }
  if (topCard.block) battle.block += topCard.block;
  if (topCard.vulnerable && target) target.vulnerable += topCard.vulnerable;
  if (topCard.weak && target) target.weak += topCard.weak;
  if (topCard.poison) {
    const n = topCard.poison + (hasRelic('fang') ? 1 : 0);
    (topCard.all ? livingEnemies() : [target]).forEach((e) => (e.poison += n));
  }
  if (topCard.dbl && target) target.poison *= 2;
  if (topCard.heal) run.hp = Math.min(run.maxHp, run.hp + topCard.heal);
  if (topCard.strength) battle.strength += topCard.strength;
  if (topCard.thorn) battle.thorns += topCard.thorn;
  if (topCard.amp) battle.amp += topCard.amp;
  if (topCard.slot) battle.slots += topCard.slot;
  if (topCard.ch) topCard.ch.forEach(channelOrb);
  for (let k = 0; k < (topCard.ev || 0); k++) evokeNextOrb();
  if (topCard.evall) while (battle.orbs.length) evokeNextOrb();
  if (topCard.en) battle.energy += topCard.en;
  if (topCard.self) run.hp -= topCard.self;

  battle.exhaustPile.push(id);
  combatLog.push('You play ' + topCard.name + ' from the draw pile and exhaust it.');
  };
  // END OF CODE FOR HAVOC


  combatLog.push('You play ' + c.name + '.');
  (c.exh ? battle.exhaustPile : c.t == 'P' ? battle.exhaustPile : battle.discardPile).push(id);
  if (c.draw) drawCards(c.draw);
  if (run.hp <= 0) return loseRun();
  if (!livingEnemies().length) return winCombat();
  render();
}
/** Drink the potion at slot i (aim it first if it needs a target). */
function usePotion(i, target) {
  const id = run.potions[i],
    p = POTIONS[id];
  if (!p || view != 'fight') return;
  if (p.tgt && !target) {
    const a = livingEnemies();
    if (a.length == 1) target = a[0];
    else {
      selectedPotion = selectedPotion === i ? null : i;
      selectedCard = null;
      render();
      return;
    }
  }
  if (id == 'heal') run.hp = Math.min(run.maxHp, run.hp + 15);
  if (id == 'fire') {
    target.block = 0;
    target.hp -= 20;
  }
  if (id == 'foul') target.hp -= 12;
  if (id == 'stone') battle.block += 12;
  if (id == 'vigor') battle.strength += 2;
  if (id == 'energy') battle.energy += 2;
  if (id == 'weak')
    livingEnemies().forEach((e) => {
      e.weak += 3;
      e.vulnerable += 2;
    });
  if (id == 'swift') drawCards(3);
  run.potions.splice(i, 1);
  selectedPotion = null;
  combatLog.push('You drink ' + p.name + '.');
  if (!livingEnemies().length) return winCombat();
  render();
}
/** Throw away the potion at slot i. */
function discardPotion(i) {
  run.potions.splice(i, 1);
  selectedPotion = null;
  render();
}
/** End of the player turn: orbs fire, poison ticks, then every living enemy performs its next move. */
function endTurn() {
  battle.orbs.forEach((o) => triggerOrb(o, 0));
  if (!livingEnemies().length) return winCombat();
  battle.strength = 0;
  const pw = battle.weak,
    pv = battle.vulnerable;
  battle.discardPile.push(...battle.hand);
  battle.hand = [];
  for (const e of livingEnemies()) {
    if (e.poison > 0) {
      e.hp -= e.poison;
      e.poison--;
    }
  }
  if (!livingEnemies().length) return winCombat();
  for (const e of livingEnemies()) {
    e.block = 0;
    const move = e.moves[e.moveIndex % e.moves.length];
    e.moveIndex++;
    if (move.block) e.block += move.block;
    if (move.strength) e.strength += move.strength;
    if (move.heal) {
      const t = livingEnemies().reduce((a, b) => (b.hp / b.maxHp < a.hp / a.maxHp ? b : a));
      t.hp = Math.min(t.maxHp, t.hp + move.heal);
    }
    if (move.attack) {
      for (let k = 0; k < (move.hits || 1); k++) {
        let d = calcDamage(move.attack, e, battle);
        let ab = Math.min(battle.block, d);
        battle.block -= ab;
        run.hp -= d - ab;
        if (battle.thorns) e.hp -= battle.thorns;
      }
      combatLog.push(`${e.name} attacks.`);
    }
    if (move.weak) battle.weak += move.weak;
    if (move.vulnerable) battle.vulnerable += move.vulnerable;
    if (run.hp <= 0) return loseRun();
  }
  if (!livingEnemies().length) return winCombat();
  battle.enemies.forEach((e) => {
    if (e.vulnerable > 0) e.vulnerable--;
    if (e.weak > 0) e.weak--;
  });
  battle.weak = Math.max(0, pw - 1) + (battle.weak - pw);
  battle.vulnerable = Math.max(0, pv - 1) + (battle.vulnerable - pv);
  startTurn();
}
/** Text shown above an enemy telling the player what it will do next turn. */
function describeIntent(e) {
  const move = e.moves[e.moveIndex % e.moves.length];
  let p = [];
  if (move.attack) {
    const d = calcDamage(move.attack, e, battle);
    p.push(`:swords: ${d}${move.hits ? '×' + move.hits : ''}`);
  }
  if (move.heal) p.push(':green_heart: Heals ' + move.heal);
  if (move.block) p.push(':shield: ' + move.block);
  if (move.strength) p.push(':muscle: +' + move.strength);
  if (move.weak) p.push('Weakens you');
  if (move.vulnerable) p.push('Exposes you');
  return p.join(' · ');
}
/** Gives a random relic the player does not own. Returns its id, or null if none are left. */
function grantRelic() {
  const pool = availableRelics();
  if (!pool.length) return null;
  const r = randomItem(pool);
  run.relics.push(r);
  onRelicGained(r);
  return r;
}
/** Combat won: heal from relics, roll rewards (gold, relic, potion, card choices) and show the reward screen. */
function winCombat() {
  run.hp = Math.min(
    run.maxHp,
    run.hp +
      (battle.kind == 'elite' ? 10 : 0) +
      (hasRelic('blood') ? 6 : 0),
  );
  if (battle.kind == 'boss' && run.act == 3) {
    view = 'victory';
    return render();
  }
  run.bossWon = battle.kind == 'boss';
  bonusRelic = battle.kind == 'elite' || battle.kind == 'boss' ? grantRelic() : null;
  goldReward =
    (battle.kind == 'boss' ? 100 : battle.kind == 'elite' ? 35 : 15) + ((Math.random() * 16) | 0);
  run.gold += goldReward;
  potionReward = null;
  if (Math.random() < 1 / 3) {
    if (run.potions.length < potionSlots()) {
      potionReward = Math.random() < 0.15 ? 'foul' : randomItem(droppablePotions());
      run.potions.push(potionReward);
    } else potionReward = 'full';
  }
  const pool = shuffle([...REWARD_CARDS]).slice(0, 3);
  cardRewards = pool;
  view = 'reward';
  render();
}
/** The player died. */
function loseRun() {
  view = 'dead';
  render();
}
