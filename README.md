# Fun Fact Generator

A tiny Chromium (Chrome / Edge / Brave / Opera, Manifest V3) extension that drops a random fun fact into whatever text field you're focused on — or copies it to your clipboard if there isn't one.

## Features

- **One-click insert** — click the toolbar icon to insert a random fact at the caret in the focused `<input>`, `<textarea>`, or `contenteditable` element.
- **Keyboard shortcut** — press `Alt+Shift+Y` (Windows/Linux) or `⌥⇧Y` / `Option+Shift+Y` (macOS) to insert a fact without opening the popup.
- **Clipboard fallback** — if nothing is focused (or the page blocks scripting), the fact is copied so you can paste it with `⌘V` / `Ctrl+V`.
- **Reroll** — 🎲 button in the popup to grab a different fact.
- **No network, no tracking** — facts are bundled locally in [facts.js](facts.js).

## Install (unpacked)

### Chrome / Edge / Brave / Opera

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this folder.

> If the keyboard shortcut isn't active after loading, open `chrome://extensions/shortcuts`, find *Fun Fact Generator*, and press `Alt+Shift+Y` (`⌥⇧Y` on macOS) in the field. Chrome does not re-apply manifest-suggested shortcuts to already-installed extensions.

## Usage

- Focus a text field on any page, then either click the extension icon or press `Alt+Shift+Y` (`⌥⇧Y` on macOS).
- Open the popup and click 🎲 to reroll until you get a fact you like.
- The shortcut can be rebound at `chrome://extensions/shortcuts`.

## Project layout

| File | Purpose |
| --- | --- |
| [manifest.json](manifest.json) | MV3 manifest — permissions, background worker, popup, `Alt+Shift+Y` command. |
| [popup.html](popup.html) / [popup.css](popup.css) / [popup.js](popup.js) | Popup UI and reroll logic. |
| [background.js](background.js) | Service worker that handles the `Alt+Shift+Y` command and manages the offscreen document. |
| [offscreen.html](offscreen.html) / [offscreen.js](offscreen.js) | Hidden document the service worker uses to reach `navigator.clipboard` (needed because MV3 service workers have no DOM). |
| [shared.js](shared.js) | Shared helpers (`pickFactExcluding`, `insertIntoFocusedField`, `insertAtCursorInActiveTab`, `writeClipboardText`), imported as ES modules by the popup, background, and offscreen document. |
| [facts.js](facts.js) | The fact list — edit freely to add your own. |
| [icons/](icons) | 16 / 48 / 128 px toolbar icons. |

## Adding your own facts

Open [facts.js](facts.js) and add strings to the `FUN_FACTS` array. Reload the extension and you're done.

## Permissions

- `activeTab` + `scripting` — run the insert-at-cursor helper in the current tab when you invoke the extension.
- `offscreen` + `clipboardWrite` — copy the fact to the clipboard from a hidden extension document so the `Alt+Shift+Y` shortcut works even on protected pages (chrome://, Web Store, PDF viewer, new-tab).

No host permissions, no network, no tracking.

## License

[MIT](LICENSE) © Musfique Mahboob
