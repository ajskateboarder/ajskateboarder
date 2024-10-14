import { md, van } from "../index.js";
import skateboard from "../skateboard.js";
import { mobile } from "../utils.js";
import { formatBytes } from "./postbox.js";
import { settings, refs } from "./refs.js";

// prettier-ignore
const { div, p, i, a, b, h2, br, span, video, img, dialog, audio, button, source, textarea, small } = van.tags;

/** @param {number} epochTime */
const timeAgo = (epochTime) => {
  const secondsAgo = Math.floor((Date.now() - epochTime * 1000) / 1000); // Convert epoch time to milliseconds and calculate seconds ago

  if (secondsAgo < 60) {
    return `${Math.max(0, secondsAgo)} secs ago`;
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
};

/** @param {string} hex */
const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const Post = (data) => {
  let replyBox;
  let attachments;

  if (data.reply_to && data.reply_to.filter((e) => e !== null).length !== 0) {
    replyBox = div(
      { class: "reply-header", style: "display: flex; flex-direction: column" },
      ...data.reply_to.map((e) => {
        return p(
          {
            class: "post reply",
            style: "height: 40px",
          },
          i({
            class: "fa-solid fa-reply",
            style: "transform: scaleX(-1); padding: 5px",
          }),
          " ",
          b(
            { style: "max-width: 200px; min-width: fit-content" },
            `@${e.author._id} `
          ),
          span(
            {
              style: "display: block; height: 20px; overflow: hidden",
              onclick: () => {
                const post = document.querySelector(`[id="${e._id}"]`);
                if (post) {
                  post.scrollIntoView({ behavior: "smooth" });
                  post.classList.add("silly-jumpto-animation");
                  setTimeout(() => {
                    post.classList.remove("silly-jumpto-animation");
                  }, 1000);
                }
              },
            },
            e.p
          )
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
            style: "border-radius: 3px",
            onclick: () => {
              const h = dialog(
                {
                  class: "image-view",
                  style: "background: none; border: none",
                },
                span(
                  {
                    class: "settings-header",
                    style:
                      "margin-top: 10px; min-width: 200px; justify-content: right",
                  },
                  button(
                    {
                      class: "action x",
                      onclick: () => {
                        h.remove();
                      },
                    },
                    i({ class: "fa-solid fa-x" })
                  )
                ),
                br(),
                img({
                  style: "max-height: 50vw",
                  src: `https://uploads.meower.org/attachments/${e.id}/${e.filename}`,
                })
              );
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
    settings.everySecond ? 1000 : 5000
  );

  const avatar = img({
    height: "48",
    class: `avatar ${data.author._id}`,
    width: "48",
    src: `https://uploads.meower.org/icons/${data.author.avatar}`,
    onerror: () => {
      avatar.src = skateboard;
      avatar.classList.add("default-avatar");
    },
    onclick: async () => {
      const profile = await (
        await fetch(`https://api.meower.org/users/${data.author._id}`)
      ).json();
      const quote = p();
      quote.innerHTML = md(profile.quote);
      const info = span(quote);

      const color = `#${profile.avatar_color}`;
      const rgb = hexToRgb(color);
      const color1 = rgb
        ? `rgb(${Math.max(0, rgb.r - 150)}, ${Math.max(
            0,
            rgb.g - 150
          )}, ${Math.max(0, rgb.b - 150)})`
        : "black";
      const color2 = rgb
        ? `rgb(${Math.max(0, rgb.r - 200)}, ${Math.max(
            0,
            rgb.g - 200
          )}, ${Math.max(0, rgb.b - 200)})`
        : "black";

      const h = dialog(
        {
          class: "profile-view",
          style: `min-width: 25%; color: white; background: linear-gradient(to bottom right, ${color1}, ${color2}); border: 2px solid ${color}; border-radius: 10px`,
        },
        span(
          {
            class: "settings-header",
            style: "margin-top: 10px; min-width: 200px",
          },
          img({
            height: "64",
            class: `avatar ${data.author._id}`,
            width: "64",
            style: `border: 3px solid #${profile.avatar_color}`,
            src: `https://uploads.meower.org/icons/${data.author.avatar}`,
            onerror: (e) => {
              e.target.src = skateboard;
              e.target.classList.add("default-avatar");
              e.target.style.border = "none";
            },
          }),
          button(
            {
              class: "action x",
              style: "color: white",
              onclick: () => {
                h.remove();
              },
            },
            i({ class: "fa-solid fa-x" })
          )
        ),
        h2(data.author._id),
        info
      );
      window.onclick = (e) => {
        if (!e.target.closest(".profile-view")) {
          h.close();
        }
      };
      document.body.append(h);
      h.showModal();
    },
  });

  const replyToPost = () => {
    refs.replies.push(data._id);
    document.querySelector(".post-box").focus();
    document.querySelector("#replyList").append(
      p(
        {
          class: "post reply-thing",
          id: `reply-${data._id}`,
          style:
            "margin-bottom: 0px; display: flex; justify-content: space-between",
        },
        span(
          b(`@${data.author._id}`),
          " ",
          data.p.length > 50 ? data.p.slice(0, 30) + "..." : data.p
        ),
        button(
          {
            class: "action x",
            onclick: (e) => {
              const index = refs.replies.findIndex((e) => e === data._id);
              refs.replies = refs.replies
                .slice(0, index)
                .concat(refs.replies.slice(index + 1));
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
          "width: 60px; height: 40px; border: none; border-top-right-radius: 5px; border-bottom-right-radius: 5px",
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
        style: "width: 60px; height: 40px; border: none",
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
        oninput: () => {
          editText.style.height = "";
          editText.style.height = Math.max(40, editText.scrollHeight) + "px";
          submit.style.height = "";
          submit.style.height = Math.max(40, editText.scrollHeight) + "px";
          cancel.style.height = "";
          cancel.style.height = Math.max(40, editText.scrollHeight) + "px";
        },
        style:
          "border-top-left-radius: 5px; border-bottom-left-radius: 5px; padding: 5px",
        class: "post-box edit-box",
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
    editText.selectionStart = editText.value.length;
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
        innerHTML: md(data.p),
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
      Math.abs(touchendX - touchstartX) > 150 &&
      itsValid
    ) {
      post.classList.add("silly-replying-gesture");
      replyToPost();
      setTimeout(() => {
        post.classList.remove("silly-replying-gesture");
      }, 1000);
    } else if (
      touchendX > touchstartX &&
      Math.abs(touchendX - touchstartX) > 150 &&
      itsValid &&
      post.querySelector(".post-header b").innerText ===
        localStorage.getItem("ajs:user")
    ) {
      post.classList.add("silly-editing-gesture");
      await editPost({
        stopImmediatePropagation() {},
        target: post.querySelector(".edit-button"),
      });
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

/** @param {WebSocket} connection */
export const Posts = async (connection) => {
  const posts = div({ class: "posts" });
  let page = 2;
  const loadedPages = [];

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

  const loadMore = async () => {
    loadedPages.push(page);
    /** @type {any[]} */
    const morePosts = (
      await (
        await fetch(`https://api.meower.org/home?page=${page}`, {
          headers: { Token: localStorage.getItem("ajs:token") },
        })
      ).json()
    ).autoget;
    for (const post of morePosts) {
      posts.prepend(Post(post));
    }
    page++;
  };

  if (settings.infiniteScroll) {
    window.onscroll = async () => {
      if (
        window.innerHeight + Math.round(document.documentElement.scrollTop) >=
          document.body.offsetHeight - 150 &&
        !loadedPages.includes(page)
      ) {
        await loadMore();
      }
    };
  }

  return span(
    posts,
    settings.infiniteScroll
      ? button(
          {
            class: "regular-button load-more",
            style: "pointer-events: none",
          },
          i({ class: "fa-solid fa-ellipsis" })
        )
      : button(
          {
            class: "regular-button load-more",
            onclick: async (e) => {
              e.target.disabled = true;
              await loadMore();
              e.target.disabled = false;
            },
          },
          "Load more"
        )
  );
};
