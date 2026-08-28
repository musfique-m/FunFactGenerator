const statusEl = document.getElementById("status");
const factEl = document.getElementById("fact");
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

async function showAndCopy() {
  currentFact = pickFact();
  factEl.textContent = currentFact;
  statusEl.classList.remove("error");
  statusEl.textContent = "Copying…";

  const ok = await copy(currentFact);
  if (ok) {
    statusEl.textContent = "✓ Copied to clipboard!";
  } else {
    statusEl.textContent = "Couldn't copy — select and copy manually.";
    statusEl.classList.add("error");
  }
}

rerollBtn.addEventListener("click", () => {
  rerollBtn.classList.remove("rolling");
  // Force reflow so the CSS animation restarts on every click.
  void rerollBtn.offsetWidth;
  rerollBtn.classList.add("rolling");
  showAndCopy();
});

showAndCopy();
