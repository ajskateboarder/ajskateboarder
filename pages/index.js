import van_ from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js";

/** @type {import("./van").Van} */
const van = van_;

/** @type {HTMLElement} */
const sidebar = document.querySelector("aside");

/** @type {HTMLElement} */
const contents = document.querySelector("main");

export { van, sidebar, contents };
