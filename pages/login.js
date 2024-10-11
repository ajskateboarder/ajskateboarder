import chat from "/chat/index.js";
import { van, sidebar, contents } from "/index.js";

// prettier-ignore
const { div, input, h2, p, button, i, span } = van.tags;

const Login = () => {
  const username = input({ type: "text", placeholder: "Username" });
  const password = input({ type: "password", placeholder: "Password" });
  const error = span({ style: "margin-top: 5px" }, "");
  let lurking = false;

  const login = button(
    {
      class: "regular-button",
      style: "margin-top: 10px",
      onclick: async () => {
        error.innerText = "";
        const response = await fetch("https://api.meower.org/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.value,
            password: password.value,
          }),
        });
        const json = await response.json();
        if (json.error) {
          error.innerText = `Error: ${json.type}`;
          return;
        }
        localStorage.setItem("ajs:user", username.value);
        localStorage.setItem("ajs:token", json.token);
        const urlParams = new URLSearchParams(window.location.search);
        if (lurking) {
          urlParams.set("lurking", "yes");
        } else {
          urlParams.delete("lurking");
        }
        window.location.search = urlParams;
        await chat();
      },
    },
    "Login"
  );

  return div(
    { class: "login-panel" },
    h2("Welcome to ajskateboarder"),
    p(
      { style: "margin-top: 0" },
      i(
        `"The client which solves your random annoying grievances by reinventing the wheel"`
      )
    ),
    div(
      { class: "login-area" },
      div({ class: "field" }, username),
      div({ class: "field", style: "margin-top: 10px" }, password)
    ),
    login,
    error,
    span(
      input({
        type: "checkbox",
        onchange: (e) => (lurking = e.target.checked),
      }),
      span("lurk mode")
    )
  );
};

export default async function () {
  sidebar.innerHTML = "";
  contents.innerHTML = "";
  document.body.className = "login";

  contents.append(Login());
}
