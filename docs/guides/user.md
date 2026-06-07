# User guide

## Overview

A small task app: view your todos and add new ones. Built with Material UI; fully keyboard- and screen-reader-operable.

## Getting in

Open the app at its URL (in local development: `http://localhost:5173`). The starter has no sign-in; a derived project documents its auth flow here.

## Main flows

**See your todos**

1. Go to **Todos** (top navigation, or `/todos`).
2. The list loads (you'll briefly see a loading indicator). If you have no todos yet, you'll see a friendly empty message instead of a blank screen.

**Add a todo**

1. On the Todos screen, type a title in the **"New todo"** field.
2. Press **Enter** or click **Add**. The submit button stays disabled until the field has text.
3. The new todo appears in the list.

**Mark a todo complete**

- Click (or focus and press Space) the checkbox on a todo row.

## Tips & recovery

- **Empty list:** that's expected before you add anything — use the field at the top.
- **"Couldn't load todos" error:** the backend may be unreachable; press **Retry**.
- **Keyboard:** Tab moves between the field, Add button, and each todo; Enter submits; Space toggles a checkbox. The focused element always shows a visible outline.

## Where to go next

For setup and contributing, see `docs/guides/developer.md`.
