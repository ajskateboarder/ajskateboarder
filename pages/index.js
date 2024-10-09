import van_ from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js";
import markdownIt from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";

/** @type {import("./van").Van} */
const van = van_;

export const md = markdownIt({
  linkify: true,
  breaks: true,
});

/** @type {HTMLElement} */
const sidebar = document.querySelector("aside");

/** @type {HTMLElement} */
const contents = document.querySelector("main");

export { van, sidebar, contents };
