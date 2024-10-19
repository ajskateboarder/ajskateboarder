/** @type {Record<string, number>} */
const usersTyping = {};
/** @type {string[]} */
const replies = [];
/** @type {string[]} */
const attachments = [];
/** @type {string[]} */
const fileNames = [];

export const refs = {
  replies,
  attachments,
  fileNames,
  usersTyping,
};

export const settings = {
  everySecond: (localStorage.getItem("ajs:date-update") ?? "false") === "true",
  sortUlist: (localStorage.getItem("ajs:sort-ulist") ?? false) === "true",
  theme: localStorage.getItem("ajs:theme") ?? "light",
  compact: (localStorage.getItem("ajs:compact") ?? "false") === "true",
  infiniteScroll:
    (localStorage.getItem("ajs:infinite-scroll") ?? "true") === "true",
  fullWidth: (localStorage.getItem("ajs:full-width") ?? "true") === "true"
};
