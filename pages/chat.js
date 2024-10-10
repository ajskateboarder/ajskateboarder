import { van, sidebar, contents, md } from "./index.js";
import login from "./login.js";

// prettier-ignore
const { textarea, ul, li, details, summary, b, div, i, span, button, p, br, img, video, input, small, audio, source, a, dialog, h2, select, option } = van.tags;

const usersTyping = {};

let replys = [];
let attachments = [];
let fileNames = [];

let everySecond = localStorage.getItem("ajs:date-update") ?? false;
let sortUlist = localStorage.getItem("ajs:sort-ulist") ?? false;
let theme = localStorage.getItem("ajs:theme") ?? "light";

const skateboardPfp = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAB8fHx8fHyAgICEhIRERESAgICEhISEhISEhIRwcHB0dHSAgIBUVFRMTEyAgICAgICAgIBAQEBMTEyAgIBYWFhQUFCAgICAgIBcXFxwcHCAgICAgICAgICAgICAgIBMTEyAgIBERER8fHyAgICAgIBISEh8fHyEhISEhISAgICAgICAgICAgICAgIB4eHiEhISAgIBISEhQUFCAgICAgIBUVFR4eHiAgICAgICAgIBwcHB8fHyAgICAgICEhIRgYGCAgICAgICEhISAgICAgICAgICAgICEhISAgIBYWFiEhIR8fHxERESAgIB4eHh8fHyAgICAgIB0dHRsbGx8fHx4eHh8fHyAgICEhIR4eHh0dHSAgICAgIB8fHyAgIB0dHSAgICAgIB0dHSEhISAgICAgICAgIB8fHyAgICAgIB0dHSAgIB0dHR0dHRwcHB0dHSAgICAgICAgIBsbGx4eHiAgICEhISAgICAgICEhIRkZGSAgICAgICAgICEhISAgIBsbGx8fHyAgICAgICEhISEhISAgICAgICAgICAgIBwcHBERESEhISEhISAgIB8fHyEhIRgYGB8fHxgYGCEhISEhIR0dHR8fHyAgICEhISAgICAgICAgICAgICAgIBoaGhwcHCEhISEhISAgIBsbGyEhISAgICEhIRwcHCEhISAgICEhIR8fHyEhISEhISEhISAgIB8fHx0dHR4eHhwcHBgYGCAgIB8fHyAgIBsbGyEhISAgICAgIB0dHRwcHCEhIRQUFCAgIBwcHB8fHx8fHyAgICEhISEhISAgIBwcHCAgICAgIB8fHyAgIB8fHyAgICEhISEhISAgIBMTExoaGhoaGiAgIBcXFyEhIRISEh8fHxQUFCAgIB8fHxUVFSAgICAgICAgIBsbGxsbGx4eHiAgICEhIRYWFiAgIB8fHxoaGiEhISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICEhISEhISAgIB0dHR4eHiEhIRgYGCAgICEhIYEB+2cAAAD/dFJOUwA7V/z9Afn++/keO/sKBf6C9gID8AYE+OUJJPqTkLqSApkJQo7XB1Ly/Nv99e57MPT3DQLm7A83jIeBMU6K4MkRbPT6rMjkfJhuDe9eBoY+R5HKNR1pMVZm9jsrvsZTrzinyTq98b/pP2fhJfIyFCMp782bJz3FjYjO9xOdi4mJjxs9jWqchYSFg5RACLC/sFrPI08VzI4vVXTqB7LZdXcZP8fuXznTlZQg503zUKCVim1gMDQcHO1Y4hrdeuctJqcIuCxDSnDRgtAf6pdLNlTf38TdDjg91SnxDGwXXUQVnvNxHiE82qEIpTcY49Soq7yusbm3tKTrrbYnLukM6HM+SxQAAAOJSURBVFjD5Zd3dFRFFMavurtvlU02yW42CSG9954IGEKKCUTTG6RDOiSkiGJDbKDYe++VYge7YC9gQSn2CjawACJY8fPtPk/YNvPe2z/8h++cPe+ePfO7M9/MvDvziA4/eV1cmB8xw+fqII/o8LiSIki66UQP+JbT/qNRWgvcn6WWzzNjXNH3JGOFSn56IOw0q3+20KQuwbH2PHoWzMLT/mr4iac7JMBz2g14SgXv3ebIYy59gjkqEix14pGh/RBblPOT4aKPvZMMfkr5Ka48MqlH/HnOa0xkxlZlvI8bHn2k1QsWRfxya/vjphocE2ymT/GmIv4CW/uoicGOCcLofRyvhL9Qai9onCzE0WuIUMAvg3vNLqcOPCbPV7r1L+oFenHQ+ITC/ePiX1QztaNWlj/V2f+RE46Sgm6ilzBTjj/Lpd8jjjna9jQ00sua9Oky/BLXqdNLPB4hKkGIDJ8Ppub6U5Wx6A4+v9iZGvePec9QUAzK1BQwyb9OCtY9TzQD9/Hr2SK2/5z1RAOC7/Vc/jy2f/NaoiaDkX+uRLP5B5qJ2ouRyuXPZvO+rxA9qEPyfB4fwuZ1bxOtts7lpZ7x+k1ErwbYRqJl8jVsXvMZUXWGLQxm1uMwNi8MEH3uK8WtLH6S456zl3E7UVQyEmwO6hj8RQ7vnKPEletPx1uNlyUknZLH6//QnnNQJdE3X+EkcfJiL2Hgpgi2f9QQdQ3iSy1n+c4JZfu39rzLjO/C2fgZPvEc/weyqG4UOzm3ovPNcPZvN5bfLTSUgp9N7OvbmW56HX//8Yc/peVgt0Xl6Tk+ltYg+us37OXwCw2c6UfbQWr5G794c+bfdfva+R/LpZF/sJ9bwGI4/n9aQH9m49dYbgEJYPv/9geaH4h93/MrcDHT/7s7aPhH7JG7mk9j8YHD9PU89HrJnYEnMPi+Edr4HoR35HiT4J5/cg3VPys+Q+US+Gnc8qvS6PFE24xWyGUIRKIrf1c9rZT+1kTKJbgcN97ihMffbqHObCmWv4tdgZibC1Ps8FKfa8h0WwBs3nTnyl/lb0U05T7aLa6G8NEHHan3ijW76loYr0sL1WsKTlZwl+vSYZJ1sSsipVfGO65XwLRqMYqNJEW6IQDZb3Rac2i/2NYw524gpcyL1GiowFr540fTbWVfuHJmueqPwjsfft16aiXljD3UcJWHn7XazFwvP/qf9S9iQ2YeHfeOgAAAAABJRU5ErkJggg==`;
const emojiRegex =
  /^(?:(?!\d)(?:\p{Emoji}|[\u200d\ufe0f\u{E0061}-\u{E007A}\u{E007F}]))+$/u;
const discordRegex = /^<(a)?:\w+:\d+>$/gi;

const mobile = () => {
  let check = false;
  ((a) => {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

const waitForElm = (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve();
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

/** @param {WebSocket} connection */
const UserList = (connection) => {
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
      if (sortUlist) {
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
    list
  );
};

/** @param {string[]} users */
const fmtTypingUsers = (users) => {
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

/** @param {WebSocket} connection */
const TypingList = (connection) => {
  const list = span(" ");
  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.cmd === "typing") {
      // thanks for this eris :D
      const username = data.val.username;
      if (username === localStorage.getItem("ajs:user")) return;

      if (username in usersTyping) {
        clearTimeout(usersTyping[username]);
      }

      usersTyping[username] = setTimeout(() => {
        if (username in usersTyping) {
          clearTimeout(usersTyping[username]);
          delete usersTyping[username];

          list.innerText = fmtTypingUsers(Object.keys(usersTyping));
        }
      }, 4000);

      list.innerText = fmtTypingUsers(Object.keys(usersTyping));
    }
  });
  return list;
};

/** @param {WebSocket} connection */
const Signout = (connection) => {
  return button(
    {
      class: "regular-button",
      onclick: async () => {
        localStorage.removeItem("ajs:token");
        connection.close();
        await login();
      },
    },
    i({ class: "fa-solid fa-sign-out" }),
    " Sign out"
  );
};

/** @param {WebSocket} connection */
const Navbar = (connection) => {
  return div(
    { class: "navbar" },
    b("ajskateboarder"),
    span(
      { style: "display: flex; gap: 10px; align-items: center" },
      Signout(connection),
      button(
        {
          class: "action",
          onclick: () => {
            document.querySelector("dialog").showModal();
          },
        },
        i({ class: "fa-solid fa-cog" })
      )
    )
  );
};

function timeAgo(epochTime) {
  const now = Date.now(); // Current time in milliseconds
  const secondsAgo = Math.floor((now - epochTime * 1000) / 1000); // Convert epoch time to milliseconds and calculate seconds ago

  if (secondsAgo < 60) {
    return `${secondsAgo} secs ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} min${minutesAgo === 1 ? "" : "s"} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hr${hoursAgo === 1 ? "" : "s"} ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }
}

const Post = (data) => {
  let replyBox;
  let attachments;

  if (data.reply_to && data.reply_to.filter((e) => e !== null).length !== 0) {
    /** @param {string} e */
    const fmtReply = (e) => {
      let post = e;
      if (post.length > 50) {
        post = post.slice(0, 30) + "...";
      }
      return post;
    };

    replyBox = div(
      { class: "reply-header" },
      ...data.reply_to.map((e) => {
        return p(
          {
            class: "post",
            style:
              "padding-bottom: 10px; margin-bottom: 0px; gap: 10px; flex-wrap: wrap",
          },
          b(`@${e.author._id}`),
          span(fmtReply(e.p))
        );
      })
    );
  }

  if (data.attachments.length !== 0) {
    attachments = div(
      { class: "attachments" },
      ...data.attachments.map((e) => {
        if (e.mime.startsWith("video/")) {
          return video({
            src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}?preview`,
            controls: true,
            class: "preview",
          });
        } else if (e.mime.startsWith("image/")) {
          return img({
            src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}?preview`,
            onclick: () => {
              const h = dialog(
                { class: "image-view" },
                img({
                  style: "max-height: 100vw",
                  src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}`,
                })
              );
              const ev = (e) => {
                if (e.target.closest(".image-view")) {
                  h.close();
                }
              };
              window.onclick = ev;
              document.body.append(h);
              h.showModal();
            },
            class: "preview",
          });
        } else if (e.mime.startsWith("audio/")) {
          return audio(
            {
              controls: true,
            },
            source({
              src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}?preview`,
              type: e.mime,
            })
          );
        } else {
          return a(
            {
              href: ``,
            },
            `Download ${e.filename} (${formatBytes(e.size)})`
          );
        }
      })
    );
  }

  const time = span(
    { style: "color: grey", title: new Date(data.t.e * 1000).toString() },
    "• " + timeAgo(data.t.e - 1)
  );
  setInterval(
    () => {
      const newTime = "• " + timeAgo(data.t.e - 1);
      if (time.innerText !== newTime) {
        time.innerText = newTime;
      }
    },
    everySecond ? 1000 : 5000
  );

  const avatar = img({
    height: "48",
    class: `avatar ${data.author._id}`,
    width: "48",
    src: `https://uploads.meower.org/icons/${data.author.avatar}`,
    onerror: () => {
      avatar.src = skateboardPfp;
      avatar.classList.add("default-avatar");
    },
  });

  const replyToPost = () => {
    replys.push(data._id);
    document.querySelector(".post-box").focus();
    document.querySelector("#replyList").append(
      p(
        {
          class: "post",
          id: `reply-${data._id}`,
          style:
            "padding-bottom: 10px; margin-bottom: 0px; display: flex; justify-content: space-between",
        },
        span(
          b(`@${data.author._id}`),
          " ",
          data.p.length > 50 ? data.p.slice(0, 30) + "..." : data.p
        ),
        button(
          {
            class: "action",
            onclick: (e) => {
              const index = replys.findIndex((e) => e === data._id);
              replys = replys.slice(0, index).concat(replys.slice(index + 1));
              document.querySelector(`[id="reply-${data._id}"]`).remove();
            },
          },
          i({ class: "fa-solid fa-x" })
        )
      )
    );
  };

  const editPost = async (e) => {
    e.stopImmediatePropagation();
    const text = document.querySelector(`[id="${data._id}"] .markdown-body`);
    text.style.display = "none";
    e.target.disabled = true;

    const submit = button(
      {
        style:
          "border: none; width: 40px; height: 40px; border-top-right-radius: 5px; border-bottom-right-radius: 5px",
        onclick: async () => {
          data.p = editText.value;
          await fetch(`https://api.meower.org/posts?id=${data._id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Token: localStorage.getItem("ajs:token"),
            },
            body: JSON.stringify({
              content: editText.value,
            }),
          });
          editField.remove();
          text.style.display = "block";
          e.target.disabled = false;
        },
      },

      i({ class: "fa-solid fa-check" })
    );

    const cancel = button(
      {
        style: "border: none; width: 40px; height: 40px",
        onclick: async () => {
          editField.remove();
          text.style.display = "block";
          e.target.disabled = false;
        },
      },

      i({ class: "fa-solid fa-x" })
    );

    const editText = textarea(
      {
        style:
          "border-top-left-radius: 5px; border-bottom-left-radius: 5px; padding: 5px",
        class: "post-box",
        onkeydown: async (e) => {
          if (e.key === "Enter" && !e.shiftKey && !mobile()) {
            e.preventDefault();
            submit.click();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel.click();
          }
        },
      },
      data.p
    );

    const editField = span(
      {
        class: "edit-field",
      },
      editText,
      cancel,
      submit
    );

    text.after(editField);
    editText.focus();
  };

  const post = div(
    { class: "post", id: data._id },
    span(
      avatar,
      div({
        class: "online-circle",
        style: `display: ${
          [...document.querySelectorAll(".user-list > li")]
            .map((e) => e.innerHTML.replace(", ", ""))
            .includes(data.author._id)
            ? "block"
            : "none"
        }`,
      })
    ),
    span(
      { style: "display: flex; flex-direction: column; width: 100%" },
      div(
        { class: "post-header" },
        span(b(data.u), " ", time, small({ class: "edit-status" })),
        span(
          { class: "button-row" },
          button(
            {
              class: "action",
              onclick: replyToPost,
            },
            i({ class: "fa-solid fa-reply" })
          ),
          data.author._id === localStorage.getItem("ajs:user")
            ? button(
                {
                  class: "action",
                  onclick: async (e) => {
                    if (!e.shiftKey) {
                      if (
                        !confirm("Are you sure you want to delete this post?")
                      ) {
                        return;
                      }
                    }
                    await fetch(`https://api.meower.org/posts?id=${data._id}`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Token: localStorage.getItem("ajs:token"),
                      },
                    });
                  },
                },
                i({ class: "fa-solid fa-trash" })
              )
            : undefined,
          data.author._id === localStorage.getItem("ajs:user")
            ? button(
                {
                  class: "action edit-button",
                  onclick: async (e) => {
                    await editPost(e);
                  },
                },
                i({ class: "fa-solid fa-pencil" })
              )
            : undefined
        )
      ),
      replyBox,
      span({
        class: "markdown-body",
        innerHTML: md
          .render(data.p)
          .replace(
            /&lt;:(\w+)&gt;/g,
            `
            <object data="https://cdn.discordapp.com/emojis/1221628997025267752.webp?size=24&quality=lossless" type="image/png">
              <img src="https://uploads.meower.org/emojis/$1" style="height: 1.5rem; display: inline-block">
            </object>`
          )
          .replace(
            /&lt;:(\w+):(\d+)&gt;/g,
            '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=24&quality=lossless" alt="$1" title="$1" class="emoji">'
          )
          .replace(
            /&lt;a:(\w+):(\d+)&gt;/g,
            '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=24&quality=lossless" alt="$1" title="$1" class="emoji">'
          ),
      }),
      attachments
    )
  );

  let touchstartX,
    touchstartY,
    touchendX,
    touchendY,
    tappedTwice = false;

  post.ontouchstart = (e) => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
    // if (!e.target.closest(".markdown-body")) e.preventDefault();
  };

  post.ontouchmove = (e) => {
    let xTop = e.touches[0].clientX;
    let yTop = e.touches[0].clientY;
    if (
      e.target.closest(".post-header") &&
      post.querySelector(".edit-field") === null
    ) {
      let xDiff = touchstartX - xTop;
      let yDiff = touchstartY - yTop;

      let px = xDiff / -3.2;
      if (data.u !== localStorage.getItem("ajs:user") && px > 0) {
        px = 0;
      }
      post.style.transform = `translateX(${px}px)`;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          e.preventDefault();
        } else {
          e.preventDefault();
        }
      }
    }
  };

  post.ontouchend = async (e) => {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    post.style.cssText = "";

    const itsValid =
      e.target.closest(".post-header") &&
      post.querySelector(".edit-field") === null;

    if (
      touchendX < touchstartX &&
      Math.abs(touchendX - touchstartX) > 200 &&
      itsValid
    ) {
      post.classList.add("silly-replying-gesture");
      replyToPost();
      setTimeout(() => {
        post.classList.remove("silly-replying-gesture");
      }, 1000);
    } else if (
      touchendX > touchstartX &&
      Math.abs(touchendX - touchstartX) > 200 &&
      itsValid &&
      post.querySelector(".post-header b").innerText ===
        localStorage.getItem("ajs:user")
    ) {
      post.classList.add("silly-editing-gesture");
      await editPost(e);
      setTimeout(() => {
        post.classList.remove("silly-editing-gesture");
      }, 1000);
    } else if (touchstartY === touchendY && itsValid) {
      if (!tappedTwice) {
        tappedTwice = true;
        setTimeout(() => {
          tappedTwice = false;
        }, 150);
        return;
      } else {
        if (e.target.closest(".post-header")) {
          e.preventDefault();
          if (!e.target.closest(".edit-field")) {
            document.querySelector(".post-box").value = `@${data.author._id} `;
            document.querySelector(".post-box").focus();
          }
        }
      }
    }
  };

  return post;
};

/** @param {File} file */
const uploadFile = async (file) => {
  if (file.size > 25 << 20) {
    alert(
      `This attachment is too big. Please find a way to make it under ${formatBytes(
        25 << 20
      )}`
    );
    return;
  }
  const form = new FormData();
  form.set("file", file);
  const response = await (
    await fetch("https://uploads.meower.org/attachments", {
      method: "POST",
      body: form,
      headers: { Authorization: localStorage.getItem("ajs:token") },
    })
  ).json();
  attachments.push(response.id);
  return file.name;
};

/** @param {HTMLElement} fileList */
const updateFileList = (fileList) => {
  fileList.innerHTML = "";
  if (fileNames.length !== 0) {
    fileList.append(
      span(
        span(
          `Uploading ${fileNames.length} file${
            fileNames.length > 1 ? "s" : ""
          }: `
        ),
        span(
          ...fileNames.map((id, idx) =>
            span(
              { class: "file-upload", id: `remove-${id}` },
              a(
                {
                  href: `https://uploads.meower.org/attachments/${attachments[idx]}/${fileNames[idx]}`,
                  target: "blank",
                },
                id
              ),
              button(
                {
                  class: "action",
                  onclick: (e) => {
                    e.stopPropagation();
                    attachments = attachments.filter((_, _i) => _i !== idx);
                    fileNames = fileNames.filter((_, _i) => _i !== idx);
                    document.querySelector(`[id="remove-${id}"]`).remove();
                    updateFileList(fileList);
                  },
                },
                i({ class: "fa-solid fa-x" })
              )
            )
          )
        )
      )
    );
  }
};

/**
 * @param {boolean} lurking
 * @param {HTMLInputElement} fileInput
 * @param {HTMLElement} fileList
 */
const PostBox = (lurking, fileInput, fileList) => {
  let lastTyped = 0;

  const post = textarea({
    class: "post-box",
    placeholder: "Whar's on your mind?",
    style: "font-size: 13px",
    onkeydown: async (e) => {
      if (e.key === "Enter" && !e.shiftKey && !mobile()) {
        e.preventDefault();
        send.click();
      }
      if (!lurking) {
        if (lastTyped + 3000 < Date.now()) {
          lastTyped = Date.now();
          await fetch("https://api.meower.org/home/typing", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Token: localStorage.getItem("ajs:token"),
            },
          });
        }
      }
    },
    onpaste: async (e) => {
      const file = e.clipboardData.items[0].getAsFile();
      if (file) {
        await uploadFile(file);
        fileNames.push(`${file.name} (${formatBytes(file.size)})`);
        updateFileList(fileList);
      }
    },
  });

  const upload = button(
    {
      style:
        "border-top-right-radius: 0px; border-bottom-right-radius: 0px; width: 50px",
      onclick: async () => {
        fileInput.click();
      },
    },
    fileInput,
    i({ class: "fa-solid fa-file-arrow-up" })
  );

  const send = button(
    {
      style: "border-top-left-radius: 0px; border-bottom-left-radius: 0px",
      onclick: async () => {
        send.disabled = true;
        const token = localStorage.getItem("ajs:token");

        await fetch("https://api.meower.org/home", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: token,
          },
          body: JSON.stringify({
            reply_to: replys,
            content: post.value,
            attachments,
            nonce: Math.random().toString(),
          }),
        });
        post.value = "";
        fileInput.value = null;
        replys.length = 0;
        fileNames.length = 0;
        attachments.length = 0;
        document.querySelector("#fileList").innerText = "";
        document.querySelector("#replyList").innerHTML = "";
        send.disabled = false;
      },
    },
    i({ class: "fa-solid fa-paper-plane" })
  );

  return span({ class: "post-box-wrapper" }, upload, post, send);
};

/** @param {WebSocket} connection */
const Posts = async (connection) => {
  const posts = div({ class: "posts" });

  /** @type {any[]} */
  const homePosts = (await (await fetch("https://api.meower.org/home")).json())
    .autoget;
  homePosts.reverse();
  for (const post of homePosts) {
    posts.appendChild(Post(post));
  }

  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    // TODO: implement gcs
    if (data.cmd === "post" && data.val.post_origin === "home") {
      posts.appendChild(Post(data.val));
    }
  });

  return posts;
};

const formatBytes = (n) => {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0;
  const rank = (k > 0 ? ["ki", "mi", "gi", "ti"][k - 1] : "") + "b";
  const count = Math.floor(n / Math.pow(1024, k));
  return count + rank;
};

const Settings = () => {
  const themes = select(
    {
      onchange: (e) => {
        localStorage.setItem("ajs:theme", e.target.value);
        theme = e.target.value;
        document.documentElement.dataset.theme = e.target.value;
      },
    },
    option({ value: "light" }, "ah its blinding my eyes"),
    option({ value: "dark" }, "normal people theme")
  );
  themes.querySelector(`[value=${theme}]`).setAttribute("selected", "selected");

  return dialog(
    { class: "settings" },
    span(
      { class: "settings-header" },
      h2("Settings"),
      button(
        {
          class: "action",
          onclick: () => {
            document.querySelector("dialog").close();
          },
        },
        i({ class: "fa-solid fa-x" })
      )
    ),
    p(b("Theme "), themes),
    p(
      b("Sort ulist alphabetically so i stop caring about being #1"),
      input({
        type: "checkbox",
        checked: sortUlist,
        onchange: (e) => {
          localStorage.setItem("ajs:sort-ulist", e.target.checked);
          sortUlist = e.target.checked;
          if (sortUlist === true) {
            const users = [...document.querySelectorAll(".user-list > li")].map(
              (e) => e.innerHTML.replace(", ", "")
            );
            users.sort((a, b) => a.localeCompare(b));
            const userList = document.querySelector(".user-list");
            userList.innerHTML = "";
            for (const [i, u] of users.entries()) {
              userList.append(li(u + (i === users.length - 1 ? "" : ", ")));
            }
          }
        },
      })
    ),
    p(
      b("Aaaa make post time update every second"),
      input({
        type: "checkbox",
        checked: sortUlist,
        onchange: (e) => {
          localStorage.setItem("ajs:date-update", e.target.checked);
          everySecond = e.target.checked;
        },
      })
    )
  );
};

export default async function () {
  sidebar.innerHTML = "";
  contents.innerHTML = "";
  document.body.className = "chat";

  const ws = new WebSocket("wss://server.meower.org?v=1");

  const lurking = new URLSearchParams(window.location.search).has("lurking");

  const uploadFiles = input({
    type: "file",
    hidden: "true",
    multiple: "true",
    onchange: async () => {
      for (const file of uploadFiles.files) {
        await uploadFile(file);
        fileNames.push(`${file.name} (${formatBytes(file.size)})`);
      }
      updateFileList(fileList);
    },
  });

  const fileList = span({ id: "fileList" });

  const replyList = div({
    id: "replyList",
    style: "display: flex; flex-direction: column",
  });

  ws.onopen = async () => {
    if (!lurking) {
      ws.send(
        JSON.stringify({
          cmd: "authpswd",
          val: {
            username: localStorage.getItem("ajs:user"),
            pswd: localStorage.getItem("ajs:token"),
          },
        })
      );
    }

    ws.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      if (data.cmd === "update_post") {
        const post = document.querySelector(`[id="${data.val._id}"]`);
        if (post) {
          post.querySelector(".markdown-body").innerHTML = md
            .render(data.val.p)
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
          post.querySelector(".edit-status").innerHTML = "&nbsp;(edited)";
        }
      } else if (data.cmd === "delete_post") {
        const post = document.querySelector(`[id="${data.val.post_id}"]`);
        post?.remove();
      }
    });

    contents.append(
      div(
        { class: "top-level-stuff" },
        Navbar(ws),
        UserList(ws),
        replyList,
        PostBox(lurking, uploadFiles, fileList),
        fileList
      ),
      br(),
      await Posts(ws)
    );

    contents.append(Settings());
  };
}
