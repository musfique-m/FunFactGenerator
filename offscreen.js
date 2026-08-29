import { writeClipboardText } from "./shared.js";

// Runs inside an offscreen document so the background service worker can
// write to the clipboard even when the active tab is a protected page.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.target !== "offscreen" || msg.type !== "copy") return;
  writeClipboardText(msg.text).then((ok) => sendResponse({ ok }));
  return true;
});
