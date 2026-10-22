/*
 * main.js — starts the game. Loaded last.
 */

// The map lines are positioned from the buttons, so redraw them when the window changes size.
window.addEventListener('resize', () => {
  if (view == 'map') drawMapLines();
});

newGame();
