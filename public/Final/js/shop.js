/*
 * shop.js — the Wandering Merchant, the Bargain Bazaar and the card-removal service.
 *
 * The current shop is stored in the global `shop`:
 *   { isSale, cards, potions, relics, removalPrice, removalUsed }
 * Each stock entry is { id, price, sold }.
 */

/** base + step * (0 .. choices-1), e.g. randomPrice(40, 5, 4) is 40, 45, 50 or 55. */
const randomPrice = (base, step, choices) => base + step * randomInt(choices);

const priced = (ids, base, step, choices) =>
  ids.map((id) => ({ id, price: randomPrice(base, step, choices) }));

/** The normal shop: 7 cards, 3 potions, 3 relics and one card removal. */
function generateShop() {
  const rewardPool = priced(shuffle([...REWARD_CARDS]).slice(0, 5), 40, 5, 4);
  const shopOnly = priced(shuffle([...SHOP_ONLY_CARDS]).slice(0, 2), 70, 5, 4);
  shop = {
    cards: shuffle([...rewardPool, ...shopOnly]),
    potions: priced(shuffle(droppablePotions()).slice(0, 3), 25, 5, 3),
    relics: priced(shuffle(availableRelics()).slice(0, 3), 100, 10, 4),
    removalPrice: 60,
    removalUsed: false,
  };
}

/** The Bargain Bazaar: cheap but weaker "Replica" relics only. */
function generateSaleShop() {
  const replicas = ['ember_s', 'bone_s', 'stout_s', 'satchel_s', 'heart_s', 'whet_s'];
  shop = {
    isSale: true,
    cards: [],
    potions: [],
    relics: priced(replicas, 30, 5, 4),
    removalPrice: 0,
    removalUsed: true,
  };
}

/** Buy item i from the list `kind` ('cards', 'potions' or 'relics'). */
function buyItem(kind, i) {
  const item = shop[kind][i];
  if (item.sold || run.gold < item.price) return;
  if (kind == 'potions') {
    if (run.potions.length >= potionSlots()) return;
    run.potions.push(item.id);
  } else if (kind == 'relics') {
    run.relics.push(item.id);
    onRelicGained(item.id);
  } else {
    run.deck.push(item.id);
  }
  run.gold -= item.price;
  item.sold = true;
  render();
}

/** Pay to remove card i of the deck (one per shop visit, never the last card). */
function removeCard(i) {
  if (shop.removalUsed || run.gold < shop.removalPrice || run.deck.length < 2) return;
  run.gold -= shop.removalPrice;
  run.deck.splice(i, 1);
  shop.removalUsed = true;
  showView('shop');
}

/**
 * Sell the Foul Potion. A normal merchant pays 100 gold.
 * In the Bargain Bazaar the "merchant" is a fake and attacks you instead.
 */
function sellFoulPotion() {
  const slot = run.potions.indexOf('foul');
  if (slot < 0) return;
  run.potions.splice(slot, 1);
  if (shop.isSale) {
    startCombat('elite', [SHOPKEEPER]);
    combatLog = [
      'The "merchant" eyes your potion... it is the real thing! She drops the act and lunges to steal it.',
    ];
  } else {
    run.gold += 100;
  }
  render();
}
