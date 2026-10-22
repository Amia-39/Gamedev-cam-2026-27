/*
 * map.js — building each act's map and moving around it.
 *
 * A map is a list of rows (floors). Each row has 1-4 nodes placed in columns 0-3.
 * node = { column, type, next: [indexes of reachable nodes in the next row], done }
 */

const MAP_COLUMNS = 4;
const LAST_ROW = FLOORS_PER_ACT - 1; // the boss
const RELIC_ROW = 7; // always a single relic shrine
const CAMP_ROW = LAST_ROW - 1; // always a single campfire before the boss
const SHOP_ROWS = [5, 11]; // one node on these rows is always a shop

// Random rooms are picked from this list, so repeated entries are more common.
const ROOM_TYPES = [
  'fight',
  'fight',
  'fight',
  'fight',
  'elite',
  'rest',
  'rest',
  'shop',
  'mystery',
  'mystery',
  'mystery',
];

/** What kind of room a node on row r is. */
function roomTypeForRow(r) {
  if (r == LAST_ROW) return 'boss';
  if (r == RELIC_ROW) return 'relic';
  if (r == CAMP_ROW) return 'rest';
  if (r == 0) return 'fight';
  const type = randomItem(ROOM_TYPES);
  return type == 'elite' && r < 3 ? 'fight' : type; // no elites in the first few floors
}

/** Makes one row of nodes. */
function generateMapRow(r) {
  const isSingleNode = r == LAST_ROW || r == RELIC_ROW || r == CAMP_ROW;
  let nodeCount = 1;
  if (!isSingleNode) nodeCount = r == 0 ? 3 + randomInt(2) : 2 + randomInt(3);
  const columns =
    r == LAST_ROW ? [1 + randomInt(2)] : shuffle([0, 1, 2, 3]).slice(0, nodeCount).sort();
  const nodes = columns.map((column) => ({
    column,
    type: roomTypeForRow(r),
    next: [],
    done: false,
  }));
  if (SHOP_ROWS.includes(r)) randomItem(nodes).type = 'shop';
  return nodes;
}

/** Index of the node in `row` whose column is closest to `column`. */
function nearestNode(row, column) {
  let best = 0;
  row.forEach((node, i) => {
    if (Math.abs(node.column - column) < Math.abs(row[best].column - column)) best = i;
  });
  return best;
}

/** Links every node to the nodes in the next row at the same or an adjacent column. */
function connectRows(rows) {
  for (let r = 0; r < LAST_ROW; r++) {
    const here = rows[r];
    const next = rows[r + 1];
    here.forEach((a) =>
      next.forEach((b, j) => {
        if (Math.abs(a.column - b.column) <= 1) a.next.push(j);
      }),
    );
    // Make sure nothing is a dead end and nothing is unreachable.
    here.forEach((a) => {
      if (!a.next.length) a.next.push(nearestNode(next, a.column));
    });
    next.forEach((b, j) => {
      if (!here.some((a) => a.next.includes(j))) here[nearestNode(here, b.column)].next.push(j);
    });
  }
}

/** A full act map. */
function generateMap() {
  const rows = [];
  for (let r = 0; r < FLOORS_PER_ACT; r++) rows.push(generateMapRow(r));
  connectRows(rows);
  return rows;
}

/** The player clicked node i of the current row. */
function chooseNode(i) {
  run.lastNodeIndex = i;
  const node = run.map[run.step][i];
  node.done = true;
  let type = node.type;
  if (type == 'mystery') {
    // Mostly an event, sometimes a surprise fight, a normal shop or the Bargain Bazaar.
    const roll = Math.random();
    if (roll < 0.12) type = 'fight';
    else if (roll < 0.21) type = 'shop';
    else if (roll < 0.3) {
      generateSaleShop();
      return showView('shop');
    } else {
      eventState = { event: randomItem(EVENTS), result: null };
      return showView('event');
    }
  }
  if (type == 'shop') {
    generateShop();
    return showView('shop');
  }
  if (type == 'relic') return visitRelicShrine();
  if (type == 'rest') return showView('rest');
  startCombat(type); // fight, elite or boss
}

/** Campfire choice: 'heal' recovers 30% HP, anything else opens the upgrade screen. */
function useCampfire(choice) {
  if (choice == 'heal') {
    run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * 0.3));
    finishNode();
  } else {
    showView('upgrade');
  }
}

/** Upgrade deck card i ('slash' becomes 'slash+') and move on. */
function upgradeCard(i) {
  run.deck[i] += '+';
  finishNode();
}
