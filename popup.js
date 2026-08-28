const statusEl = document.getElementById("status");
const factEl = document.getElementById("fact");
const hintEl = document.getElementById("hint");
const rerollBtn = document.getElementById("reroll");

let currentFact = null;

function pickFact() {
  // Avoid repeating the same fact back-to-back when possible.
  if (FUN_FACTS.length <= 1) return FUN_FACTS[0];
  let next;
  do {
    next = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
  } while (next === currentFact);
  return next;
}

// Runs in the active tab. Inserts `text` at the caret of the focused
// input/textarea/contenteditable and returns true on success.
function insertIntoFocusedField(text) {
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

async function insertAtCursor(text) {
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

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

async function showAndDeliver() {
  currentFact = pickFact();
  factEl.textContent = currentFact;
  statusEl.classList.remove("error");
  statusEl.textContent = "Working…";

  if (await insertAtCursor(currentFact)) {
    statusEl.textContent = "✓ Inserted at cursor!";
    hintEl.textContent = "Dropped into the focused text field.";
    return;
  }

  if (await copy(currentFact)) {
    statusEl.textContent = "✓ Copied to clipboard!";
    hintEl.textContent = "No text field focused — press ⌘V (or Ctrl+V) to paste.";
  } else {
    statusEl.textContent = "Couldn't insert or copy — select the text manually.";
    statusEl.classList.add("error");
    hintEl.textContent = "";
  }
}

rerollBtn.addEventListener("click", () => {
  rerollBtn.classList.remove("rolling");
  // Force reflow so the CSS animation restarts on every click.
  void rerollBtn.offsetWidth;
  rerollBtn.classList.add("rolling");
  showAndDeliver();
});

showAndDeliver();
