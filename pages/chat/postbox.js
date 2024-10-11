import { van } from "../index.js";
import { mobile } from "../utils.js";
import { refs } from "./refs.js";

const { textarea, button, span, a, i } = van.tags;

export const formatBytes = (n) => {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0;
  const rank = (k > 0 ? ["ki", "mi", "gi", "ti"][k - 1] : "") + "b";
  const count = Math.floor(n / Math.pow(1024, k));
  return count + rank;
};

/**
 * @param {File} file
 */
export const uploadFile = async (file) => {
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
  refs.attachments.push(response.id);
  return file.name;
};

/**
 * @param {HTMLElement} fileList
 */
export const updateFileList = (fileList) => {
  fileList.innerHTML = "";
  if (refs.fileNames.length !== 0) {
    fileList.append(
      span(
        span(
          `Uploading ${refs.fileNames.length} file${
            refs.fileNames.length > 1 ? "s" : ""
          }: `
        ),
        span(
          ...refs.fileNames.map((id, idx) =>
            span(
              { class: "file-upload", id: `remove-${id}` },
              a(
                {
                  href: `https://uploads.meower.org/attachments/${refs.attachments[idx]}/${refs.fileNames[idx]}`,
                  target: "blank",
                },
                id
              ),
              button(
                {
                  class: "action",
                  onclick: (e) => {
                    e.stopPropagation();
                    refs.attachments = refs.attachments.filter(
                      (_, _i) => _i !== idx
                    );
                    refs.fileNames = refs.fileNames.filter(
                      (_, _i) => _i !== idx
                    );
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
export const PostBox = (lurking, fileInput, fileList) => {
  let lastTyped = 0;

  const post = textarea({
    class: "post-box",
    placeholder: "Whar's on your mind?",
    oninput: () => {
      post.style.height = "";
      post.style.height = Math.max(40, post.scrollHeight) + "px";
      upload.style.height = "";
      upload.style.height = Math.max(40, post.scrollHeight) + "px";
      send.style.height = "";
      send.style.height = Math.max(40, post.scrollHeight) + "px";
    },
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
        refs.fileNames.push(`${file.name} (${formatBytes(file.size)})`);
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
            reply_to: refs.replies,
            content: post.value,
            attachments: refs.attachments,
            nonce: Math.random().toString(),
          }),
        });
        post.value = "";
        fileInput.value = null;
        refs.replies.length = 0;
        refs.fileNames.length = 0;
        refs.attachments.length = 0;
        document.querySelector("#fileList").innerText = "";
        document.querySelector("#replyList").innerHTML = "";
        send.disabled = false;
        upload.style.height = "";
        send.style.height = "";
        post.style.height = "";
      },
    },
    i({ class: "fa-solid fa-paper-plane" })
  );

  return span({ class: "post-box-wrapper" }, upload, post, send);
};
