import van_ from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js";
import markdownIt from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";

/** @type {import("./van").Van} */
const van = van_;

const md_ = markdownIt({
  linkify: true,
  breaks: true,
});

/** @param {string} text */
export const md = (text) =>
  md_
    .render(text)
    .replace(
      /&lt;:(\w+)&gt;/g,
      `<img src="https://uploads.meower.org/emojis/$1" style="height: 1.5rem; display: inline-block">`
    )
    .replace(
      /&lt;:(\w+):(\d+)&gt;/g,
      '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=24&quality=lossless" alt="$1" title="$1" class="emoji">'
    )
    .replace(
      /&lt;a:(\w+):(\d+)&gt;/g,
      '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=24&quality=lossless" alt="$1" title="$1" class="emoji">'
    );

/** @type {HTMLElement} */
const sidebar = document.querySelector("aside");

/** @type {HTMLElement} */
const contents = document.querySelector("main");

export { van, sidebar, contents };
