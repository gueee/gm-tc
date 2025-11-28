---
name: cursor-project
description: Cursor IDE project configuration and development environment. Use when setting up workspace, configuring editor settings, managing extensions, or optimizing the development workflow. Covers .cursorrules, workspace settings, and project-specific configurations.
---

# Cursor Project

Cursor IDE configuration for gm-tc.tech development.

## Project Structure

```
gm-tc/
├── .cursor/
│   └── rules/              # Cursor AI rules
├── .cursorrules            # Main Cursor config
├── .vscode/
│   └── settings.json       # VS Code compatible settings
├── skills/                 # Claude skills (load as context)
│   ├── web-design/
│   ├── cms-development/
│   ├── git-workflow/
│   └── uberspace-deployment/
├── src/                    # Source files
├── public/                 # Static assets
└── ...
```

## .cursorrules Configuration

The `.cursorrules` file in project root configures Cursor AI behavior:

```
# Project: gm-tc.tech
# Tech stack: HTML, CSS, JavaScript, PHP (if applicable)

## Code Style
- Use semantic HTML5 elements
- CSS: BEM naming, mobile-first responsive
- JavaScript: ES6+, no jQuery unless necessary
- Prefer vanilla solutions over frameworks

## Project Context
- Website: gm-tc.tech hosted on Uberspace
- CMS: Custom backend (in development)
- Deployment: Git pull on Uberspace server

## Skills
Load these skill files for detailed context:
- skills/web-design/SKILL.md - Frontend patterns
- skills/cms-development/SKILL.md - Backend patterns
- skills/git-workflow/SKILL.md - Version control
- skills/uberspace-deployment/SKILL.md - Hosting

## Preferences
- No redundant functions or methods
- Keep code DRY (Don't Repeat Yourself)
- Comment complex logic, not obvious code
- Prefer readability over cleverness
```

## Loading Skills in Cursor

To use skills as context in Cursor:

1. **Add to Chat**: Reference skill files directly
   - Type `@skills/web-design/SKILL.md` in chat
   
2. **Include in Rules**: Reference in `.cursorrules`
   - Skills dir is auto-indexed if in project

3. **Composer Context**: Add skills folder to context when using Composer

## Recommended Extensions

- ESLint
- Prettier
- Live Server
- GitLens
- CSS Peek
- Auto Rename Tag

## Workspace Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "css.validate": true,
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "liveServer.settings.donotShowInfoMsg": true
}
```

## Git Integration

Cursor has built-in Git support:
- Source Control panel (Ctrl+Shift+G)
- Inline diff viewing
- Commit from sidebar
- Push/pull from status bar

Use Git skill commands in terminal for complex operations.
