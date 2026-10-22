/*
 * state.js — the game's global state and constants.
 *
 * Everything that changes while you play lives in these few variables.
 * Other files read and write them directly, then call render() to redraw.
 */

const FLOORS_PER_ACT = 16;
const ACTS = 3;
const TOTAL_FLOORS = FLOORS_PER_ACT * ACTS;

/**
 * The whole run:
 *   act, step         current act (1-3) and the floor index inside it (0-15)
 *   hero              id from HEROES            hp, maxHp, gold
 *   deck              list of card ids ('slash', 'slash+' = upgraded)
 *   relics, potions   lists of ids
 *   map               this act's map: rows of nodes { column, type, next: [indexes into next row], done }
 *   lastNodeIndex     index of the node chosen in the previous row (decides which nodes are reachable)
 *   bossWon           true while the boss reward screen is showing
 */
let run = null;

/**
 * The fight in progress (null outside combat):
 *   enemies, kind ('fight' | 'elite' | 'boss')
 *   drawPile, hand, discardPile, exhaustPile      lists of card ids
 *   energy, block, strength, weak, vulnerable, thorns   the player's combat stats
 *   orbs, slots, amp                              Conduit orb rack
 *   turn                                          1 on the first turn
 */
let battle = null;

/** Which screen is showing: select, map, fight, reward, relic, shop, remove, event, evrm, rest, upgrade, ancient, act, dead, victory. */
let view = 'select';

// ---- Selection state during a fight ----
let selectedCard = null; // hand index of a card waiting for an enemy to be clicked
let selectedPotion = null; // potion slot waiting for an enemy to be clicked
let combatLog = []; // lines shown in the fight log

// ---- Data for the current non-combat screen ----
let cardRewards = []; // card ids offered after a fight
let goldReward = 0; // gold won in the last fight
let potionReward = null; // potion id won, 'full' if the belt was full, or null
let bonusRelic = null; // relic id dropped by an elite or boss
let shrineRelic = null; // relic id given by the relic shrine
let ancientChoices = []; // relic ids offered by the Ancient
let eventState = null; // { event, result } for the current Mystery event
let shop = null; // stock of the current shop (see generateShop in shop.js)
