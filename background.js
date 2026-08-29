import { pickFactExcluding, insertAtCursorInActiveTab } from "./shared.js";

let lastFact = null;

async function copyInActiveTab(text) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id == null) return false;
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [text],
      func: (t) => navigator.clipboard.writeText(t).then(() => true).catch(() => false),
    });
    return Boolean(results && results[0] && results[0].result);
  } catch (_) {
    return false;
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert-fact") return;
  lastFact = pickFactExcluding(lastFact);
  if (await insertAtCursorInActiveTab(lastFact)) return;
  await copyInActiveTab(lastFact);
});
