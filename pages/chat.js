import { van, sidebar, contents } from "./index.js";
import login from "./login.js";

const {
  textarea,
  ul,
  li,
  details,
  summary,
  b,
  div,
  i,
  span,
  button,
  p,
  br,
  img,
  input,
} = van.tags;

const usersTyping = {};

let replys = [];

/** @param {WebSocket} connection */
const UserList = (connection) => {
  const list = ul({ class: "user-list" });
  const userCount = span("1 user online");
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
  let attachments;

  if (data.reply_to && data.reply_to.filter((e) => e !== null).length !== 0) {
    replyBox = div(
      { class: "reply-header" },
      ...data.reply_to.map((e) => {
        // const content = e.p.slice(0, 30) + (e.p.length >= 30 ? "…" : "");
        return p(
          { class: "post", style: "padding-bottom: 10px; margin-bottom: 0px" },
          `@${e.author._id}`,
          " ",
          e.p
        );
      })
    );
  }

  if (data.attachments.length !== 0) {
    attachments = div(
      { class: "attachments" },
      ...data.attachments.map((e) =>
        img({
          src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}?preview`,
          style: "height: 20rem",
        })
      )
    );
  }

  const time = span(
    { style: "color: grey", title: new Date(data.t.e * 1000).toString() },
    "• " + timeAgo(data.t.e - 1)
  );
  setInterval(() => {
    const newTime = "• " + timeAgo(data.t.e - 1);
    if (time.innerText !== newTime) {
      time.innerText = newTime;
    }
  }, 5000);

  const avatar = img({
    height: "48",
    class: "avatar",
    width: "48",
    src: `https://uploads.meower.org/icons/${data.author.avatar}`,
  });
  avatar.onerror = () => {
    avatar.src =
      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  };

  return div(
    { class: "post", id: data._id },
    avatar,
    span(
      { style: "display: flex; flex-direction: column; width: 100%" },
      div(
        { class: "post-header" },
        span(b(data.u), " ", time),
        span(
          { style: "display: flex; gap: 10px" },
          button(
            {
              onclick: () => {
                replys.push(data._id);
                document.querySelector("#replyList").append(
                  p(
                    {
                      class: "post",
                      id: `reply-${data._id}`,
                      style:
                        "padding-bottom: 10px; margin-bottom: 0px; display: flex; justify-content: space-between",
                    },
                    span(`@${data.author._id}`, " ", data.p),
                    button(
                      {
                        onclick: (e) => {
                          const index = replys.findIndex((e) => e === data._id);
                          replys = replys
                            .slice(0, index)
                            .concat(replys.slice(index + 1));
                          document
                            .querySelector(`[id="reply-${data._id}"]`)
                            .remove();
                        },
                      },
                      i({ class: "fa-solid fa-x" })
                    )
                  )
                );
              },
            },
            i({ class: "fa-solid fa-reply" })
          ),
          data.author._id === localStorage.getItem("ajs:user")
            ? button(
                {
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
                    document.querySelector(`[id="${data._id}"]`).remove();
                  },
                },
                i({ class: "fa-solid fa-trash" })
              )
            : undefined
        )
      ),
      replyBox,
      p({
        style: "margin-top: 5px",
        innerHTML: data.p.replaceAll("\n", "<br>"),
      }),
      attachments
    )
  );
};

/**
 * @param {boolean} lurking
 * @param {HTMLInputElement} fileInput
 */
const PostBox = (lurking, fileInput) => {
  const post = textarea({
    class: "post-box",
    placeholder: "Whar's on your mind?",
  });
  post.onkeydown = async (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      typeof screen.orientation !== "undefined"
    ) {
      e.preventDefault();
      send.click();
    }
    if (!lurking) {
      await fetch("https://api.meower.org/home/typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: localStorage.getItem("ajs:token"),
        },
      });
    }
  };

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
        const token = localStorage.getItem("ajs:token");
        const attachments = [];

        for (const file of fileInput.files) {
          if (file.size > 25 << 20) {
            alert(
              `This attachment is too big. Please find a way to make it under ${byteFormatter(
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
              headers: { Authorization: token },
            })
          ).json();
          attachments.push(response.id);
        }
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
        document.querySelector("#fileList").innerText = "";
        document.querySelector("#replyList").innerHTML = "";
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
    if (data.cmd === "post") {
      posts.appendChild(Post(data.val));
    }
  });

  return posts;
};

export const byteFormatter = (n) => {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0;
  const rank = (k > 0 ? ["ki", "mi", "gi", "ti"][k - 1] : "") + "b";
  const count = Math.floor(n / Math.pow(1024, k));
  return count + rank;
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
    onchange: () => {
      fileList.innerText = `Uploading ${uploadFiles.files.length} file${
        uploadFiles.files.length > 1 ? "s" : ""
      }: ${[...uploadFiles.files]
        .map((e) => `${e.name} (${byteFormatter(e.size)})`)
        .join(", ")}`;
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
    contents.append(
      div(
        { class: "top-level-stuff" },
        Navbar(ws),
        UserList(ws),
        replyList,
        PostBox(lurking, uploadFiles),
        fileList
      ),
      br(),
      await Posts(ws)
    );
  };
}
