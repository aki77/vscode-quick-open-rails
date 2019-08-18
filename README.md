# Quick Open Rails

Quickly opening Rails project files.

## Commands

`quickOpenRails.open`

![open](https://i.gyazo.com/0c6e778233a5a9664cbc321fc03b5a9f.gif)

## Extension Settings

- `quickOpenRails.autoDetectAppDirectories`: Automatically detect directories under `app`.(default: `true`)
- `quickOpenRails.excludeAppDirectories`: (default: `["views"]`)
- `quickOpenRails.customCategories`: (default: See below)

```json
[
  {
    "label": "Layout",
    "pattern": "app/views/layouts/**/*"
  },
  {
    "label": "View",
    "pattern": "app/views/**/*",
    "exclude": "app/views/layouts/**/*"
  },
  {
    "label": "Config",
    "pattern": "config/**/*"
  },
  {
    "label": "Migration",
    "pattern": "db/migrate/**/*",
    "reverse": true
  },
  {
    "label": "Task",
    "pattern": "lib/tasks/**/*"
  },
  {
    "label": "Spec",
    "pattern": "spec/**/*"
  }
]
```

## Keymaps

No keymap by default.
