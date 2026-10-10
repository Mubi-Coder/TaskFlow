# TaskFlow

A clean, responsive task management app built with **HTML, CSS, and vanilla JavaScript**. TaskFlow helps you organize tasks, track status, set priorities, and keep your day focused.

## Features

- Create tasks with a title, description, status, priority, and optional due date
- Edit and delete existing tasks
- Mark tasks complete with a checkbox or status selector
- Filter by status, priority, today, upcoming, and completed
- Search task titles and descriptions
- Sort by recently added, due date, priority, or task name
- Overview cards and daily completion progress
- Light and dark themes
- Responsive layout for desktop, tablet, and mobile
- Saves tasks and theme in browser `localStorage`
- No backend, package installation, or API keys required

## Run locally

**Option 1 — simplest:** Double-click `index.html` and open it in a modern browser.

**Option 2 — VS Code:** Open the folder in VS Code and use the Live Server extension.

**Option 3 — Python local server:**

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Keyboard shortcuts

- `Ctrl + N` — create a task
- `Ctrl + K` — focus task search
- `Esc` — close the task dialog

## Tech stack

- HTML5
- CSS3 (responsive layout, CSS variables, dark mode)
- Vanilla JavaScript
- Browser localStorage

## Project structure

```text
TaskFlow/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## Notes

- The first time you open the app, a few example tasks are added so you can explore the interface. You can delete them or clear completed tasks.
- Data is stored only in the current browser on the current device. Clearing browser site data may remove saved tasks.
- This is a front-end project; it does not include accounts, cloud sync, or a shared database.

## License

MIT — see [LICENSE](LICENSE).
