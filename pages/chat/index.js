import { van, sidebar, contents, md } from "/pages/index.js";
import login from "/pages/login.js";
import { Posts } from "/pages/chat/post.js";

import { formatBytes, PostBox, updateFileList, uploadFile } from "./postbox.js";
import { refs, settings } from "./refs.js";
import { UserList } from "./ulist.js";

// prettier-ignore
const { li, b, div, i, span, button, p, br, input, dialog, h2, select, option } = van.tags;

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
          class: "action the-settings-button",
          onclick: () => {
            document.querySelector(".settings").showModal();
          },
        },
        i({ class: "fa-solid fa-cog" })
      )
    )
  );
};

const Settings = () => {
  const themes = select(
    {
      onchange: (e) => {
        localStorage.setItem("ajs:theme", e.target.value);
        settings.theme = e.target.value;
        document.documentElement.dataset.theme = e.target.value;
      },
    },
    option({ value: "light" }, "ah its blinding my eyes"),
    option({ value: "dark" }, "normal people theme"),
    option({ value: "darkish" }, "normal people but discord-y"),
    option({ value: "darkblue" }, "dark blue from svelte")
  );
  themes
    .querySelector(`[value=${settings.theme}]`)
    .setAttribute("selected", "selected");

  return dialog(
    { class: "settings" },
    span(
      { class: "settings-header" },
      h2("Settings"),
      button(
        {
          class: "action",
          onclick: () => {
            document.querySelector(".settings").close();
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
        checked: settings.sortUlist,
        onchange: (e) => {
          localStorage.setItem("ajs:sort-ulist", e.target.checked);
          settings.sortUlist = e.target.checked;
          if (settings.sortUlist === true) {
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
        checked: settings.everySecond,
        onchange: (e) => {
          localStorage.setItem("ajs:date-update", e.target.checked);
          settings.everySecond = e.target.checked;
        },
      })
    ),
    p(
      b("Hydraulic press"),
      input({
        type: "checkbox",
        checked: settings.compact,
        onchange: (e) => {
          localStorage.setItem("ajs:compact", e.target.checked);
          settings.compact = e.target.checked;
          document.documentElement.dataset.compact = `${settings.compact}`;
        },
      })
    ),
    p(
      b("Infinite scrolling"),
      input({
        type: "checkbox",
        checked: settings.infiniteScroll,
        onchange: (e) => {
          localStorage.setItem("ajs:infinite-scroll", e.target.checked);
          settings.infiniteScroll = e.target.checked;
        },
      })
    ),
    p("You may need to reload for some of these settings to fully apply.")
  );
};

export default async function () {
  sidebar.innerHTML = "";
  contents.innerHTML = "";
  document.body.className = "chat";
  document.body.append(span({ class: "loading" }, "loading"));
  if (settings.compact) {
    document.documentElement.dataset.compact = "true";
  }

  const ws = new WebSocket("wss://server.meower.org?v=1");

  const lurking = new URLSearchParams(window.location.search).has("lurking");

  const uploadFiles = input({
    type: "file",
    hidden: "true",
    multiple: "true",
    onchange: async () => {
      for (const file of uploadFiles.files) {
        await uploadFile(file);
        refs.fileNames.push(`${file.name} (${formatBytes(file.size)})`);
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
          post.querySelector(".markdown-body").innerHTML = md(data.val.p);
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

    document.querySelector(".loading").remove();
  };
}
