# Fun Fact Generator

A tiny cross-browser (Chrome / Firefox, Manifest V3) extension that drops a random fun fact into whatever text field you're focused on — or copies it to your clipboard if there isn't one.

## Features

- **One-click insert** — click the toolbar icon to insert a random fact at the caret in the focused `<input>`, `<textarea>`, or `contenteditable` element.
- **Keyboard shortcut** — press `Alt+R` to insert a fact without opening the popup.
- **Clipboard fallback** — if nothing is focused (or the page blocks scripting), the fact is copied so you can paste it with `⌘V` / `Ctrl+V`.
- **Reroll** — 🎲 button in the popup to grab a different fact.
- **No network, no tracking** — facts are bundled locally in [facts.js](facts.js).

## Install (unpacked / temporary)

### Chrome / Edge / Brave

1. Go to `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this folder.

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick [manifest.json](manifest.json).

## Usage

- Focus a text field on any page, then either click the extension icon or press `Alt+R`.
- Open the popup and click 🎲 to reroll until you get a fact you like.
- The shortcut can be rebound at `chrome://extensions/shortcuts` (or Firefox's add-on shortcut manager).

## Project layout

| File | Purpose |
| --- | --- |
| [manifest.json](manifest.json) | MV3 manifest — permissions, background worker, popup, `Alt+R` command. |
| [popup.html](popup.html) / [popup.css](popup.css) / [popup.js](popup.js) | Popup UI and reroll logic. |
| [background.js](background.js) | Service worker that handles the `Alt+R` command. |
| [shared.js](shared.js) | Shared helpers (`pickFactExcluding`, `insertIntoFocusedField`, `insertAtCursorInActiveTab`), imported as ES modules by both the popup and background. |
| [facts.js](facts.js) | The fact list — edit freely to add your own. |
| [icons/](icons) | 16 / 48 / 128 px toolbar icons. |

## Adding your own facts

Open [facts.js](facts.js) and add strings to the `FUN_FACTS` array. Reload the extension and you're done.

## Permissions

- `activeTab` + `scripting` — needed to run the insert-at-cursor helper in the current tab when you invoke the extension. No host permissions and no background page access to your browsing.

## License

[MIT](LICENSE) © Musfique Mahboob
