import { van } from "../index.js";
import { refs, settings } from "./refs.js";

const { span, ul, details, summary, li } = van.tags;

const waitForElm = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(null);
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(null);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

/** @param {string[]} users */
const formatTypingUsers = (users) => {
  if (users.length === 0) {
    return "";
  } else if (users.length === 1) {
    return `, ${users[0]} is typing`;
  } else if (users.length === 2) {
    return `, ${users[0]} and ${users[1]} are typing`;
  } else {
    return `, ${users.slice(0, -1).join(", ")}, and ${users.at(-1)} are typing`;
  }
};

/**
 * @param {WebSocket} connection
 */
const TypingList = (connection) => {
  const list = span(" ");
  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.cmd === "typing") {
      // thanks for this eris :D
      const username = data.val.username;
      if (username === localStorage.getItem("ajs:user")) return;

      if (username in refs.usersTyping) {
        clearTimeout(refs.usersTyping[username]);
      }

      refs.usersTyping[username] = setTimeout(() => {
        if (username in refs.usersTyping) {
          clearTimeout(refs.usersTyping[username]);
          delete refs.usersTyping[username];
          list.innerText = formatTypingUsers(Object.keys(refs.usersTyping));
        }
      }, 4000);

      list.innerText = formatTypingUsers(Object.keys(refs.usersTyping));
    }
  });
  return list;
};

/**
 * @param {WebSocket} connection
 */
export const UserList = (connection) => {
  const list = ul({ class: "user-list" });
  const userCount = span("1 user online");
  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.cmd === "ulist") {
      for (const postUser of document.querySelectorAll(`.avatar`)) {
        postUser.nextElementSibling.style.display = "none";
      }
      list.innerHTML = "";
      /** @type {string[]} */
      let users = data.val.split(";").slice(0, -1);
      if (settings.sorted) {
        users.sort((a, b) => a.localeCompare(b));
      }
      for (const [i, user] of users.entries()) {
        waitForElm(".avatar").then(() => {
          for (const postUser of document.querySelectorAll(`.avatar`)) {
            if (users.includes(postUser.classList.item(1))) {
              postUser.nextElementSibling.style.display = "block";
            }
          }
        });
        list.append(li(user + (i === users.length - 1 ? "" : ", ")));
      }
      userCount.innerText = `${users.length} user${
        users.length === 1 ? "" : "s"
      } online`;
    }
  });
  return details(
    { class: "ulist" },
    summary(userCount, TypingList(connection)),
    list,
  );
};
