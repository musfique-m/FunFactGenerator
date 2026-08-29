// Shared helpers used by both the popup and the background service worker.
import { FUN_FACTS } from "./facts.js";

export function pickFactExcluding(last) {
  if (FUN_FACTS.length <= 1) return FUN_FACTS[0];
  let next;
  do {
    next = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
  } while (next === last);
  return next;
}

// Runs in the active tab. Inserts `text` at the caret of the focused
// input/textarea/contenteditable and returns true on success.
// Must be self-contained — it's serialized by chrome.scripting.executeScript.
export function insertIntoFocusedField(text) {
  function deepActive(root) {
    let el = root.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
      el = el.shadowRoot.activeElement;
    }
    return el;
  }
  const el = deepActive(document);
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    const pos = start + text.length;
    try { el.setSelectionRange(pos, pos); } catch (_) {}
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  if (el.isContentEditable) {
    el.focus();
    return document.execCommand("insertText", false, text);
  }
  return false;
}

export async function insertAtCursorInActiveTab(text) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id == null) return false;
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [text],
      func: insertIntoFocusedField,
    });
    return Boolean(results && results[0] && results[0].result);
  } catch (_) {
    return false;
  }
}

// Writes `text` to the clipboard from a document context (popup or offscreen),
// falling back to a hidden textarea + execCommand when the async API is blocked.
export async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}
