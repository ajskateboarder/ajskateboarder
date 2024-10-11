//@ts-check
import chat from "./pages/chat/index.js";
import login from "./pages/login.js";

async function main() {
  document.documentElement.dataset.theme = localStorage.getItem("ajs:theme");
  const loggedIn =
    localStorage.getItem("ajs:token") && localStorage.getItem("ajs:user");
  if (loggedIn) {
    await chat();
  } else {
    await login();
  }
}

main();