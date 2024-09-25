import { van, sidebar, contents } from "./index.js";
import login from "./login.js";

const { input, ul, li, details, summary, b, div, i, span, button, p, br, img } =
  van.tags;

/** @param {WebSocket} connection */
const UserList = (connection) => {
  const list = ul({ class: "user-list" });
  const userCount = summary("1 user online");
  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.cmd === "ulist") {
      list.innerHTML = "";
      /** @type {string[]} */
      const users = data.val.split(";").slice(0, -1);
      for (const [i, user] of users.entries()) {
        list.append(li(user + (i === users.length - 1 ? "" : ", ")));
      }
      userCount.innerText = `${users.length} user${
        users.length === 1 ? "" : "s"
      } online`;
    }
  });
  return details(userCount, list);
};

/** @param {WebSocket} connection */
const TypingList = (connection) => {
  const list = p("No one is typing");
  connection.addEventListener("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.cmd === "ulist") {
      list.innerHTML = "";
      /** @type {string[]} */
      const users = data.val.split(";").slice(0, -1);
      for (const [i, user] of users.entries()) {
        list.append(li(user + (i === users.length - 1 ? "" : ", ")));
      }
      userCount.innerText = `${users.length} user${
        users.length === 1 ? "" : "s"
      } online`;
    }
  });
};

/** @param {WebSocket} connection */
const Signout = (connection) => {
  return button(
    {
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
      button(i({ class: "fa-solid fa-cog" }))
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
  if (data.reply_to) {
    replyBox = div(
      { class: "reply-header" },
      ...data.reply_to.map((e) =>
        p(
          {
            class: "post",
            onclick: () => {
              document.querySelector(`#${e._id}`).scrollIntoView();
            },
          },
          `@${e.author._id}`,
          " ",
          e.p.slice(0, 30) + "..."
        )
      )
    );
  }

  const time = span({ style: "color: grey" }, timeAgo(data.t.e - 1));
  setInterval(() => {
    time.innerText = timeAgo(data.t.e - 1);
  }, 1000);

  return div(
    { class: "post", id: data._id },
    div(
      { class: "post-header" },
      img({
        height: "30",
        width: "30",
        src: `https://uploads.meower.org/icons/${data.author.avatar}`,
      }),
      b(data.u),
      " ",
      time
    ),
    replyBox,
    p(data.p)
  );
};

const PostBox = () => {
  const post = input({
    type: "text",
    class: "post-box",
    placeholder: "Whar's on your mind?",
    onkeydown: async () => {
      await fetch("https://api.meower.org/home/typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: localStorage.getItem("ajs:token"),
        },
      });
    },
  });
  const send = button(
    {
      onclick: async () => {
        await fetch("https://api.meower.org/home", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.getItem("ajs:token"),
          },
          body: JSON.stringify({
            content: post.value,
            nonce: Math.random().toString(),
          }),
        });
        post.value = "";
      },
    },
    i({ class: "fa-solid fa-paper-plane" })
  );
  return span({ class: "post-box-wrapper" }, post, send);
};

// {"cmd": "post", "val": {"_id": "92ab07aa-cb9c-44a8-a595-45d8c38a5222", "post_origin": "home", "u": "Gamerlogan819", "t": {"e": 1727220336}, "p": "aanother screenshot from the game but its not inapproprite", "attachments": [{"id": "DPrtbw7DRkwxzYdsnbCppJer", "mime": "image/png", "filename": "image.png", "size": 515752, "width": 1342, "height": 926}], "isDeleted": false, "pinned": false, "reactions": [], "emojis": [], "stickers": [], "nonce": "0.49844779211973345", "type": 1, "post_id": "92ab07aa-cb9c-44a8-a595-45d8c38a5222", "author": {"_id": "Gamerlogan819", "uuid": "a8b7b244-6e2f-47b3-a1a2-c5c0ff393d6e", "pfp_data": 23, "flags": 0, "avatar": "GZGtDTKZGU0z0iCnIevWTFd2", "avatar_color": "000000"}, "reply_to": []}}
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
    if (data.cmd === "post") {
      posts.appendChild(Post(data.val));
    }
  });

  return posts;
};

export default async function () {
  sidebar.innerHTML = "";
  contents.innerHTML = "";
  document.body.className = "chat";
  const ws = new WebSocket("wss://server.meower.org?v=1");
  ws.onopen = async () => {
    ws.send(
      JSON.stringify({
        cmd: "authpswd",
        val: {
          username: localStorage.getItem("ajs:user"),
          pswd: localStorage.getItem("ajs:token"),
        },
      })
    );
    contents.append(
      div(
        { class: "top-level-stuff" },
        Navbar(ws),
        UserList(ws),
        br(),
        PostBox()
      ),
      br(),
      await Posts(ws)
    );
  };
}
