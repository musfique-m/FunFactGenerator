import { pickFactExcluding, insertAtCursorInActiveTab } from "./shared.js";

const OFFSCREEN_URL = "offscreen.html";
let creatingOffscreen = null;

async function hasOffscreenDocument() {
  if (!chrome.runtime.getContexts) return false;
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)],
  });
  return contexts.length > 0;
}

async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ["CLIPBOARD"],
    justification: "Copy the generated fun fact to the clipboard.",
  });
  try {
    await creatingOffscreen;
  } catch (err) {
    // Race: another caller may have created it first.
    if (!String(err?.message || "").includes("Only a single offscreen document")) throw err;
  } finally {
    creatingOffscreen = null;
  }
}

async function copyToClipboard(text) {
  try {
    await ensureOffscreenDocument();
    const res = await chrome.runtime.sendMessage({ target: "offscreen", type: "copy", text });
    return Boolean(res?.ok);
  } catch (_) {
    return false;
  }
}

let lastFact = null;

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "insert-fact") return;
  lastFact = pickFactExcluding(lastFact);
  // Try inserting at the caret, but always copy too so the shortcut is useful
  // even on protected pages or when no editable field is focused.
  await insertAtCursorInActiveTab(lastFact);
  await copyToClipboard(lastFact);
});
