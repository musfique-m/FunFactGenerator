import { pickFactExcluding, insertAtCursorInActiveTab } from "./shared.js";

const statusEl = document.getElementById("status");
const factEl = document.getElementById("fact");
const hintEl = document.getElementById("hint");
const rerollBtn = document.getElementById("reroll");

let currentFact = null;

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
  currentFact = pickFactExcluding(currentFact);
  factEl.textContent = currentFact;
  statusEl.classList.remove("error");
  statusEl.textContent = "Working…";

  if (await insertAtCursorInActiveTab(currentFact)) {
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
