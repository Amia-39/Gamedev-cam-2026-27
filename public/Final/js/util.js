/*
 * util.js — small helpers used everywhere.
 */

/** Shorthand for document.getElementById. */
const $ = (id) => document.getElementById(id);

/** HTML for a small inline picture. */
const I = (src) => `<img class="ic" src="${src}" alt="">`;

/**
 * Puts HTML on the page.
 * In text (not in attributes) a token like ":heart:" becomes the picture img/heart.svg,
 * so UI text can say ":gold: 12" without spelling out an <img> tag.
 */
const setApp = (html) => {
  const withIcons = html.replace(/>([^<]*)</g, (match, text) => {
    const replaced = text.replace(/:([a-z_]+):/g, (token, name) => I(`img/${name}.svg`));
    return '>' + replaced + '<';
  });
  $('app').innerHTML = withIcons;
};

/** A random element of an array. */
const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

/** Shuffles an array in place (and returns it). */
const shuffle = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/** A random whole number from 0 to n - 1. */
const randomInt = (n) => Math.floor(Math.random() * n);
